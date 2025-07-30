# Our Block Nation – Tokenization Platform

[![CI](https://github.com/LesKemVal/R.BlockShares/actions/workflows/ci.yml/badge.svg)](https://github.com/LesKemVal/R.BlockShares/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://leskemval.github.io/R.BlockShares)

This repository contains the smart contracts and supporting documentation for **Our Block Nation**, a tokenization platform that leverages Kore’s compliance infrastructure to allow issuers to raise capital compliantly.

The project currently includes:

- **BusinessFranchiseToken (BFTKN)** – ERC20-based contract architecture for franchise-backed and issuer-driven offerings (Reg A & Reg D).  
- **RegCFToken (OBN)** – Revenue-share token designed for the initial Reg CF raise that will fund the build-out of the platform.  

---

## 🎯 Purpose

Our Block Nation is designed to:

- Provide small businesses, startups, and diverse founders (including underserved communities) with access to capital.  
- Allow **retail investors and accredited investors** to invest in everyday commerce.  
- Build a self-service, white-labeled infrastructure for compliant capital raises with Kore and its partners managing regulated functions.  

The platform combines **technical tokenization** and **Kore’s compliance stack** to handle:

- Transfer agent functions  
- Investor onboarding (KYC/AML, accreditation, escrow)  
- Cap table management  
- Secondary trading integrations  

---

## 🔐 Compliance Scope

This repository **does not**:

- Act as a broker-dealer  
- Match investors to issuers  
- Facilitate securities clearing or custody  
- Collect success fees or investor funds  

All regulated functions will be handled by **Kore** and/or their partners, including ATS integrations for secondary trading.

---

## 📦 Contracts

### 1. BusinessFranchiseToken (BFTKN)

Implements Kore-compatible logic for issuer-backed token offerings:

- Role-based access control (`owner`, `admin`, `KoreOperator`)  
- Funding window enforcement (`setFundingWindow`)  
- Whitelist-based minting with fee logic  
- Optional bonding curve toggle (permanently lockable)  
- Partial/full fee exemptions (issuer-configurable)  
- Rollover event logic  
- Pausable contract with admin override  

📍 **Location:** `contracts/core/BusinessFranchiseToken.sol`

---

### 2. Reg CF Token (OBN)

Implements a revenue-share token for the initial **Reg CF raise**, designed to fund the platform build-out:

- Bonding curve pricing to reward early investors  
- Auto-locks tokens for 12 months (Reg CF transfer restrictions)  
- Weekly revenue distribution (pro-rata by token holdings)  
- Integration point for Kore-managed investor onboarding  
- Designed to tokenize **mint fees, subscription fees, and secondary transaction fees** from the platform  

📍 **Location:** `contracts/core/reg-cf-token-contract/contracts/RegCFToken.sol`

---

🧪 Testing
Full Hardhat test coverage is included for both contracts:

```bash
npx hardhat test
```

🛠 Deployment
Deploy Reg CF Token to Sepolia:

```bash
cd contracts/core/reg-cf-token-contract
npx hardhat run scripts/deploy-regcf.ts --network sepolia
```

Deploy BusinessFranchiseToken:

```bash
npx hardhat run scripts/deploy-business.ts --network sepolia
```

📚 Documentation
Live documentation: https://leskemval.github.io/R.BlockShares/

Detailed offering decks and models are located in: RegCF_Documents/

⚠️ Disclaimer
This repository is for technical demonstration and integration testing.
It does not constitute legal, financial, or investment advice.
Final compliance decisions should be reviewed with securities counsel.

📬 Contact
Lester Sawyer
contact@rblockshareholdings.com
Our Block Nation – R. Block Share Holdings, LLC


