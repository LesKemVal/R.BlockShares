# Vendor Due Diligence Matrix (R. Block Nation)

| Area                  | Vendor / Service        | Role in Flow                                  | Data Access                           | Controls & Notes                                               |
|-----------------------|-------------------------|-----------------------------------------------|---------------------------------------|----------------------------------------------------------------|
| Smart-contract tool   | Hardhat / Etherscan     | Build, deploy, verify source code              | Public metadata only                  | Verified bytecode; repo tags; constructor args in onboarding   |
| Backend/tokenization  | SettleMint              | Node infra / orchestration                     | Wallet RPC, deployment pipeline       | API keys in .env; no keys in repo; least privilege             |
| Cap table / UI        | Kore (white-label)      | Investor onboarding, offering pages, records   | PII/KYC, communications, cap table    | BD supervises pages; archive investor-facing content           |
| Escrow                | North Capital           | Funds collection, CIP/KYC status, disbursement | Investor funds flow & statuses        | BD signs escrow instr.; reconciliations & exception reviews    |
| Repo & CI             | GitHub                  | Source control, change history, releases       | Source code                           | PR reviews; tags `deploy/sepolia/YYYY-MM-DD`                   |
| Keys & secrets        | Env (.env)              | Runtime secrets (RPC, API, private key)        | Private key / API keys                | .gitignored; rotate on BD request; never stored in repo        |

**Artifacts:**  
- Contract (Sepolia): see `bd_onboarding/contract.json`  
- ABI: `bd_onboarding/BusinessFranchiseToken.json`  
- WSP mapping: `bd_onboarding/wsp-mapping.md`  
- Release checklist: `docs/ops/release-checklist.md`

**Notes:**  
- Roles scripted (`scripts/grant-roles.ts`, `revoke-roles.ts`).  
- Funding window & pause controls logged via CLI.  
- BD to confirm archiving scope and final WSP sections pre-launch.
