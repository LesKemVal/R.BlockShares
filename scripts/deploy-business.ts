import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying contract with account:", deployer.address);

  const TOKEN_NAME = process.env.TOKEN_NAME || "FranchiseToken";
  const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "FTKN";
  const MAX_SUPPLY = ethers.parseUnits("5000", 18); // Max 5000 tokens
  const ESCROW_WALLET = process.env.ESCROW_WALLET || deployer.address;

  // Deploy contract (constructor requires name, symbol, maxSupply, escrowWallet)
  const Token = await ethers.getContractFactory("BusinessFranchiseToken");
  const contract = await Token.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    MAX_SUPPLY,
    ESCROW_WALLET
  );

  await contract.waitForDeployment();

  console.log(`✅ Contract deployed at: ${contract.target}`);
}

main().catch((err) => {
  console.error("❌ Error deploying contract:", err.message || err);
  process.exit(1);
});
