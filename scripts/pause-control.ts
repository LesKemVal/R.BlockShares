import * as dotenv from "dotenv";
import { ethers } from "hardhat";
dotenv.config();

async function main() {
  const action = (process.argv[2] || "").toLowerCase(); // "pause" | "unpause"
  if (action !== "pause" && action !== "unpause") {
    console.error("Usage: npx hardhat run --network sepolia scripts/pause-control.ts <pause|unpause>");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  const TOKEN_ADDR = process.env.TOKEN_ADDR || "0x9F2bc4CC40f7e39866F7DcBFe0127E9Dbc925858";
  const c = await ethers.getContractAt("BusinessFranchiseToken", TOKEN_ADDR, signer);

  const ADMIN_ROLE = await c.ADMIN_ROLE();
  const isAdmin = await c.hasRole(ADMIN_ROLE, signer.address);
  if (!isAdmin) throw new Error(`Signer ${signer.address} is not ADMIN_ROLE`);

  console.log("Signer:", signer.address);
  console.log("Contract:", TOKEN_ADDR);
  if (action === "pause") {
    const tx = await c.pause();
    console.log("→ pausing… tx:", tx.hash);
    await tx.wait();
    console.log("✅ paused");
  } else {
    const tx = await c.unpause();
    console.log("→ unpausing… tx:", tx.hash);
    await tx.wait();
    console.log("✅ unpaused");
  }
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
