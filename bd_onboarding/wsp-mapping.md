# WSP Mapping — Tech Partner (R. Block Nation)

**Network:** Sepolia (11155111)  
**Contract:** `0x9F2bc4CC40f7e39866F7DcBFe0127E9Dbc925858`  
**Verified Source:** https://sepolia.etherscan.io/address/0x9F2bc4CC40f7e39866F7DcBFe0127E9Dbc925858#code

## 1) Supervision Scope
- Activities performed via third-party tech (SettleMint backend, Kore front end/cap table, North Capital escrow) are logged and documented in this repo.
- All offering interactions link back to supervised, archived pages (Kore front end) and the verified contract above.

## 2) Roles & Permissions (on-chain)
- `DEFAULT_ADMIN_ROLE`: deployment/admin (to be moved to BD multisig when provided).
- `ADMIN_ROLE`: pause/unpause, revenue distribution admin.
- `KORE_OPERATOR_ROLE`: funding-window config, mint controls, escrow wallet update.
- Scripts provided: `scripts/grant-roles.ts`, `scripts/revoke-roles.ts` with npm tasks.

## 3) Change Management
- Source control via GitHub; CI workflow runs compile/lint/test on PRs.
- Releases tagged: `deploy/sepolia/YYYY-MM-DD`.
- Deploy + verify are scripted and produce deterministic artifacts (ABI + constructor args).

## 4) Books & Records / Evidence
- `deployments/sepolia.json`: live address.
- `abi/BusinessFranchiseToken.json`: compiled ABI for downstream systems.
- Etherscan verification link (above) evidences source/bytecode match.
- Commit SHAs and tags identify which code produced the deployment.

## 5) Escrow Integration (North Capital)
- Funds flow only via NC escrow; no direct custody by R. Block Nation.
- Repo documents escrow wallet set on-chain (KORE operator), and funding window boundaries.
- NC feed/recon and WSP specifics to be confirmed with BD before go-live.

## 6) Digital Communications
- Public docs link to verified contract address; external marketing must link back to supervised offering pages.
- BD to archive investor-facing content and approve templates/legends before launch.

## 7) Security / Key Handling
- Private keys are never committed (`.env` is git-ignored).
- API keys and addresses are injected via environment, not code.

## 8) Go-Live Checklist
- Compile/tests green, deploy, verify, roles granted, funding window set, CI passing, release tag pushed.

