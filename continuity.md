# Continuity – R. Block Nation (Reg CF Equity)

## Current State (as of now)
- Contract: **RegCFToken** (equity, Class B non-voting units; 12-month lock + exemptions).
- Network: **Sepolia**
- Address: **0x769780C2BA4492Ac4B0C3C38fbD0B2CB4bb9Ba5f**
- Etherscan: https://sepolia.etherscan.io/address/0x769780C2BA4492Ac4B0C3C38fbD0B2CB4bb9Ba5f#code
- Decimals: **2**
- Max Supply: **1,000,000**
- Offering start (unix): from deploy script env
- Local deploy: deployments/local.json
- Sepolia deploy: deployments/sepolia.json

## Key Compliance Logic
- Transfers blocked for 12 months **per investor** from issuance (`lockedUntil`).
- Exemptions during lock:
  - Transfer to issuer (ADMIN role)
  - Transfer to accredited investor
  - Transfer to a trust controlled by investor
  - Estate/divorce (pre-approved FROM→TO pair)
- All recipients must be **KYC allowlisted**.

## Roles / Admin APIs
- `updateKYCStatus(address,bool)` — allowlist recipient
- `setAccredited(address,bool)` — Reg CF exemption
- `setTrust(address,bool)` — Reg CF exemption
- `approveSpecialPair(address from,address to,bool)` — estate/divorce exemption
- `mint(address to,uint256 amount)` — admin mint (sets/extends 12-mo lock)
- `enableTransfers()` — optional global unlock after 12 months (still KYC-gated)

## Common Ops (CLI)
### 1) KYC allowlist from file

npx hardhat run scripts/kyc-allowlist.ts --network sepolia

- Edit `allowlist.json` with addresses first.
- Uses `deployments/sepolia.json` (or TOKEN_ADDR) to resolve contract.
- Writes `deployments/allowlist-verified.sepolia.json`.

### 2) Mint to a whitelisted investor
INVESTOR=0x... AMOUNT=100
npx hardhat run scripts/mint-demo.ts --network sepolia

- `AMOUNT` respects decimals (2 → “100.25” allowed).

### 3) Export cap table (holders + KYC + locks)
npx hardhat run scripts/export-cap-table.ts --network sepolia

- Outputs: `cap-table.sepolia.json` and `.csv`.

### 4) Demo transfer: lock failure then exempt success (local example)
npx hardhat run scripts/demo-transfer.ts --network localhost


## Docs / Site
- Partner site built to `site-partner/` and zipped as `site-partner.zip`.
- If Dropbox Transfer link changes, update in:
  - README.md
  - docs/kore-brief.md
  - docs/bd-north-capital-brief.md

## What’s Next
- Confirm all docs say **Reg CF equity** (not revenue share).
- Insert/verify “Reg CF exemptions” blocks in Kore brief.
- Optional Hardhat tasks:
  - `setKyc`, `setAccredited`, `setTrust`, `approvePair`, `mint`, `exportCap`.

## Quick References
- Repo: https://github.com/LesKemVal/R.BlockShares
- Contract (Sepolia): 0x769780C2BA4492Ac4B0C3C38fbD0B2CB4bb9Ba5f

