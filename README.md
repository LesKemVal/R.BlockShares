# R.BlockShares
Tokenization Platform

# R.BlockShares

This repository contains the Business Franchise Token smart contract and supporting deployment scripts designed for the Kore compliance framework.

## Project Overview

- **Smart Contract:** `contracts/core/BusinessFranchiseToken.sol`  
  Implements a capped ERC20 token with funding rounds, a configurable bonding curve, and rollover logic to reallocate investments if funding goals are not met.

- **Deployment Script:** `scripts/deploy-business.ts`  
  Automates deployment with environment-configurable parameters.

- **Network:** Sepolia testnet (for testing), with plans for mainnet deployment upon Kore approval.

## Kore Compliance Notes

- The contract includes roles for **KoreOperator** and a **Whitelist** to enforce permissions and access control.  
- The fee model is designed to allow legal success fees, pending Kore's review and approval.  
- The contract implements rollover logic to reallocate investor funds to similar projects in case of funding failure.

## Usage

1. Configure `.env` with deployment parameters such as token name, symbol, funding start/end times, wallets, and pricing.
2. Deploy via `npx hardhat run scripts/deploy-business.ts --network sepolia`.
3. Grant roles post-deployment using provided scripts or manually via contract calls.

## Contribution

Contributions and suggestions are welcome. Please ensure code changes adhere to Kore compliance requirements.

## License

MIT License. See `LICENSE` file for details.
