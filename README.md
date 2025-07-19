# R.BlockShares

A Tokenization Platform for compliant business franchise investments.

---

## Overview

This repository includes the `BusinessFranchiseToken` smart contract and supporting deployment and test files intended to meet the Kore protocol’s compliance and audit framework.

- **Smart Contract:** `contracts/core/BusinessFranchiseToken.sol`  
  Implements a capped ERC20 token with:
  - Role-based access control
  - Configurable funding rounds
  - Bonding curve pricing
  - Investor rollover logic for unfilled rounds

- **Deployment Script:** `scripts/deploy-business.ts`  
  Automates deployment using environment-configurable parameters.

- **Test Script:** `test/test-full.ts`  
  Simulates investor flows, funding logic, rollover mechanics, and fee distribution scenarios to reflect real-world use cases.

- **Network:** Sepolia testnet (for testing); prepared for mainnet deployment pending Kore review.

---

## Kore Compliance Notes

- The contract supports roles for:
  - **KoreOperator**
  - **WhitelistManager**
  - **TokenDistributor**
  
- Designed for Kore auditing, the logic anticipates:
  - Investor eligibility enforcement
  - Success fee handling
  - Project rollover/reallocation if funding fails
  - Access-controlled distributions and withdrawals

---

## Getting Started

1. Configure your `.env` file with token name, symbol, funding dates, wallets, caps, and pricing:
    ```dotenv
    TOKEN_NAME="BlockShares Token"
    TOKEN_SYMBOL="BST"
    FUNDING_START=...
    FUNDING_END=...
    ```
2. Deploy to Sepolia:
    ```bash
    npx hardhat run scripts/deploy-business.ts --network sepolia
    ```

3. Run full tests:
    ```bash
    npx hardhat test test/test-full.ts
    ```

---

## Contribution & Audit Access

- This repository is publicly visible at:  
  🔗 [https://github.com/LesKemVal/R.BlockShares](https://github.com/LesKemVal/R.BlockShares)

- For Kore or third-party reviewers:
  - Clone the repository
  - Review `contracts/core/`, `scripts/`, and `test/` directories
  - Submit issues or pull requests if notes are enabled

> To request write access or comment permissions, please contact the owner at **[your email or GitHub username here]**.

---

## License

MIT License. See `LICENSE` for terms and conditions.
