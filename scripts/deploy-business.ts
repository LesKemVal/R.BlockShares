import * as dotenv from "dotenv";
import * as fs from "fs";
import { ethers } from "hardhat";
import path from "path";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying contract with account:", deployer.address);

  const initialSupply = ethers.parseUnits(
    process.env.INITIAL_SUPPLY || "0",
    18
  );
  const cap = ethers.parseUnits(process.env.CAP || "0", 18);
  const price = ethers.parseUnits(process.env.PRICE || "0", 18);

  const fundingWallet = process.env.FUNDING_WALLET || deployer.address;
  const platformFeeWallet = process.env.PLATFORM_FEE_WALLET || deployer.address;

  // Convert to numbers for timestamps
  const fundingStart = Number(process.env.FUNDING_START || "0");
  const fundingEnd = Number(process.env.FUNDING_END || "0");

  const tokenName = process.env.TOKEN_NAME || "MyToken";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "MTK";

  const TokenFactory = await ethers.getContractFactory(
    "BusinessFranchiseToken"
  );

  // Deploy contract with exactly 9 args matching constructor
  const token = await TokenFactory.deploy(
    tokenName,
    tokenSymbol,
    initialSupply,
    cap,
    price,
    fundingWallet,
    platformFeeWallet,
    fundingStart,
    fundingEnd
  );

  await token.waitForDeployment();

  console.log("✅ Token deployed to:", token.target);

  // Optionally update .env TOKEN_ADDRESS with deployed address
  const envPath = path.resolve(__dirname, "..", ".env");
  let envFile = fs.readFileSync(envPath, "utf-8");
  const tokenAddressKey = "TOKEN_ADDRESS";
  const regex = new RegExp(`^${tokenAddressKey}=.*$`, "m");

  if (regex.test(envFile)) {
    envFile = envFile.replace(regex, `${tokenAddressKey}=${token.target}`);
  } else {
    envFile += `\n${tokenAddressKey}=${token.target}`;
  }

  fs.writeFileSync(envPath, envFile, "utf-8");
  console.log("🔄 .env file updated with TOKEN_ADDRESS");
}

main().catch((error) => {
  console.error("❌ Error deploying contract:", error);
  process.exit(1);
});
