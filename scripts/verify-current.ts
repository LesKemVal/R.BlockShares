import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { network, run } from "hardhat";

dotenv.config();

function maxSupplyWei(): string {
  const wei = 10n ** 18n;
  return (5000n * wei).toString();
}

async function main() {
  const file = path.join(__dirname, "..", "deployments", `${network.name}.json`);
  if (!fs.existsSync(file)) throw new Error(`No deployments file: ${file}`);
  const addr = JSON.parse(fs.readFileSync(file, "utf8")).BusinessFranchiseToken;
  if (!addr) throw new Error(`BusinessFranchiseToken not found in ${file}`);

  const name   = process.env.TOKEN_NAME  || "FranchiseToken";
  const symbol = process.env.TOKEN_SYMBOL || "FTKN";
  const escrow = process.env.ESCROW_WALLET || "";
  if (!escrow) throw new Error("ESCROW_WALLET is required in .env for verification");

  console.log("Verifying on", network.name, "address:", addr);
  await run("verify:verify", {
    address: addr,
    constructorArguments: [name, symbol, maxSupplyWei(), escrow],
  });
  console.log("✅ Verification task submitted.");
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
