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

    uint256 public cap;
    uint256 public tokenPrice;
    address public fundingWallet;
    address public platformFeeWallet;

    uint256 public constant BASE_MINT_FEE_BPS = 200;
    mapping(address => bool) public feeExempt;

    uint256 public fundingStart;
    uint256 public fundingEnd;

    address public koreOperator;
    mapping(address => bool) public whitelisted;

    bool public bondingCurveEnabled;
    bool private bondingCurveLocked;

    event TokensMinted(address indexed minter, uint256 amount, uint256 feeAmount);
    event FundingWindowUpdated(uint256 newStart, uint256 newEnd);
    event RolloverTriggered(address indexed originalProject, address indexed rolloverProject);

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
        feeExempt[msg.sender] = true;

        bondingCurveEnabled = true;
        bondingCurveLocked = false;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner() || msg.sender == koreOperator, "Not authorized");
        _;
    }

    function setKoreOperator(address _koreOperator) external onlyOwner {
        require(_koreOperator != address(0), "Invalid address");
        koreOperator = _koreOperator;
    }

    function addToWhitelist(address _addr) external onlyAdmin {
        whitelisted[_addr] = true;
    }

    function removeFromWhitelist(address _addr) external onlyAdmin {
        whitelisted[_addr] = false;
    }

    function setFeeExempt(address account, bool exempt) external onlyOwner {
        feeExempt[account] = exempt;
    }

    function setFundingWindow(uint256 _start, uint256 _end) external onlyOwner {
        require(_end > _start, "End must be after start");
        fundingStart = _start;
        fundingEnd = _end;
        emit FundingWindowUpdated(_start, _end);
    }

    function toggleBondingCurve(bool enabled) external onlyOwner {
        require(!bondingCurveLocked, "Bonding curve toggle locked after mint");
        bondingCurveEnabled = enabled;
    }

    function mintTokens(uint256 amount, bool payFullFee) external whenNotPaused {
        require(block.timestamp >= fundingStart && block.timestamp <= fundingEnd, "Not in funding window");
        require(totalSupply() + amount <= cap, "Cap exceeded");
        require(whitelisted[msg.sender], "Address not whitelisted");

        if (!bondingCurveLocked) {
            bondingCurveLocked = true;
        }

        uint256 feeBps = 0;
        if (!feeExempt[msg.sender]) {
            feeBps = payFullFee ? BASE_MINT_FEE_BPS : BASE_MINT_FEE_BPS / 2;
        }

        uint256 feeAmount = amount.mul(feeBps).div(10_000);
        uint256 netAmount = amount.sub(feeAmount);
        uint256 finalAmount = netAmount;

        if (bondingCurveEnabled) {
            uint256 multiplier = (totalSupply().mul(1e18).div(cap)).add(1e18);
            finalAmount = netAmount.mul(multiplier).div(1e18);
        }

        _mint(msg.sender, finalAmount);
        if (feeAmount > 0) {
            _mint(platformFeeWallet, feeAmount);
        }

        emit TokensMinted(msg.sender, finalAmount, feeAmount);
    }

    function buyTokens() external payable whenNotPaused {
        require(block.timestamp >= fundingStart && block.timestamp <= fundingEnd, "Not in funding window");
        require(msg.value > 0, "No ETH sent");

        uint256 tokensToBuy = msg.value.div(tokenPrice);
        require(totalSupply() + tokensToBuy <= cap, "Cap exceeded");
        require(whitelisted[msg.sender], "Address not whitelisted");

        _mint(msg.sender, tokensToBuy);
        payable(fundingWallet).transfer(msg.value);
    }

    function burn(uint256 amount) external whenNotPaused {
        _burn(msg.sender, amount);
    }

    function adminTransfer(address from, address to, uint256 amount) external onlyAdmin {
        _transfer(from, to, amount);
    }

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    function triggerRollover(address rolloverProject) external onlyOwner {
        emit RolloverTriggered(address(this), rolloverProject);
    }
}
