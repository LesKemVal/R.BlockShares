// SPDX-License-Identifier: FSL-1.1-MIT
// SettleMint.com

pragma solidity ^0.8.24;

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { AggregatorV3Interface } from "./AggregatorV3Interface.sol";
import { VestingVault } from "./VestingVault.sol";
import { ICrowdSale } from "./ICrowdSale.sol";

/// @title CrowdSale
contract CrowdSale is Context, ERC165, Pausable, AccessControl, ReentrancyGuard, ICrowdSale {
    bytes32 public constant WHITELISTED_ROLE = keccak256("WHITELISTED_ROLE");

    IERC20 private _token;
    AggregatorV3Interface internal priceFeed;
    uint256 private _usdRate;
    address payable private _wallet;
    uint256 private _fundsRaised;
    uint256 private _vestingEndDate;
    VestingVault private _vestingVault;

    struct Vesting {
        uint256 amount;
        uint256 cliff;
    }

    mapping(address => Vesting) private _vested;

    constructor(
        address priceFeed_,
        address token_,
        address payable wallet_,
        uint256 usdRate_,
        uint256 vestingEndDate_,
        address vestingVault_
    ) {
        require(wallet_ != address(0), "Crowdsale: wallet is the zero address");
        require(token_ != address(0), "Crowdsale: token is the zero address");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        priceFeed = AggregatorV3Interface(priceFeed_);
        _token = IERC20(token_);
        _wallet = wallet_;
        _usdRate = usdRate_;
        _vestingEndDate = vestingEndDate_;
        _vestingVault = VestingVault(vestingVault_);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, AccessControl) returns (bool) {
        return interfaceId == type(ICrowdSale).interfaceId || super.supportsInterface(interfaceId);
    }

    fallback() external payable {
        buyTokens(_msgSender());
    }

    receive() external payable {
        buyTokens(_msgSender());
    }

    function pause() public whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public whenPaused onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function token() public view override returns (IERC20) {
        return _token;
    }

    function wallet() public view override returns (address payable) {
        return _wallet;
    }

    function fundsRaised() public view override returns (uint256) {
        return _fundsRaised;
    }

    function tokensAvailable() public view override returns (uint256) {
        return token().balanceOf(address(this));
    }

    function externalBuyTokens(
        address beneficiary,
        uint256 tokenAmount
    )
        public
        override
        nonReentrant
        whenNotPaused
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        uint256 weiAmount = getWeiAmount(tokenAmount);
        preValidatePurchase(beneficiary, weiAmount);
        _fundsRaised += weiAmount;
        processPurchase(beneficiary, tokenAmount);
        emit TokensPurchased(_msgSender(), beneficiary, weiAmount, tokenAmount);
        updatePurchasingState(beneficiary, weiAmount);
        postValidatePurchase(beneficiary, weiAmount);
    }

    function buyTokens(address beneficiary)
        public
        payable
        override
        nonReentrant
        whenNotPaused
        onlyRole(WHITELISTED_ROLE)
    {
        uint256 weiAmount = msg.value;
        preValidatePurchase(beneficiary, weiAmount);

        uint256 tokenAmount = getTokenAmount(weiAmount);
        _fundsRaised += weiAmount;
        processPurchase(beneficiary, tokenAmount);
        emit TokensPurchased(_msgSender(), beneficiary, weiAmount, tokenAmount);
        updatePurchasingState(beneficiary, weiAmount);
        forwardFunds();
        postValidatePurchase(beneficiary, weiAmount);
    }

    function preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        require(beneficiary != address(0), "Crowdsale: beneficiary is the zero address");
        require(weiAmount != 0, "Crowdsale: amount is 0");
        this;
    }

    function processPurchase(address beneficiary, uint256 tokenAmount) internal {
        if (_vestingEndDate > 0) {
            _vestingVault.addBeneficiary(beneficiary, _vestingEndDate, tokenAmount);
            deliverTokens(address(_vestingVault), tokenAmount);
        } else {
            deliverTokens(beneficiary, tokenAmount);
        }
    }

    function deliverTokens(address beneficiary, uint256 tokenAmount) internal {
        require(_token.transfer(beneficiary, tokenAmount), "Transfer unsuccessful");
    }

    function postValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        // Optional override
    }

    function updatePurchasingState(address beneficiary, uint256 weiAmount) internal {
        // Optional override
    }

    function getTokenAmount(uint256 weiAmount) public view returns (uint256) {
        if (address(priceFeed) != address(0)) {
            (, int256 price,,,) = priceFeed.latestRoundData();
            return ((weiAmount * uint256(price)) * _usdRate) / 10 ** 8;
        }
        return ((weiAmount * 10) * _usdRate); // fallback rate
    }

    function getWeiAmount(uint256 tokenAmount) public view returns (uint256) {
        if (address(priceFeed) != address(0)) {
            (, int256 price,,,) = priceFeed.latestRoundData();
            return (tokenAmount * 10 ** 8) / (uint256(price) * _usdRate);
        }
        return ((tokenAmount * _usdRate) / 10); // fallback rate
    }

    function forwardFunds() internal {
        _wallet.transfer(msg.value);
    }
}
