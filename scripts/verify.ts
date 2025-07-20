import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

async function main() {
  const {
    TOKEN_ADDRESS,
    ISSUER_ADDRESS,
    TOKEN_CAP,
    FUNDING_START_TIME,
    FUNDING_END_TIME,
    BASE_PRICE,
    PRICE_SLOPE,
    PLATFORM_FEE_WALLET,
    PLATFORM_FEE_BPS,
  } = process.env;

  if (!TOKEN_ADDRESS) {
    throw new Error("TOKEN_ADDRESS missing in .env");
  }

  const name = process.env.TOKEN_NAME || "MyFranchise";
  const symbol = process.env.TOKEN_SYMBOL || "MFT";
  const issuer = ISSUER_ADDRESS!;
  const cap = ethers.parseUnits(TOKEN_CAP || "1000", 18);
  const startTime = BigInt(FUNDING_START_TIME || `${Math.floor(Date.now() / 1000)}`);
  const endTime = BigInt(FUNDING_END_TIME || `${Math.floor(Date.now() / 1000 + 3600 * 24 * 30)}`);
  const bondingCurveEnabled = true;
  const basePrice = ethers.parseUnits(BASE_PRICE || "0.001", "ether");
  const priceSlope = ethers.parseUnits(PRICE_SLOPE || "0.00000000001", "ether");
  const platformFeeWallet = PLATFORM_FEE_WALLET!;
  const platformFeeBasisPoints = BigInt(PLATFORM_FEE_BPS || "500");

  // Arguments array for verification
  const args = [
    name,
    symbol,
    issuer,
    cap,
    startTime,
    endTime,
    bondingCurveEnabled,
    basePrice,
    priceSlope,
    platformFeeWallet,
    platformFeeBasisPoints,
    "My Franchise Project",
    "https://example.com/meta.json",
  ];

  console.log("Verifying contract with args:", args);

  await ethers.run("verify:verify", {
    address: TOKEN_ADDRESS,
    constructorArguments: args,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
