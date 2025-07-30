import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const paramsPath = path.resolve(__dirname, "../config/token-params.json");
  const params = JSON.parse(fs.readFileSync(paramsPath, "utf8"));

  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contract with address:", deployer.address);

  const Token = await ethers.getContractFactory("RegCFToken");

  const deployed = await Token.deploy(
    params.tokenName,
    params.tokenSymbol,
    params.basePrice,
    params.priceSlope,
    params.maxSupply,
    params.duration
  );

  await deployed.waitForDeployment();

  console.log("✅ Token deployed to:", await deployed.getAddress());

  // Save deployed address
  fs.writeFileSync(
    path.resolve(__dirname, "../config/deployed-address.txt"),
    await deployed.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
