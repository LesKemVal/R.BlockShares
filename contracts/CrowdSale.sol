// SPDX-License-Identifier: FSL-1.1-MIT
// SettleMint.com

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

abstract contract CrowdSale is Context, Pausable {
    IERC20 public token;
    address payable public wallet;
    uint256 public usdRate;
    address public priceFeed;
    uint256 public vestingEndDate;
    address public vestingVault;

    event TokensPurchased(address indexed purchaser, uint256 amount);
    event FundsForwarded(address indexed to, uint256 value);

    constructor(
        address _priceFeed,
        address _token,
        address payable _wallet,
        uint256 _usdRate,
        uint256 _vestingEndDate,
        address _vestingVault
    ) {
        require(_token != address(0), "Token address is zero");
        require(_wallet != address(0), "Wallet address is zero");

        priceFeed = _priceFeed;
        token = IERC20(_token);
        wallet = _wallet;
        usdRate = _usdRate;
        vestingEndDate = _vestingEndDate;
        vestingVault = _vestingVault;
    }

    function _processPurchase(address beneficiary, uint256 tokenAmount) internal virtual {
        require(token.transfer(beneficiary, tokenAmount), "Token transfer failed");
        emit TokensPurchased(beneficiary, tokenAmount);
    }

    function _handleVesting(address beneficiary, uint256 tokenAmount) internal virtual {
        if (vestingEndDate > block.timestamp && vestingVault != address(0)) {
            require(token.transfer(vestingVault, tokenAmount), "Vesting transfer failed");
        } else {
            require(token.transfer(beneficiary, tokenAmount), "Immediate transfer failed");
        }
    }

    function _forwardFunds() internal {
        wallet.transfer(msg.value);
        emit FundsForwarded(wallet, msg.value);
    }
}
