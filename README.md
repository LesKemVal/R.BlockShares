# R.BlockShares – BusinessFranchiseToken Smart Contract Repo

This repository contains smart contracts for a tokenized franchise ownership model prepared for KoreConX compliance review. The architecture supports compliant issuance, investor onboarding, and franchise management workflows using security token standards.

---

## 🔑 Token Standard and Structure

- **Primary Token Type:** Custom ERC-1404/3643-like security token.
- **Compliance Logic:** Transfer restrictions, identity checks, and permissioned functions are modular and adjustable for regulators across jurisdictions.
- **Token Use Case:** Represents fractional ownership or rights within a franchise business model, with custom issuance and rollover logic.
- **Custom Features:** 
  - On-chain role assignment
  - Lifecycle management
  - Secondary trading controls
  - Controlled minting and burning

---

## 🧑‍🤝‍🧑 Roles & Permissions

| Role        | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| **Franchisor** | Token issuer with full permissions (create tokens, assign franchisees, manage compliance, initiate rollovers). |
| **Franchisee** | Whitelisted recipient of tokens; limited to compliant transfer and access. May require KYC/AML verification. |
| **Investor**   | Third-party entity allowed to purchase or hold tokens post-onboarding.   |

Roles are managed using OpenZeppelin’s `Ownable` and potential RBAC (role-based access control) extensions.

---

## 🗳️ Governance Logic

- **RolloverManager.sol** handles fundraising stage transitions.
- Admin-controlled permissions allow:
  - Locking/unlocking transfers
  - Modifying cap limits
  - Executing rollover into new token rounds
- Governance is not decentralized in this version but can integrate with DAO modules if needed.

---

## 🔄 KoreChain Integration Context

- Contracts prepared for KoreConX UI-based issuance and lifecycle workflows.
- Future alignment with KoreChain modules like:
  - KYC identity registry
  - Transfer agent controls
  - Whitelisted primary/secondary offerings
- External API hooks for investor registration and smart contract updates are planned.
- Smart contracts support KoreConX’s compliance-first approach, including R34 token-style transfer checks.

---

## 📦 Smart Contracts Included

- `BusinessFranchiseToken.sol`: (ERC-1404-style token with enhanced compliance logic)
- `CreateToken.sol`: Token instantiation contract with initialization safeguards.
- `CreateTokenFactory.sol`: Factory pattern for creating multiple franchise tokens.
- `RolloverManager.sol`: Handles logic for transitioning from one fundraising round to the next.

---

## 🧪 Development Stack

- **Solidity Version:** ^0.8.20
- **Framework:** Hardhat
- **Scripting Language:** TypeScript
- **Testing:** Mocha + Chai via `npx hardhat test`
- **Linting:** solhint + .solhint.json

---

## 📁 Repo Structure

