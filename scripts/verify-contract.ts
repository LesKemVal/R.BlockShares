import * as dotenv from "dotenv";
dotenv.config();

import { run } from "hardhat";

async function main() {
  const {
    TOKEN_ADDRESS,
    ISSUER_ADDRESS,
    PLATFORM_FEE_WALLET,
    PLATFORM_FEE_BPS,
    BASE_PRICE,
    PRICE_SLOPE,
    TOKEN_CAP,
    FUNDING_START_TIME,
    FUNDING_END_TIME,
  } = process.env;

  const name = "MyFranchise";
  const symbol = "MFT";
  const issuer = ISSUER_ADDRESS!;
  const cap = TOKEN_CAP!; // Already parsed
  const startTime = FUNDING_START_TIME!;
  const endTime = FUNDING_END_TIME!;
  const bondingCurveEnabled = true;

  // Convert to exact integers (as strings to avoid parsing issues)
  const basePrice = "10000000000000"; // 0.00001 ETH
  const priceSlope = "10000"; // 0.00000000001 ETH
  const platformFeeWallet = PLATFORM_FEE_WALLET!;
  const platformFeeBasisPoints = "250";

  const projectName = "My Franchise Project";
  const metadataURI = "https://example.com/meta.json";

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
    projectName,
    metadataURI,
  ];

  console.log("📦 Verifying contract at:", TOKEN_ADDRESS);
  console.log("🛠️ With constructor args:", args);

  await run("verify:verify", {
    address: TOKEN_ADDRESS,
    constructorArguments: args,
  });

  console.log("✅ Verification complete!");
}

main().catch((error) => {
  console.error("❌ Verification failed:", error.message || error);
  process.exit(1);
});
