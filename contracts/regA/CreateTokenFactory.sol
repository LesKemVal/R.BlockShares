// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CreateToken.sol";

contract CreateTokenFactory is Ownable {
    address public feeReceiver;
    address public complianceAdmin;

    event TokenCreated(address indexed tokenAddress, address indexed creator);

    constructor(address initialOwner, address _feeReceiver, address _complianceAdmin) Ownable() {
        transferOwnership(initialOwner);
        feeReceiver = _feeReceiver;
        complianceAdmin = _complianceAdmin;
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint8 category,
        uint8 instrument,
        uint256 maxSupply,
        bool mintable,
        bool burnable,
        address creator,
        uint256 buyTaxBps,
        uint256 sellTaxBps,
        address taxCollector
    )
        external
        returns (address)
    {
        CreateToken newToken = new CreateToken(
            name,
            symbol,
            decimals,
            initialSupply,
            category,
            instrument,
            maxSupply,
            mintable,
            burnable,
            creator,
            buyTaxBps,
            sellTaxBps,
            taxCollector
        );
        emit TokenCreated(address(newToken), creator);
        return address(newToken);
    }

    function updateFeeReceiver(address newReceiver) external onlyOwner {
        feeReceiver = newReceiver;
    }

    function updateComplianceAdmin(address newAdmin) external onlyOwner {
        complianceAdmin = newAdmin;
    }
}
