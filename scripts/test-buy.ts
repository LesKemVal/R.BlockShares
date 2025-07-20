// scripts/test-buy.ts
import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import { BusinessFranchiseToken } from "../typechain-types";

dotenv.config();

async function main() {
  const [wallet] = await ethers.getSigners();

  const tokenAddress = process.env.TOKEN_ADDRESS!;
  if (!tokenAddress) {
    throw new Error("❌ TOKEN_ADDRESS is not set in .env");
  }

  const token = (await ethers.getContractAt(
    "BusinessFranchiseToken",
    tokenAddress
  )) as BusinessFranchiseToken;

  console.log("🔐 Connected wallet:", wallet.address);

  const provider = wallet.provider;
  if (!provider) throw new Error("❌ No provider found on signer");

  const amount = ethers.parseUnits("100", 18); // Buying 100 tokens

  const ethBalance = await provider.getBalance(wallet.address);
  console.log("💰 Wallet ETH balance:", ethers.formatEther(ethBalance), "ETH");

  // Use on-chain price calculation (respects bonding curve)
  const price = await token.getPriceForAmount(amount);

  console.log(`🧮 On-chain price to buy 100 tokens: ${ethers.formatEther(price)} ETH`);

  if (ethBalance < price) {
    console.error("❌ Insufficient ETH for purchase. Needed:", ethers.formatEther(price));
    return;
  }

  // Optional: check whitelist status
  try {
    const isWhitelisted = await token.isWhitelisted(wallet.address);
    console.log("🔑 Whitelisted?", isWhitelisted);
    if (!isWhitelisted) {
      console.warn("⚠️ Wallet not whitelisted. Purchase may fail.");
    }
  } catch {
    console.warn("⚠️ Skipping whitelist check (not callable or not viewable).");
  }

  console.log("🚀 Sending buy transaction...");
  try {
    const tx = await token.buy(amount, { value: price });
    console.log(`⏳ Waiting for confirmation... Tx hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log("✅ Token purchase confirmed in block:", receipt.blockNumber);
  } catch (err) {
    console.error("❌ Buy transaction failed:", err);
  }
}

main().catch((err) => {
  console.error("❌ Script error:", err);
  process.exit(1);
});
