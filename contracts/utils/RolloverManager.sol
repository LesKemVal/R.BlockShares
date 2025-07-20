// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RolloverManager {
    struct Rollover {
        address investor;
        address fromToken;
        address toToken;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Rollover[]) public rolloversByInvestor;

    event RolloverRecorded(
        address indexed investor, address indexed fromToken, address indexed toToken, uint256 amount, uint256 timestamp
    );

    function recordRollover(address investor, address fromToken, address toToken, uint256 amount) external {
        require(investor != address(0), "Invalid investor");
        require(fromToken != address(0), "Invalid fromToken");
        require(toToken != address(0), "Invalid toToken");
        require(amount > 0, "Invalid amount");

        Rollover memory rollover = Rollover({
            investor: investor,
            fromToken: fromToken,
            toToken: toToken,
            amount: amount,
            timestamp: block.timestamp
        });

        rolloversByInvestor[investor].push(rollover);
        emit RolloverRecorded(investor, fromToken, toToken, amount, block.timestamp);
    }

    function getRollovers(address investor) external view returns (Rollover[] memory) {
        return rolloversByInvestor[investor];
    }
}
