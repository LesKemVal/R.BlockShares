// scripts/mint-demo.ts
import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
import { isAddress, parseUnits, formatUnits } from "ethers";

async function main() {
  // ---- Resolve contract address (deployments/{network}.json or local.json or env) ----
  const deploymentsDir = path.join(process.cwd(), "deployments");
  const netName = network.name;

  const candidates = [
    path.join(deploymentsDir, `${netName}.json`),
    path.join(deploymentsDir, "local.json"),
  ];

  let tokenAddr = process.env.TOKEN_ADDR || "";
  let usedFile = "";
  if (!tokenAddr) {
    for (const f of candidates) {
      if (fs.existsSync(f)) {
        const d = JSON.parse(fs.readFileSync(f, "utf-8"));
        if (typeof d?.RegCFToken === "string") {
          tokenAddr = d.RegCFToken;
          usedFile = f;
          break;
        }
      }
    }
  }
  if (!tokenAddr) {
    throw new Error(
      "No RegCFToken address found. Set TOKEN_ADDR or create deployments/{network}.json or deployments/local.json."
    );
  }
  console.log(`🔗 RegCFToken @ ${tokenAddr}${usedFile ? ` (from ${usedFile})` : ""}`);

  // ---- Inputs ----
  const investor = (process.env.INVESTOR || "").trim();
  const amountHuman = (process.env.AMOUNT || "0").trim(); // e.g. "100" (units) or "100.25" if decimals=2

  if (!isAddress(investor)) throw new Error("Set INVESTOR to a valid address");
  if (!amountHuman || Number.isNaN(Number(amountHuman))) throw new Error("Set AMOUNT (e.g. 100 or 100.25)");

  const [admin] = await ethers.getSigners();
  console.log("🧑‍💼 Admin signer:", admin.address);

  const token = await ethers.getContractAt("RegCFToken", tokenAddr);

  // ---- Metadata / decimals ----
  const decimals: number = await (token as any).decimals();

  // Parse AMOUNT respecting decimals (0 or 2 in this project)
  const amountRaw = parseUnits(amountHuman, decimals);

  // ---- Ensure investor is allowlisted before mint ----
  const isWL: boolean = await (token as any).isWhitelisted(investor);
  if (!isWL) {
    throw new Error(`Investor ${investor} is not KYC-allowlisted. Run kyc-allowlist first.`);
  }

  // ---- Mint ----
  console.log(`🪙 Minting ${amountHuman} (raw ${amountRaw}) to ${investor} ...`);
  const tx = await (token as any).mint(investor, amountRaw);
  console.log("   ↳ tx:", tx.hash);
  await tx.wait();

  // ---- Confirm balance ----
  const bal: bigint = await (token as any).balanceOf(investor);
  console.log("✅ New balance:", formatUnits(bal, decimals));
}

main().catch((e) => {
  console.error("❌ mint-demo failed:", e);
  process.exit(1);
});


