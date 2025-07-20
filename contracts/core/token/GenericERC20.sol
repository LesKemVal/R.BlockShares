// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GenericERC20
 * @notice Base ERC20 token with burnable, pausable, and permit features.
 */
contract GenericERC20 is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
    /**
     * @notice Initializes the token with name, symbol, and owner.
     * @param name Token name
     * @param symbol Token symbol
     * @param owner Address that will be granted ownership
     */
    constructor(
        string memory name,
        string memory symbol,
        address owner
    ) ERC20(name, symbol) ERC20Permit(name) {
        require(owner != address(0), "Invalid owner");
        _transferOwnership(owner);
    }

    /// @notice Pause token transfers (only owner)
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Unpause token transfers (only owner)
    function unpause() public onlyOwner {
        _unpause();
    }

    /// @dev Hook that is called before any transfer of tokens
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}

