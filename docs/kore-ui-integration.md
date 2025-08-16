# Kore / North Capital UI Integration

**Context:** R. Block Nation integrates regulated onboarding (KYC/AML, escrow, transfer agent) with on-chain offerings:
- **OBN (Reg CF)** — revenue-share token with 12-month lockup.
- **BFTKN (Reg A+/D)** — issuer-backed token with funding window + optional bonding curve.

We support **two UI paths**:

## Option A — Hosted UI (fastest)
Use **Kore (hosted)** or **BD-hosted** portals for investor onboarding + payments. Our site deep-links into their flow, then handles on-chain updates via secure webhooks.

**Pros:** Fastest, lowest ops.  
**Cons:** Less brand control.

## Option B — Embedded / Custom UI (SettleMint ATK)
Customize SettleMint’s Asset Tokenization Kit (Next.js/Tailwind) and call Kore/NC APIs from our backend for KYC/escrow. Full first-party UX, keeps branding.

**Pros:** Brand + extensibility.  
**Cons:** More front-end work.

---

## Contract Hooks (must implement)

> Apply to **both** OBN and BFTKN; names may differ by contract.

### 1) KYC Allowlist (pre-mint / pre-transfer)
Off-chain KYC approves an address → we mark it on-chain.

```solidity
// Event
event WhitelistUpdated(address indexed investor, bool allowed);

// Admin function (role-gated: onlyKoreOperator)
function setWhitelisted(address investor, bool allowed) external;

