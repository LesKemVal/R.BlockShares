# R. Block Nation – Tokenization Platform

**R. Block Nation** is a tokenization platform that enables compliant capital raises under **Reg CF, Reg A, and Reg D**.

---

## 📌 Overview

We leverage **KoreConX** (and/or licensed partners) for regulated functions and are evaluating **North Capital** as the broker-dealer & escrow partner on a **success-fee** basis (KoreConX remains our fallback).

The platform is designed for **small businesses, startups, and diverse founders** — including underserved communities — to connect with retail and accredited investors.

This repository contains the **smart contracts**, **deployment scripts**, and **supporting documentation** for our compliant raise ecosystem.

---

## 🎯 Purpose

- Compliant token offerings under **Reg CF, Reg A, Reg D**
- Retail investor access to everyday commerce
- White-labeled, self-service issuer flows
- BD/Kore-managed regulated functions:
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

All regulated activities are outsourced to **North Capital**, **KoreConX**, and/or licensed partners.

---

## 📦 Contracts

### 1) `BusinessFranchiseToken.sol` (BFTKN)
ERC-20 issuer-backed offering contract with:
- Role-based access control (`owner`, `admin`, `KoreOperator`)
- Funding window enforcement (`setFundingWindow`)
- Whitelist-based minting + fee logic
- Escrow wallet integration (BD/Kore)
- Optional  pricing (lockable)
- Fee exemptions, rollover support
- Pausable with admin override

📍 **Location:** `contracts/core/BusinessFranchiseToken.sol`  
🔗 Foundry Docs: https://book.getfoundry.sh/  
🔗 Hardhat Docs: https://hardhat.org/hardhat-runner/docs

---

### 2) `RegCFToken.sol` (OBN)
equity (Class B) token for the **initial Reg CF raise**:
-  pricing to reward early investors
- **12-month lockup** (Reg CF transfer restrictions)
- 12-month transfer restriction + exemptions (pro-rata)
- BD/Kore-managed onboarding integration

📍 **Location:** `contracts/core/reg-cf-token-contract/contracts/RegCFToken.sol`

---

## 🧪 Testing

Run full test coverage:
```bash
npx hardhat test``` 


📚 Documentation

Partner demo (download ZIP): <a href="https://www.dropbox.com/scl/fi/03hu6guqq490wh0w0mloy/site-partner.zip?rlkey=uepzezsqr5300tzhjzbeijbfn&dl=1">R. Block Nation – Partner Docs (ZIP)</a>
Partner docs (Dropbox): <https://www.dropbox.com/scl/fi/03hu6guqq490wh0w0mloy/site-partner.zip?rlkey=uepzezsqr5300tzhjzbeijbfn&dl=1>


Reg CF offering docs: RegCF_Documents/
SettleMint Docs: https://console.settlemint.com/documentation

📬 Contact

Owner: Lester Sawyer
📧 contact@rblockshareholdings.com
🏢 R. Block Share Holdings, LLC

📄 License

MIT License — see LICENSE.


Save (**Ctrl+O**, **Enter**) and exit (**Ctrl+X**).  
Reply **“done”** and I’ll give you the commit & push command next.
::contentReference[oaicite:0]{index=0}


## Partner Demo Transfer

Partner docs (Dropbox): <https://www.dropbox.com/scl/fi/03hu6guqq490wh0w0mloy/site-partner.zip?rlkey=uepzezsqr5300tzhjzbeijbfn&dl=1>

