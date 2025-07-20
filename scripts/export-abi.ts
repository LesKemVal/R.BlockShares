import * as fs from "fs";
import { artifacts } from "hardhat";

async function main() {
  const artifact = await artifacts.readArtifact("BusinessFranchiseToken");
  fs.mkdirSync("abi", { recursive: true });
  fs.writeFileSync(
    "abi/BusinessFranchiseToken.json",
    JSON.stringify(artifact.abi, null, 2)
  );
  console.log("✅ ABI exported to abi/BusinessFranchiseToken.json");
}

main().catch((err) => {
  console.error("❌ Failed to export ABI:", err);
  process.exit(1);
});
