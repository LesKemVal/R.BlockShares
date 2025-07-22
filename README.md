# 🏢 Business Franchise Token (BFTKN)

A Kore-compliant ERC-20 smart contract for managing tokenized franchise ownership and investor participation under regulated frameworks.

This project is designed for franchise issuers using a self-serve platform to tokenize equity or debt, enforce investor compliance, and handle lifecycle events such as minting, pausing, fees, rollover, and secondary readiness.

---

## ✅ Features

- ✅ Kore-compliant role architecture
- ✅ Whitelist-based minting enforcement
- ✅ Bonding curve pricing toggle (with permanent lock)
- ✅ Flexible minting fees: full or partial
- ✅ Fee exemptions (admin/owner)
- ✅ Pausable contract (emergency admin control)
- ✅ Investor token burn + rollover support
- ✅ Automated funding window (30 days from deploy)
- ✅ Deployment + full test suite

---

## 🧠 Roles Defined

| Role             | Description                                      |
|------------------|--------------------------------------------------|
| `owner`          | Deployer, fee-exempt, full admin rights          |
| `koreOperator`   | Compliance/whitelist administrator               |
| `whitelisted`    | Approved addresses allowed to mint or invest     |

> 🔒 All minting requires whitelist + valid funding window.

---

## ⚙️ .env Configuration

Create a `.env` file in the root:

```ini
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
INITIAL_SUPPLY=1000000000000000000000
CAP=5000000000000000000000
PRICE=10000000000000
TOKEN_NAME=BusinessFranchiseToken
TOKEN_SYMBOL=BFTKN
FUNDING_WALLET=0xYourFundingWallet
PLATFORM_FEE_WALLET=0xYourFeeWallet
