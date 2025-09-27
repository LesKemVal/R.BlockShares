# Release Checklist — Reg A (BFTKN)

**Network:** Sepolia (11155111)  
**Contract:** `0x9F2bc4CC40f7e39866F7DcBFe0127E9Dbc925858`  
**Explorer:** https://sepolia.etherscan.io/address/0x9F2bc4CC40f7e39866F7DcBFe0127E9Dbc925858

## 1) Preflight
- Ensure `.env` has: `SEPOLIA_RPC_URL/INFURA_API_KEY`, `PRIVATE_KEY`, `ETHERSCAN_API_KEY`, `ESCROW_WALLET`.
- Optional overrides: `TOKEN_NAME`, `TOKEN_SYMBOL`.

## 2) Build & Test
```bash
npm run compile
npm test
```

## 3) Deploy (writes deployments/sepolia.json)
```bash
npm run deploy:sepolia
```

## 4) Verify on Etherscan
```bash
npm run verify:sepolia
```

## 5) Roles (Kore / Admin)
- Grant Kore operator (replace address):
```bash
KORE_ADDR=0xYourKoreOperatorAddress npm run roles:grant
```
- (Optional) Revoke roles later:
```bash
REVOKE_ADMIN_ADDR=0x... REVOKE_KORE_OPERATOR_ADDR=0x... npm run roles:revoke
```

## 6) Funding Window
```bash
# Example: open now for 90 days
node -e 'const now=Math.floor(Date.now()/1000);const end=now+90*24*3600;console.log(now,end)'
# Plug start/end into:
npm run funding:sepolia
```

## 7) Pause Controls
```bash
npm run pause      # or
npm run unpause
```

## 8) Health Check (read-only)
```bash
npm run health:sepolia
```

## 9) Frontend Metadata
- `frontend/contract.sepolia.json` and `frontend/abi.json` are kept in repo.
- Update any external UI to read from those files.

## 10) Tag Release
```bash
git tag -a "deploy/sepolia/$(date +%F)" -m "BFTKN deployed at 0x9F2bc4CC40f7e39866F7DcBFe0127E9Dbc925858; verified"
git push origin --tags
```

