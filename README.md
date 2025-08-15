# R. Block Nation – Tokenization Platform

![logo](https://github.com/settlemint/solidity-token-erc20-crowdsale/blob/main/OG_Solidity.jpg)

[![CI status](https://github.com/settlemint/solidity-token-erc20-crowdsale/actions/workflows/solidity.yml/badge.svg?event=push&branch=main)](https://github.com/settlemint/solidity-token-erc20-crowdsale/actions?query=branch%3Amain)  
[![License](https://img.shields.io/npm/l/@settlemint/solidity-token-erc20-crowdsale)](https://fsl.software)  
[![npm](https://img.shields.io/npm/dw/@settlemint/solidity-token-erc20-crowdsale)](https://www.npmjs.com/package/@settlemint/solidity-token-erc20-crowdsale)  
[![stars](https://img.shields.io/github/stars/settlemint/solidity-token-erc20-crowdsale)](https://github.com/settlemint/solidity-token-erc20-crowdsale)

---

## 📌 Overview

**R. Block Nation** is a tokenization platform that leverages **KoreConX** compliance infrastructure to allow issuers to raise capital in full compliance with U.S. securities laws.  
The platform is designed for **small businesses, startups, and diverse founders** — including underserved communities — to connect with both retail and accredited investors.

This repository contains the **smart contracts**, **deployment scripts**, and **supporting documentation** for our compliant capital raise ecosystem.

---

## 🎯 Purpose

R. Block Nation enables:
- Compliant token offerings under **Reg CF, Reg A, and Reg D**.
- Retail investor access to everyday commerce.
- White-labeled, self-service capital raises.
- Kore-managed regulated functions:
  - Transfer agent duties
  - KYC/AML & accreditation
  - Escrow & settlement
  - Cap table management
  - Secondary market integrations

---

## 🔐 Compliance Scope

This repository does **not**:
- Act as a broker-dealer
- Match investors with issuers
- Hold investor funds directly
- Collect success fees

All regulated activities are outsourced to **KoreConX** and/or licensed partners.

---

## 📦 Contracts

### 1. `BusinessFranchiseToken.sol` (BFTKN)
ERC20-based issuer-backed offering contract with:
- Role-based access control (`owner`, `admin`, `KoreOperator`)
- Funding window enforcement (`setFundingWindow`)
- Whitelist-based minting + fee logic
- Escrow integration (Kore-controlled wallet)
- Optional bonding curve pricing (lockable)
- Fee exemptions (partial or full)
- Rollover event support
- Pausable with admin override

📍 **Location:** `contracts/core/BusinessFranchiseToken.sol`

---

### 2. `RegCFToken.sol` (OBN)
Revenue-share token for **initial Reg CF raise**:
- Bonding curve pricing to reward early investors
- 12-month lockup (Reg CF transfer restrictions)
- Weekly revenue distribution (pro-rata by holdings)
- Kore-managed investor onboarding integration
- Tokenizes platform mint fees, subscriptions, secondary fees

📍 **Location:** `contracts/core/reg-cf-token-contract/contracts/RegCFToken.sol`

---

## 🧪 Testing

Run full test coverage:
```bash
npx hardhat test

📚 Documentation

Live site: R. Block Shares Docs

Reg CF offering docs: RegCF_Documents/

SettleMint Docs: https://console.settlemint.com/documentation

Foundry Docs: https://book.getfoundry.sh/

Hardhat Docs: https://hardhat.org/hardhat-runner/docs

⚠️ Disclaimer

This codebase is for technical demonstration and integration testing only.
It is not legal, financial, or investment advice.
All offerings should be reviewed by securities counsel before launch.

📬 Contact

Owner: Lester Sawyer
📧 contact@rblockshareholdings.com
🏢 R. Block Share Holdings, LLC

📄 License

MIT License – see LICENSE file for details.
