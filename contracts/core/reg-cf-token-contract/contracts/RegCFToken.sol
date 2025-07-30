// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract RegCFToken is ERC20, AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    address public admin; // Platform admin (Kore or you)
    bool public offeringClosed = false;

    uint256 public basePrice;
    uint256 public priceSlope;
    uint256 public tokensSold;
    uint256 public maxSupply;
    uint256 public startTime;
    uint256 public endTime;

    mapping(address => bool) public whitelisted; // Kore-approved investors
    mapping(address => uint256) public lockedUntil;

    event TokenPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event RevenueReceived(uint256 amount);
    event RevenueDistributed(uint256 totalDistributed);
    event WhitelistUpdated(address indexed investor, bool approved);
    event OfferingClosed(bool success);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 basePrice_,
        uint256 priceSlope_,
        uint256 maxSupply_,
        uint256 duration_
    ) ERC20(name_, symbol_) {
        admin = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);

        basePrice = basePrice_;
        priceSlope = priceSlope_;
        maxSupply = maxSupply_;

        startTime = block.timestamp;
        endTime = block.timestamp + duration_;
    }

    // Admin adds or removes investors
    function updateWhitelist(address investor, bool approved) external onlyRole(ADMIN_ROLE) {
        whitelisted[investor] = approved;
        emit WhitelistUpdated(investor, approved);
    }

    function buyTokens(uint256 amount) external payable whenNotPaused {
        require(!offeringClosed, "Offering is closed");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Funding closed");
        require(whitelisted[msg.sender], "Not approved by Kore");
        require(totalSupply() + amount <= maxSupply, "Exceeds supply");

        uint256 cost = calculatePrice(amount);
        require(msg.value >= cost, "Insufficient payment");

        tokensSold += amount;
        _mint(msg.sender, amount);

        // Lock tokens for 12 months (Reg CF compliance)
        lockedUntil[msg.sender] = block.timestamp + 365 days;

        emit TokenPurchased(msg.sender, amount, cost);
    }

    function calculatePrice(uint256 amount) public view returns (uint256) {
        return basePrice + (priceSlope * tokensSold * amount) / 1e18;
    }

    // Admin closes the offering (Kore/BD approval)
    function closeOffering(bool success) external onlyRole(ADMIN_ROLE) {
        offeringClosed = true;
        emit OfferingClosed(success);

        if (success) {
            // transfer funds to admin (escrow agent)
            payable(admin).transfer(address(this).balance);
        } else {
            // Refund investors (off-chain Kore refund process)
            // Future: add direct refund logic here
        }
    }

    // Treasury deposits revenue later
    receive() external payable {
        emit RevenueReceived(msg.value);
    }

    function distributeRevenue() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No revenue to distribute");

        // For MVP: send all revenue to admin (will handle payouts)
        payable(admin).transfer(balance);

        emit RevenueDistributed(balance);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if (from != address(0)) {
            require(block.timestamp >= lockedUntil[from], "Tokens locked for 12 months");
        }
        super._beforeTokenTransfer(from, to, amount);
    }
}
