// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CreateToken is ERC20, Ownable {
    uint256 public maxSupply;
    bool public mintable;
    bool public burnable;
    uint256 public buyTaxBps;
    uint256 public sellTaxBps;
    address public taxCollector;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        uint8, // category unused
        uint8, // instrument unused
        uint256 _maxSupply,
        bool _mintable,
        bool _burnable,
        address creator,
        uint256 _buyTaxBps,
        uint256 _sellTaxBps,
        address _taxCollector
    )
        ERC20(name, symbol)
        Ownable()
    {
        transferOwnership(creator);
        _mint(creator, initialSupply * 10 ** uint256(decimals_));
        maxSupply = _maxSupply;
        mintable = _mintable;
        burnable = _burnable;
        buyTaxBps = _buyTaxBps;
        sellTaxBps = _sellTaxBps;
        taxCollector = _taxCollector;
    }

    function _transfer(address from, address to, uint256 amount) internal override {
        uint256 fee = 0;

        // Tax logic on buy/sell
        if (to == taxCollector && sellTaxBps > 0) {
            fee = (amount * sellTaxBps) / 10_000;
        } else if (from == taxCollector && buyTaxBps > 0) {
            fee = (amount * buyTaxBps) / 10_000;
        }

        if (fee > 0) {
            super._transfer(from, taxCollector, fee);
            amount -= fee;
        }

        super._transfer(from, to, amount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(mintable, "Minting is disabled");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        require(burnable, "Burning is disabled");
        _burn(msg.sender, amount);
    }
}
