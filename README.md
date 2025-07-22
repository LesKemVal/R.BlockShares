# Business Franchise Token (BFTKN)

[![CI](https://github.com/LesKemVal/R.BlockShares/actions/workflows/ci.yml/badge.svg)](https://github.com/LesKemVal/R.BlockShares/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://leskemval.github.io/R.BlockShares)

This project implements a **Kore-compatible token architecture** for managing **compliant digital securities** and franchise-backed token offerings under **Reg A and Reg D exemptions** in the U.S. private capital markets.

BFTKN is not an investment platform. It is a **technical tokenization stack** designed to be integrated with Kore's compliance infrastructure, investor onboarding flows, and Transfer Agent services.

---

## �� Purpose

This project serves as the foundation for a **white-labeled, self-service platform** enabling franchise owners, founders, and issuers to launch compliant token offerings while relying on **regulated intermediaries via Kore** for:

- Transfer agent functions
- Investor onboarding (KYC/AML, accreditation, escrow)
- Cap table management
- Secondary trading integrations

---

## 🔐 Compliance Scope

This repository is intended for **technology demonstration and integration** with Kore's services. It **does not**:

- Act as a broker-dealer or match investors to issuers
- Facilitate securities clearing or custody
- Serve as an MTL-compliant payment platform
- Collect success fees or investor funds

All regulated functions will be handled by Kore and/or their partners.

---

## ✅ Kore-Compatible Features

- Compliant role-based access control (owner, admin, KoreOperator)
- Funding window enforcement (`setFundingWindow`)
- Whitelist-based minting with fee logic
- Optional bonding curve toggle (permanently lockable)
- Partial/full fee exemptions (issuer-configurable)
- Mint/burn support + rollover event logic
- Pausable contract with admin override
- Full TypeScript + Hardhat test suite
- Deployment + integration-ready environment

---

## 🧪 Test Coverage

```bash
npx hardhat test

Project Structure

contracts/core/BusinessFranchiseToken.sol     # Main ERC20 contract with Kore extensions
scripts/deploy-business.ts                    # Deployment with automated funding window
scripts/update-funding-window.ts              # Set dynamic funding window post-deploy
test/test-full.ts                             # Full behavior and compliance test suite
docs/index.md                                 # GitHub Pages for platform documentation

Deployment Summary

Deployed contract address:
0x5FbDB2315678afecb367f032d93F642f64180aa3

Funding window:
2025-07-21 to 2025-08-20

Target exemptions:

Reg A Tier 2

Reg D 506(c)

Continuous Integration

CI is powered by GitHub Actions to validate:

TypeScript compilation

Contract compilation

Full Hardhat test run

Git hooks via husky run tests before any commit.

Documentation
Live documentation (auto-deployed to GitHub Pages)

⚠️ Disclaimer
This repository is for technical demonstration and integration testing.
It does not constitute legal, financial, or investment advice.
Final compliance decisions should be reviewed with your own securities counsel.
This project does not operate as a broker-dealer, transfer agent, or money transmitter.

📬 Contact
For Kore onboarding or UI integration, contact:
Lester Sawyer – LesKemVal GitHub
