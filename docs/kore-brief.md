# R. Block Nation — Kore Integration Brief

**Owner:** Lester Sawyer (R. Block Share Holdings, LLC)  
**Scope:** Start with **Reg CF** (OBN) under a success-fee model; extend to **Reg A+** and **Reg D** (BFTKN).  
**Goal:** Use **Kore** for KYC/AML, escrow/settlement, and transfer-agent services; keep **SettleMint** as backend; maintain a clean path to an **embedded** first-party UI later.

---

## 1) Purpose & Ask

- **Ask:** Kore sandbox access + API endpoints (KYC/AML, escrow/settlement webhooks, TA updates) to wire a working CF demo.  
- **Commercial:** No-upfront, **success-fee** for Reg CF, with path to A+ and D.  
- **Timeline:** Sandbox demo → pilot issuer → scale.

---

## 2) Operating Model & UI Options

**Option A — Hosted (fastest path)**  
- Investor onboarding, docs, and payments happen in **Kore’s hosted portal**.  
- Our site deep-links to Kore and **listens for webhooks** to trigger on-chain updates.

**Option B — Embedded (brand-first, later)**  
- Use **SettleMint’s Asset Tokenization Kit** (Next.js/Tailwind) and call **Kore APIs** from our backend.  
- Same **webhook → on-chain** pattern; full first-party UX control.

---

## 3) Technical Snapshot

**Chain & Code**  
- Network: **Ethereum** (Sepolia for demo)  
- Contracts:  
  - **OBN (Reg CF)** – revenue-share demo with 12-month lock and pricing curve.  
  - **BFTKN (A+/D)** – role-gated (Owner/Admin/**KoreOperator**), funding window, whitelist minting, optional bonding curve.  
- Tooling: **Hardhat + Foundry**, GitHub Actions CI, MkDocs docs.

**Public references**  
- Verified OBN (Sepolia):  
  <https://sepolia.etherscan.io/address/0x4B2f40B9b553E859877f4ECf7bd26ddaB3d218F7#code>  
- Repo (contracts/tests/CI):  
  <https://github.com/LesKemVal/R.BlockShares>  
- Partner docs (ZIP):  
  <https://www.dropbox.com/scl/fi/03hu6guqq490wh0w0mloy/site-partner.zip?rlkey=uepzezsqr5300tzhjzbeijbfn&st=7706jtao&dl=0>

---

## 4) Integration Hooks (Webhooks → On-Chain)

**Webhook from Kore → our backend**

    {
      "event": "escrow.settled",
      "investorAddress": "0xINVESTOR...",
      "amount": "500.00",
      "currency": "USD",
      "offchainRef": "kore-escrow-123",
      "timestamp": "2025-08-20T15:04:05Z"
    }

**Our backend → contract actions**

- **Allowlist (BFTKN)** — Mark address approved before mint/transfer:

        event WhitelistUpdated(address indexed investor, bool allowed);
        // function setWhitelisted(address investor, bool allowed) external;

- **Mint / Release (BFTKN)** — Operator mints post-settlement or releases escrowed tokens.  
- **Lockup (Reg CF)** — 12-month transfer lock enforced by the contract.

> The demo **OBN** shows end-to-end flow and lockup. For production CF, either **gate buys by allowlist** or use an **operator-mint** pattern after escrow settles.

---

## 5) Sandbox Plan (CF demo)

1. **KYC/AML pass** → webhook `kyc.approved`.  
2. **Escrow settle** (test funds) → webhook `escrow.settled` with `offchainRef`.  
3. **Backend** performs allowlist/mint and logs a **tx-ref**.  
4. **Audit log** (CSV/JSON) aligns `offchainRef` with `txHash`.

**tx-ref shape**

    {
      "provider": "Kore",
      "ref": "kore-escrow-123",
      "event": "mint",
      "txHash": "0xabc...",
      "ts": "2025-08-20T15:10:00Z",
      "investor": "0xINV...",
      "amount": "500e18"
    }

---

## 6) Data & Reporting

- **Events:** on-chain (`WhitelistUpdated`, `Transfer`, etc.) + off-chain webhooks.  
- **Exports:** CSV/JSON for Kore/BD ops and auditors.  
- **Traceability:** 1:1 link — `offchainRef` ↔ `txHash`.

---

## 7) Security & Compliance

- **Keys:** ENV only; no secrets in repo.  
- **Separation of duties:** dedicated ops wallet (**ADMIN_ROLE**) is separate from owner.  
- **Pauses/Windows:** funding windows and, where applicable, pause/role gates.  
- **CF lockup:** 12-month per-address enforcement.

---

## 8) Success Criteria

- CF sandbox completes with **allowlist/mint after escrow settle**.  
- Clean, reproducible **run book** for pilot issuer.  
- Agreement on **Hosted now**; **Embedded** roadmap later.  
- **Success-fee** structure confirmed.

---

## 9) Next Steps

- Share **Kore sandbox/API** docs (KYC/escrow/TA).  
- Map webhook fields to contract calls (finalize allowlist/mint for CF).  
- Schedule **30-min integration call** → sandbox test.  
- Convert demo to **pilot**.

**Contact:** Lester Sawyer — contact@rblockshareholdings.com

