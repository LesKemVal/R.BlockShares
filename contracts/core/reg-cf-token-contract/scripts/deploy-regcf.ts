// contracts/core/reg-cf-token-contract/scripts/deploy-regcf.ts
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying RegCFToken with account:", deployer.address);

  // Constructor params
  const NAME = "Our Block RevShare Token";
  const SYMBOL = "OBN";

  const BASE_PRICE = ethers.parseEther("0.01");     // 0.01 ETH baseline
  const PRICE_SLOPE = ethers.parseEther("0.0001");  // small slope per tokensSold*amount/1e18
  const MAX_SUPPLY = ethers.parseUnits("1000000", 18); // 1,000,000 OBN
  const DURATION = 30n * 24n * 60n * 60n;              // 30 days in seconds (bigint)

  const Factory = await ethers.getContractFactory("RegCFToken");

  // IMPORTANT: only pass the 6 constructor args, no extra deployer/address at the end
  const regcf = await Factory.deploy(
    NAME,
    SYMBOL,
    BASE_PRICE,
    PRICE_SLOPE,
    MAX_SUPPLY,
    DURATION
  );

  await regcf.waitForDeployment();
  console.log(`✅ RegCFToken deployed at: ${regcf.target}`);

  // Write/update deployments/local.json
  const deploymentsDir = path.join(process.cwd(), "deployments");
  const filePath = path.join(deploymentsDir, "local.json");
  fs.mkdirSync(deploymentsDir, { recursive: true });

  let current: Record<string, any> = {};
  try {
    current = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    // no file yet
  }
  current.RegCFToken = regcf.target;
  fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
  console.log(`📝 Wrote ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

