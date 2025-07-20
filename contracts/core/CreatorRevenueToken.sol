// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CreatorRevenueToken is ERC20, Ownable {
    address public platformFeeWallet;
    uint256 public platformFeeBasisPoints; // e.g. 200 = 2%

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        address platformFeeWallet_,
        uint256 platformFeeBasisPoints_
    )
        ERC20(name_, symbol_)
    {
        require(owner_ != address(0), "Invalid owner");
        require(platformFeeBasisPoints_ <= 10_000, "Fee must be <= 100%");

        _transferOwnership(owner_);
        platformFeeWallet = platformFeeWallet_;
        platformFeeBasisPoints = platformFeeBasisPoints_;
    }

    /// @notice Mint tokens with platform fee on mint value (assumes 1 token = 1 unit price for simplicity)
    function mint(address to, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");

        // Calculate platform fee (on amount value)
        uint256 platformFee = (amount * platformFeeBasisPoints) / 10_000;
        uint256 netAmount = amount - platformFee;

        require(netAmount > 0, "Net amount must be > 0");

        // Mint net amount to recipient
        _mint(to, netAmount);

        // Mint platform fee to platform wallet
        if (platformFee > 0 && platformFeeWallet != address(0)) {
            _mint(platformFeeWallet, platformFee);
        }
    }

    /// @notice Owner can update platform fee params
    function setPlatformFee(address feeWallet, uint256 feeBasisPoints) external onlyOwner {
        require(feeBasisPoints <= 10_000, "Fee too high");
        platformFeeWallet = feeWallet;
        platformFeeBasisPoints = feeBasisPoints;
    }
}
