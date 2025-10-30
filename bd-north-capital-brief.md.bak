# R. Block Nation — North Capital Brief

**Owner:** Lester Sawyer  
**Company:** R. Block Share Holdings, LLC (owns 100% of R. Block Nation)  
**Stage:** Reg CF validation using OBN (equity (Class B) token), scaling to Reg A+ and Reg D

---

## Partnership Ask (Success-Fee)
- **Broker-Dealer + Escrow + Compliance** under a **no upfront / success-fee** model for Reg CF.
- If successful, extend partnership to **Reg A+** and **Reg D**.
- Ultimately we will market to non-traditional investors and communities of color, along with all qualified issuers and investors.

## Why North Capital
- Single partner for BD, escrow, KYC/AML, and funds flow.
- Reduce friction for issuers and investors with bundled services.
- Keep compliance controls consistent across CF → A+ → D.

---

## Tech Readiness Snapshot
- **Smart Contracts:**  
  - **Reg CF Token (OBN)** —  (configurable), 12-month lock, weekly pro-rata revenue distribution, KYC/AML hooks.  
  - **BusinessFranchiseToken (BFTKN)** — role-based access (Owner/Admin/KoreOperator), funding window enforcement, whitelist minting with fees, escrow wallet integration, optional  toggle.  
- **Networks:** Ethereum; **Sepolia** for test deployments.  
- **Tooling:** Hardhat + Foundry, TypeScript deploy scripts, GitHub Actions CI, MkDocs docs.  
- **Latest Test Deployments:**  
  - Reg CF Token (OBN) confirmed at: `0x669c723635EF929c8878E5cC0625ac9859a36d03` (Sepolia test)  
  - Local & CI passing: build + tests + gas report.

---

## Compliance & Onboarding (Integration Points)
1. **KYC/AML**: Pre-mint whitelist via BD/Kore endpoints → emits `WhitelistUpdated(address, allowed)` event.  
2. **Escrow Flow**: Investor funds → **North Capital escrow** → on settlement, mint/release via admin/KoreOperator.  
3. **Lockups (Reg CF)**: Auto-enforced 12 months via contract logic; transfer restrictions during lock.  
4. **Revenue Distribution**: Weekly, pro-rata to holders with on-chain claim or admin sweep (gas-optimized).  
5. **Reporting**: Webhooks/callbacks emit tx hashes + off-chain receipts for audit and investor comms.

---

## Success Criteria
- Close the Reg CF under a success-fee structure.
- Stable investor KYC/AML and escrow flow.
- Repeatable playbook for Reg A+ / Reg D issuers.
- Clear, auditable data across chain + BD systems.

---

## Next Steps (Proposed)
1. **Intro Call (30–45 min):** Confirm success-fee feasibility and bundled scope.  
2. **Sandbox Integration:** Wire KYC/AML + escrow test flows against Sepolia.  
3. **Pilot Issuer:** Run one CF pilot end-to-end; measure conversion + ops effort.  
4. **Scale Plan:** Timeline and SLAs for A+ and D.

*Prepared for discussion. Contact: Lester Sawyer — contact@rblockshares.com*

