import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying contract with account:", deployer.address);

  const TOKEN_NAME = process.env.TOKEN_NAME || "FranchiseToken";
  const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "FTKN";
  const INITIAL_SUPPLY = ethers.parseUnits("1000", 18); // 1000 tokens
  const CAP = ethers.parseUnits("5000", 18); // 5000 token cap
  const TOKEN_PRICE = ethers.parseUnits("0.01", "ether"); // 0.01 ETH per token
  const FUNDING_WALLET = deployer.address;
  const PLATFORM_FEE_WALLET = deployer.address;

  const now = Math.floor(Date.now() / 1000);
  const FUNDING_START_TIME = now;
  const FUNDING_END_TIME = now + 30 * 24 * 60 * 60; // 30 days

  const Token = await ethers.getContractFactory("BusinessFranchiseToken");

  const contract = await Token.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    INITIAL_SUPPLY,
    CAP,
    TOKEN_PRICE,
    FUNDING_WALLET,
    PLATFORM_FEE_WALLET,
    FUNDING_START_TIME,
    FUNDING_END_TIME
  );

  await contract.waitForDeployment();

  console.log(`✅ Contract deployed at: ${contract.target}`);
  console.log(
    `🕒 Funding window: ${new Date(FUNDING_START_TIME * 1000).toISOString()} to ${new Date(FUNDING_END_TIME * 1000).toISOString()}`
  );
}

main().catch((err) => {
  console.error("❌ Error deploying contract:", err.message || err);
  process.exit(1);
});
