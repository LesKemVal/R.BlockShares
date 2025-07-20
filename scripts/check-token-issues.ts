// scripts/check-token-issues.ts

import * as dotenv from "dotenv";
import { Contract, ethers, JsonRpcProvider } from "ethers";

dotenv.config();

async function main() {
  const { PRIVATE_KEY, SEPOLIA_RPC_URL, DEPLOYED_TOKEN_ADDRESS } = process.env;

  if (!PRIVATE_KEY || !SEPOLIA_RPC_URL || !DEPLOYED_TOKEN_ADDRESS) {
    throw new Error(
      "❌ Missing .env values: PRIVATE_KEY, SEPOLIA_RPC_URL, or DEPLOYED_TOKEN_ADDRESS."
    );
  }

  const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const buyer = wallet.address;

  // Minimal ABI for read-only checks
  const abi = [
    "function paused() view returns (bool)",
    "function whitelist(address) view returns (bool)",
    "function bondingCurveEnabled() view returns (bool)",
    "function cap() view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function startTime() view returns (uint256)",
    "function endTime() view returns (uint256)",
  ];

  const token = new Contract(DEPLOYED_TOKEN_ADDRESS, abi, provider);

  const [
    isPaused,
    isWhitelisted,
    bondingEnabled,
    cap,
    supply,
    startTime,
    endTime,
  ] = await Promise.all([
    token.paused(),
    token.whitelist(buyer),
    token.bondingCurveEnabled(),
    token.cap(),
    token.totalSupply(),
    token.startTime(),
    token.endTime(),
  ]);

  const now = Math.floor(Date.now() / 1000);
  const fundingOpen = now >= Number(startTime) && now <= Number(endTime);
  const capReached = supply >= cap;

  const statusReport = {
    isPaused,
    isWhitelisted,
    bondingEnabled,
    cap: cap.toString(),
    supply: supply.toString(),
    startTime: new Date(Number(startTime) * 1000).toISOString(),
    endTime: new Date(Number(endTime) * 1000).toISOString(),
    now: new Date(now * 1000).toISOString(),
    fundingOpen,
    capReached,
  };

  console.log("🔍 Contract status for wallet:", buyer);
  console.table(statusReport);

  if (!isWhitelisted) {
    console.warn(`⚠️ Wallet ${buyer} is NOT whitelisted.`);
  }

  if (isPaused) {
    console.warn("⚠️ Token is currently paused.");
  }

  if (!bondingEnabled) {
    console.warn("⚠️ Bonding curve is DISABLED.");
  }

  if (!fundingOpen) {
    console.warn("⚠️ Funding window is CLOSED.");
  }

  if (capReached) {
    console.warn("⚠️ Token cap has been REACHED.");
  }
}

main().catch((err) => {
  console.error("❌ Error checking token status:", err.message || err);
  process.exit(1);
});
