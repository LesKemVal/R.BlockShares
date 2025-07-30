// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract RegCFToken is ERC20, AccessControlEnumerable, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 public basePrice;
    uint256 public priceSlope;
    uint256 public tokensSold;
    uint256 public maxSupply;
    uint256 public startTime;
    uint256 public endTime;

    mapping(address => uint256) public lockedUntil;

    event TokenPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event RevenueReceived(uint256 amount);
    event RevenueDistributed();

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 basePrice_,
        uint256 priceSlope_,
        uint256 maxSupply_,
        uint256 duration_
    ) ERC20(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        basePrice = basePrice_;
        priceSlope = priceSlope_;
        maxSupply = maxSupply_;

        startTime = block.timestamp;
        endTime = block.timestamp + duration_;
    }

    function buyTokens(uint256 amount) external payable whenNotPaused {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Funding closed");
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

    // Only callable by Platform Treasury to send revenue into the contract
    receive() external payable {
        emit RevenueReceived(msg.value);
    }

    function distributeRevenue() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No revenue to distribute");

        // Send full balance to the admin (for now) – can be updated for full holder distribution
        payable(getRoleMember(DEFAULT_ADMIN_ROLE, 0)).transfer(balance);

        emit RevenueDistributed();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        require(block.timestamp >= lockedUntil[from], "Tokens locked for 12 months");
        super._beforeTokenTransfer(from, to, amount);
    }
}
