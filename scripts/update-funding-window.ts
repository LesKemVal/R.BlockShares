// scripts/update-funding-window.ts

import * as dotenv from "dotenv";
import { ethers as externalEthers } from "ethers"; // for provider & wallet
import { ethers } from "hardhat"; // for getContractAt

dotenv.config();

async function main() {
  const { PRIVATE_KEY, SEPOLIA_RPC_URL, TOKEN_ADDRESS } = process.env;

  if (!PRIVATE_KEY || !SEPOLIA_RPC_URL || !TOKEN_ADDRESS) {
    throw new Error(
      "❌ Missing .env variables: PRIVATE_KEY, SEPOLIA_RPC_URL, or TOKEN_ADDRESS."
    );
  }

  const provider = new externalEthers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new externalEthers.Wallet(PRIVATE_KEY, provider);

  console.log("🔑 Wallet address:", wallet.address);

  const contract = await ethers.getContractAt(
    "BusinessFranchiseToken",
    TOKEN_ADDRESS,
    wallet
  );

  const now = Math.floor(Date.now() / 1000);
  const newStart = now;
  const newEnd = now + 30 * 24 * 60 * 60; // 30 days later

  console.log("📆 Updating funding window...");
  const tx = await contract.setFundingWindow(newStart, newEnd);
  await tx.wait();

  console.log("✅ Funding window updated successfully:");
  console.log("Start:", new Date(newStart * 1000).toISOString());
  console.log("End:  ", new Date(newEnd * 1000).toISOString());
}

main().catch((err) => {
  console.error("❌ Failed to update funding window:", err.message || err);
  process.exit(1);
});
