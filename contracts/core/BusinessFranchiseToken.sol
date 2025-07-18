/**
 * # Kore Compliance Role Review Request
 *
 * Dear Kore Compliance Team,
 *
 * Please review the roles defined in this contract, specifically:
 * - `koreOperator`: authorized to manage whitelist and admin compliance operations.
 * - `whitelisted`: addresses approved to participate in funding and token minting.
 *
 * These roles ensure regulatory compliance and controlled access.
 *
 * Please advise on any improvements or concerns.
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/// @title Business Franchise Token compliant with Kore standards
/// @notice Implements capped ERC20 token with funding window, mint fees, bonding curve toggle,
///         whitelist, pausable, rollover logic placeholder, and admin controls.
/// @dev Fee settlement success fee is handled off-chain with Kore broker-dealer involvement.
contract BusinessFranchiseToken is ERC20, Ownable, Pausable {
    using SafeMath for uint256;

    /// @notice Maximum total token supply
    uint256 public cap;

    /// @notice Price per token (in wei)
    uint256 public tokenPrice;

    /// @notice Address where funding payments are collected
    address public fundingWallet;

    /// @notice Platform fee wallet receiving mint fees
    address public platformFeeWallet;

    /// @notice Base mint fee in basis points (2% default)
    uint256 public constant BASE_MINT_FEE_BPS = 200;

    /// @notice Mapping to track addresses exempt from mint fees (e.g., platform owner)
    mapping(address => bool) public feeExempt;

    /// @notice Funding window start timestamp (unix epoch)
    uint256 public fundingStart;

    /// @notice Funding window end timestamp (unix epoch)
    uint256 public fundingEnd;

    /// @notice Kore Operator address authorized for compliance operations (whitelist, admin)
    address public koreOperator;

    /// @notice Whitelist for compliance: approved addresses allowed to participate
    mapping(address => bool) public whitelisted;

    /// @notice Flag indicating if bonding curve logic is active for this issuance
    bool public bondingCurveEnabled;

    /// @notice Flag to lock bonding curve toggle after first mint
    bool private bondingCurveLocked;

    /// @notice Event emitted when tokens are minted
    /// @param minter Address that minted tokens
    /// @param amount Number of tokens minted (net of fees)
    /// @param feeAmount Mint fee tokens sent to platform wallet
    event TokensMinted(address indexed minter, uint256 amount, uint256 feeAmount);

    /// @notice Event emitted when funding window is updated
    event FundingWindowUpdated(uint256 newStart, uint256 newEnd);

    /// @notice Event emitted when rollover is triggered
    /// @param originalProject Address of the original project/token contract
    /// @param rolloverProject Address of the project tokens will rollover into
    event RolloverTriggered(address indexed originalProject, address indexed rolloverProject);

    /// @notice Constructor sets initial parameters and mints initial supply to deployer
    /// @param name_ Token name
    /// @param symbol_ Token symbol
    /// @param initialSupply_ Initial tokens minted to deployer
    /// @param cap_ Max token supply cap
    /// @param price_ Token price per unit (in wei)
    /// @param fundingWallet_ Wallet collecting funding payments
    /// @param platformFeeWallet_ Wallet collecting platform mint fees
    /// @param fundingStart_ Funding window start timestamp
    /// @param fundingEnd_ Funding window end timestamp
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint256 cap_,
        uint256 price_,
        address fundingWallet_,
        address platformFeeWallet_,
        uint256 fundingStart_,
        uint256 fundingEnd_
    )
        ERC20(name_, symbol_)
    {
        require(cap_ >= initialSupply_, "Cap less than initial supply");
        require(fundingEnd_ > fundingStart_, "Invalid funding window");

        cap = cap_;
        tokenPrice = price_;
        fundingWallet = fundingWallet_;
        platformFeeWallet = platformFeeWallet_;
        fundingStart = fundingStart_;
        fundingEnd = fundingEnd_;

        _mint(msg.sender, initialSupply_);

        feeExempt[msg.sender] = true; // Platform owner exempt from fees

        bondingCurveEnabled = true; // Default: bonding curve ON
        bondingCurveLocked = false; // Allow toggle before first mint
    }

    /// @notice Modifier to restrict calls to owner or Kore operator
    modifier onlyAdmin() {
        require(msg.sender == owner() || msg.sender == koreOperator, "Not authorized");
        _;
    }

    /// @notice Set Kore Operator address authorized for compliance management
    /// @dev Kore team should review this role to ensure proper compliance controls
    /// @param _koreOperator New koreOperator address
    function setKoreOperator(address _koreOperator) external onlyOwner {
        require(_koreOperator != address(0), "Invalid address");
        koreOperator = _koreOperator;
    }

    /// @notice Add address to whitelist, allowing participation
    /// @param _addr Address to whitelist
    function addToWhitelist(address _addr) external onlyAdmin {
        whitelisted[_addr] = true;
    }

    /// @notice Remove address from whitelist, blocking participation
    /// @param _addr Address to remove
    function removeFromWhitelist(address _addr) external onlyAdmin {
        whitelisted[_addr] = false;
    }

    /// @notice Set fee exemption for an address (e.g., platform owner)
    /// @param account Address to exempt or not
    /// @param exempt True to exempt from mint fees
    function setFeeExempt(address account, bool exempt) external onlyOwner {
        feeExempt[account] = exempt;
    }

    /// @notice Update funding window timestamps
    /// @param _start New funding start timestamp
    /// @param _end New funding end timestamp
    function setFundingWindow(uint256 _start, uint256 _end) external onlyOwner {
        require(_end > _start, "End must be after start");
        fundingStart = _start;
        fundingEnd = _end;

        emit FundingWindowUpdated(_start, _end);
    }

    /// @notice Enable or disable bonding curve logic before any minting occurs
    /// @param enabled True to enable bonding curve, false to disable
    /// @dev Once minting starts, this toggle is locked to prevent manipulation
    function toggleBondingCurve(bool enabled) external onlyOwner {
        require(!bondingCurveLocked, "Bonding curve toggle locked after mint");
        bondingCurveEnabled = enabled;
    }

    /// @notice Mint tokens, applying fees and bonding curve if enabled
    /// @param amount Number of tokens to mint (gross amount)
    /// @param payFullFee True to pay full mint fee upfront, false to pay half upfront
    function mintTokens(uint256 amount, bool payFullFee) external whenNotPaused {
        require(block.timestamp >= fundingStart && block.timestamp <= fundingEnd, "Not in funding window");
        require(totalSupply() + amount <= cap, "Cap exceeded");
        require(whitelisted[msg.sender], "Address not whitelisted");

        // Lock bonding curve toggle on first mint
        if (!bondingCurveLocked) {
            bondingCurveLocked = true;
        }

        uint256 feeBps = 0;
        if (!feeExempt[msg.sender]) {
            feeBps = payFullFee ? BASE_MINT_FEE_BPS : BASE_MINT_FEE_BPS / 2;
        }

        // Apply bonding curve multiplier if enabled
        uint256 effectiveAmount = amount;
        if (bondingCurveEnabled) {
            // For demo: bonding curve multiplier increases linearly with totalSupply
            // Formula: effectiveAmount = amount * (1 + totalSupply / cap)
            // This means price increases as more tokens are minted (simplified curve)
            uint256 multiplier = (totalSupply().mul(1e18).div(cap)).add(1e18); // scaled by 1e18
            effectiveAmount = amount.mul(multiplier).div(1e18);
        }

        uint256 feeAmount = effectiveAmount.mul(feeBps).div(10_000);
        uint256 netAmount = effectiveAmount.sub(feeAmount);

        // Mint net tokens to minter
        _mint(msg.sender, netAmount);

        // Mint fee tokens to platform wallet if applicable
        if (feeAmount > 0) {
            _mint(platformFeeWallet, feeAmount);
        }

        emit TokensMinted(msg.sender, netAmount, feeAmount);
    }

    /// @notice Buy tokens with ETH during funding window
    function buyTokens() external payable whenNotPaused {
        require(block.timestamp >= fundingStart && block.timestamp <= fundingEnd, "Not in funding window");
        require(msg.value > 0, "No ETH sent");

        // Calculate tokens based on price per token
        uint256 tokensToBuy = msg.value.div(tokenPrice);
        require(totalSupply() + tokensToBuy <= cap, "Cap exceeded");
        require(whitelisted[msg.sender], "Address not whitelisted");

        _mint(msg.sender, tokensToBuy);

        // Transfer ETH to funding wallet
        payable(fundingWallet).transfer(msg.value);
    }

    /// @notice Burn tokens to reduce total supply
    /// @param amount Number of tokens to burn
    function burn(uint256 amount) external whenNotPaused {
        _burn(msg.sender, amount);
    }

    /// @notice Admin transfer tokens from one account to another
    /// @param from Source address
    /// @param to Destination address
    /// @param amount Number of tokens to transfer
    function adminTransfer(address from, address to, uint256 amount) external onlyAdmin {
        _transfer(from, to, amount);
    }

    /// @notice Pause contract operations (buying, minting)
    function pause() external onlyAdmin {
        _pause();
    }

    /// @notice Unpause contract operations
    function unpause() external onlyAdmin {
        _unpause();
    }

    // ---------------- ROLLOVER LOGIC -------------------

    /// @notice Placeholder: Investors’ funds rollover if funding fails
    /// @dev Implement off-chain matching of similar projects, then trigger rollover on-chain
    /// @param rolloverProject Address of project tokens to rollover investments into
    function triggerRollover(address rolloverProject) external onlyOwner {
        // TODO: Actual rollover logic to handle investor balances, refund or reallocation

        emit RolloverTriggered(address(this), rolloverProject);
    }
}
