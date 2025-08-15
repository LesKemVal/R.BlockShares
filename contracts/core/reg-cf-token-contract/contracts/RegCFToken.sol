// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * RegCFToken
 * - Minimal revenue-share style ERC20 for demo purposes.
 * - Pricing uses a simple linear curve (basePrice + slope * tokensSold * amount / 1e18).
 * - 12-month transfer lock per investor after purchase (Reg CF style restriction).
 * - Revenue distribution currently routes to admin (demo); a BD/TA would handle real payouts off-chain.
 */
contract RegCFToken is ERC20, AccessControlEnumerable, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Simple pricing parameters
    uint256 public basePrice;   // in wei
    uint256 public priceSlope;  // in wei per token (scaled by 1e18 in formula)
    uint256 public tokensSold;  // raw token units (18 decimals)
    uint256 public maxSupply;   // cap

    // Offering window
    uint256 public startTime;
    uint256 public endTime;

    // Per-address lock (12 months) from last purchase
    mapping(address => uint256) public lockedUntil;

    // Events
    event TokenPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event RevenueReceived(uint256 amount);
    event RevenueDistributed(uint256 amount);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 basePrice_,         // e.g. 0.01 ETH in wei
        uint256 priceSlope_,        // slope in wei scaled for 18-dec math
        uint256 maxSupply_,         // max token supply (18 decimals)
        uint256 durationSeconds_    // offering duration in seconds
    ) ERC20(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        basePrice = basePrice_;
        priceSlope = priceSlope_;
        maxSupply = maxSupply_;

        startTime = block.timestamp;
        endTime = block.timestamp + durationSeconds_;
    }

    /**
     * @dev View price for a given amount using linear formula.
     * amount should be in 18-dec token units (e.g. 5e18 for 5 tokens).
     */
    function calculatePrice(uint256 amount) public view returns (uint256) {
        // basePrice + (priceSlope * tokensSold * amount) / 1e18
        // (tokensSold and amount are 1e18-based)
        return basePrice + (priceSlope * tokensSold * amount) / 1e18;
    }

    function buyTokens(uint256 amount) external payable whenNotPaused {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Funding closed");
        require(totalSupply() + amount <= maxSupply, "Exceeds supply");

        uint256 cost = calculatePrice(amount);
        require(msg.value >= cost, "Insufficient payment");

        tokensSold += amount;
        _mint(msg.sender, amount);

        // Lock tokens for 12 months (Reg CF-style restriction)
        lockedUntil[msg.sender] = block.timestamp + 365 days;

        // If user overpays, leave excess in contract (demo). A production flow
        // would refund excess or compute exact price per-tranche.
        emit TokenPurchased(msg.sender, amount, cost);
    }

    // Receive platform revenue (demo)
    receive() external payable {
        emit RevenueReceived(msg.value);
    }

    // Distribute revenue (demo): route to admin wallet (index 0)
    function distributeRevenue() external onlyRole(ADMIN_ROLE) {
        uint256 bal = address(this).balance;
        require(bal > 0, "No revenue to distribute");

        payable(getRoleMember(DEFAULT_ADMIN_ROLE, 0)).transfer(bal);
        emit RevenueDistributed(bal);
    }

    // Enforce pause + lock-up
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        super._beforeTokenTransfer(from, to, amount);
        if (from != address(0) && to != address(0)) {
            require(!paused(), "Pausable: paused");
            require(block.timestamp >= lockedUntil[from], "Tokens locked for 12 months");
        }
    }
}

