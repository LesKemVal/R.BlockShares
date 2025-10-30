# Roles & Responsibilities — SettleMint × Kore × Funding Portal

This page clarifies who does what across the stack. It also shows the **on-chain pattern** we’ll use regardless of UI choice.

---

## Matrix

| Function                           | SettleMint | Kore (hosted UI) | Funding Portal |
|------------------------------------|:----------:|:----------------:|:--------------:|
| **Token issuance / smart contracts** | ✅         | —                | —              |
| **Cap table / Transfer Agent**     | —          | ✅               | —              |
| **KYC/AML**                        | —          | ✅               | ✅ *(oversight if FP involved)* |
| **Form C filing (Reg CF)**         | —          | —                | ✅             |
| **Escrow / funds flow**            | —          | ✅ *(rails)*     | ✅ *(if FP is intermediary)* |
| **UI & investor experience**       | —          | ✅               | — *(FP has its own portal)* |
| **Legal compliance (Reg CF)**      | —          | —                | ✅             |

> **On-chain pattern (both paths):** **Webhooks → backend → contract**  
> - Allowlist (BFTKN) before mint/transfer  
> - Mint/release after **escrow.settled**  
> - **Reg CF lockups** enforced in contract (OBN)

---

## Default setup for R. Block Nation (recommended)

1) **Reg CF (Phase 1)**  
   - **Funding Portal** handles **Form C**, escrow, and compliance.  
   - **Kore** optional as **Transfer Agent** and/or KYC/AML if FP supports it.  
   - **SettleMint** powers the token contracts (OBN/BFTKN) and deployment.  
   - **Flow:** FP/Kore webhook → backend → on-chain allowlist + mint → tx-ref logged.

2) **Reg A+ / Reg D (Phase 2)**  
   - Keep **SettleMint** (contracts/deploy).  
   - Use **Kore** (TA + KYC/AML + escrow rails).  
   - Optional embedded UI (SettleMint ATK + Kore APIs) for first-party UX.

---

## Alternative: Kore’s hosted investor UI

If you skip FP for CF and use **Kore’s hosted UI**:

- Kore runs the investor onboarding and payments.  
- You deep-link into Kore; upon **kyc.approved** / **escrow.settled**, your backend executes on-chain updates.  
- Legal Form C filing still requires a **registered Reg CF Funding Portal** (or an intermediary arrangement).

---

## References

- **Verified OBN (Sepolia):** <https://sepolia.etherscan.io/address/0x769780C2BA4492Ac4B0C3C38fbD0B2CB4bb9Ba5f#code>  
- **Repo:** <https://github.com/LesKemVal/R.BlockShares>  
- **Partner ZIP:** <https://www.dropbox.com/scl/fi/03hu6guqq490wh0w0mloy/site-partner.zip?dl=0>  
- **Contact:** Lester Sawyer — contact@rblockshareholdings.com

