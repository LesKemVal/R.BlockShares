// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title BusinessFranchiseToken
 * @notice Kore-compatible franchise token with escrow handling and revenue distribution.
 */
contract BusinessFranchiseToken is ERC20, AccessControl, Pausable {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant KORE_OPERATOR_ROLE = keccak256("KORE_OPERATOR_ROLE");

    // Core token parameters
    uint256 public maxSupply;
    address public escrowWallet;

    // Funding window
    uint256 public fundingStart;
    uint256 public fundingEnd;

    // Bonding curve state
    bool public bondingCurveEnabled;
    bool public bondingCurveLocked;

    // Events (for Kore integration + investor reporting)
    event FundingWindowSet(uint256 start, uint256 end);
    event EscrowWalletUpdated(address indexed escrowWallet);
    event RevenueReceived(uint256 amount);
    event RevenueDistributed(uint256 total);
    event BondingCurveToggled(bool enabled, bool locked);

    /**
     * @dev Constructor: sets core params and grants admin/operator roles.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        address escrowWallet_
    ) ERC20(name_, symbol_) {
        maxSupply = maxSupply_;
        escrowWallet = escrowWallet_;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(KORE_OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice Kore operator sets the funding window.
     */
    function setFundingWindow(uint256 start, uint256 end)
        external
        onlyRole(KORE_OPERATOR_ROLE)
    {
        fundingStart = start;
        fundingEnd = end;
        emit FundingWindowSet(start, end);
    }

    /**
     * @notice Kore operator can update the escrow wallet address.
     */
    function setEscrowWallet(address newEscrow)
        external
        onlyRole(KORE_OPERATOR_ROLE)
    {
        require(newEscrow != address(0), "Invalid escrow address");
        escrowWallet = newEscrow;
        emit EscrowWalletUpdated(newEscrow);
    }

    /**
     * @notice Kore operator can toggle bonding curve and optionally lock it permanently.
     */
    function toggleBondingCurve(bool enable, bool lockForever)
        external
        onlyRole(KORE_OPERATOR_ROLE)
    {
        require(!bondingCurveLocked, "Bonding curve locked");
        bondingCurveEnabled = enable;

        if (lockForever) {
            bondingCurveLocked = true;
        }
        emit BondingCurveToggled(enable, bondingCurveLocked);
    }

    /**
     * @dev Called when revenue is received by the contract.
     */
    receive() external payable {
        emit RevenueReceived(msg.value);
    }

    /**
     * @notice Distributes revenue to all token holders (pro-rata).
     */
    function distributeRevenue() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No revenue to distribute");
        uint256 totalSupply_ = totalSupply();
        require(totalSupply_ > 0, "No tokens minted");

        // Simplified revenue distribution: entire amount to escrow admin
        payable(escrowWallet).transfer(balance);

        emit RevenueDistributed(balance);
    }

    /**
     * @notice Kore operator can mint tokens up to max supply.
     */
    function mintTokens(address to, uint256 amount)
        external
        onlyRole(KORE_OPERATOR_ROLE)
    {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @notice Pauses transfers.
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses transfers.
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Hook to block transfers when paused.
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
    {
        require(!paused(), "Token transfers paused");
        super._beforeTokenTransfer(from, to, amount);
    }
}
