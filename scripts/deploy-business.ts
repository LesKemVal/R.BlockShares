import * as dotenv from "dotenv";
import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying with:", deployer.address, "on", network.name);

  const TOKEN_NAME = process.env.TOKEN_NAME || "FranchiseToken";
  const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "FTKN";
  const MAX_SUPPLY = ethers.parseUnits("5000", 18); // override in script if needed
  const ESCROW_WALLET = process.env.ESCROW_WALLET || deployer.address;

  const Token = await ethers.getContractFactory("BusinessFranchiseToken");
  const contract = await Token.deploy(TOKEN_NAME, TOKEN_SYMBOL, MAX_SUPPLY, ESCROW_WALLET);
  await contract.waitForDeployment();

  // ethers v6: address is at .target
  const addr = (contract as any).target?.toString?.() || (await (contract as any).getAddress?.());

  console.log(`✅ Contract deployed at: ${addr}`);

  // Persist to deployments/<network>.json
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const file = path.join(deploymentsDir, `${network.name}.json`);
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });

  let current: Record<string, any> = {};
  try {
    if (fs.existsSync(file)) current = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_) {
    current = {};
  }
  current.BusinessFranchiseToken = addr;
  fs.writeFileSync(file, JSON.stringify(current, null, 2));
  console.log(`📝 Wrote ${file} with BusinessFranchiseToken: ${addr}`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
