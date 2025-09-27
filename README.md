# R. Block Nation – Reg A Token (BusinessFranchiseToken)

**This repo now houses the Reg A token (BFTKN) only.**  
Reg CF materials are archived separately in **RBlock-BD-Packet** (branch: `regcf-import`) and do not affect this codebase.

---

## Overview

R. Block Nation enables compliant tokenized raises with regulated partners (e.g., North Capital, KoreConX).  
This repo contains the **BusinessFranchiseToken (BFTKN)** smart contract, deployment scripts, and docs for the **Reg A** offering.

- ✅ Reg A token (this repo)
- 🗂️ Reg CF token: archived in `LesKemVal/RBlock-BD-Packet` → branch `regcf-import`

---

## Contract (Sepolia)

- **Address:** `0x9F2bc4CC40f7e39866F7DcBFe0127E9Dbc925858`  
- **Etherscan:** https://sepolia.etherscan.io/address/0x9F2bc4CC40f7e39866F7DcBFe0127E9Dbc925858#code

**Location:** `contracts/core/BusinessFranchiseToken.sol`

Key features:
- Role-based access (`DEFAULT_ADMIN`, `ADMIN_ROLE`, `KORE_OPERATOR_ROLE`)
- Funding window (`setFundingWindow(start, end)`)
- Escrow wallet integration (BD/Kore)
- Optional bonding curve toggle + lock
- Admin pause / unpause
- Mint up to `maxSupply`

---

## Quickstart

**Install:**
```bash
npm install

