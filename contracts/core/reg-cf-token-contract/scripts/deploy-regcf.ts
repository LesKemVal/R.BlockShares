import * as fs from "fs";
import * as path from "path";
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contract with address:", deployer.address);

  // === Demo defaults (override with env if you like) ===
  const NAME        = process.env.CF_NAME        ?? "Our Block RevShare Token";
  const SYMBOL      = process.env.CF_SYMBOL      ?? "OBN";
  // Pricing is per whole token (1e18 units) in WEI:
  const BASE_PRICE  = process.env.CF_BASE_PRICE  ? BigInt(process.env.CF_BASE_PRICE)  : ethers.parseEther("0.01");     // 0.01 ETH per token
  const PRICE_SLOPE = process.env.CF_PRICE_SLOPE ? BigInt(process.env.CF_PRICE_SLOPE) : ethers.parseEther("0.000001"); // grows slowly
  const MAX_SUPPLY  = process.env.CF_MAX_SUPPLY  ? BigInt(process.env.CF_MAX_SUPPLY)  : ethers.parseUnits("1000000", 18); // 1,000,000 tokens
  const DURATION_S  = process.env.CF_DURATION_S  ? Number(process.env.CF_DURATION_S)  : 30 * 24 * 60 * 60; // 30 days
  const ESCROW_WALLET = process.env.CF_ESCROW_WALLET ?? deployer.address; // <- point to BD/escrow in real deploys

  const Factory = await ethers.getContractFactory("RegCFToken");
  const token = await Factory.deploy(
    NAME,
    SYMBOL,
    BASE_PRICE,
    PRICE_SLOPE,
    MAX_SUPPLY,
    DURATION_S,
    ESCROW_WALLET
  );
  await token.waitForDeployment();

  const addr = await token.getAddress();
  console.log(`${NAME} (${SYMBOL}) deployed at: ${addr}`);

  // Write deployments/local.json (append or create)
  const deploymentsDir = path.join(process.cwd(), "deployments");
  const filePath = path.join(deploymentsDir, "local.json");
  try {
    if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir);
    let current: any = {};
    if (fs.existsSync(filePath)) {
      current = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    current.RegCFToken = addr;
    fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
    console.log(`📝 Wrote deployments/local.json:\n${filePath}`);
  } catch (e) {
    console.warn("Could not write deployments/local.json:", e);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

