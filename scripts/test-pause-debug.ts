import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS;
  if (!tokenAddress) {
    throw new Error("TOKEN_ADDRESS not set in .env");
  }

  // Get signers — assumes your Hardhat config or env keys are set for at least two wallets
  const [owner, user] = await ethers.getSigners();

  console.log("Owner address:", owner.address);
  console.log("User address:", user.address);

  // Contract instances:
  // - token: for read-only calls (any signer)
  // - tokenAsOwner: for owner-only actions (pause/unpause)
  const token = await ethers.getContractAt(
    "BusinessFranchiseToken",
    tokenAddress,
    user
  );
  const tokenAsOwner = await ethers.getContractAt(
    "BusinessFranchiseToken",
    tokenAddress,
    owner
  );

  // Check pause status
  let paused: boolean;
  try {
    paused = await token.isPaused();
    console.log("Contract paused?", paused);
  } catch (err) {
    console.error("❌ Failed to read pause status:", err);
    process.exit(1);
  }

  // If paused, unpause it
  if (paused) {
    console.log("⏯️ Contract is paused. Sending unpause transaction...");
    try {
      const tx = await tokenAsOwner.unpause();
      await tx.wait();
      console.log("✅ Contract unpaused successfully.");
    } catch (err) {
      console.error("❌ Failed to unpause contract:", err);
      process.exit(1);
    }
  } else {
    console.log("✅ Contract is already unpaused.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
