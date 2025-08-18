// scripts/kyc-allowlist.ts
import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
import { isAddress } from "ethers";

async function main() {
  // --- Resolve target contract address ---
  const deploymentsDir = path.join(process.cwd(), "deployments");
  const netName = network.name; // e.g. 'localhost', 'sepolia', etc.

  const candidateFiles = [
    path.join(deploymentsDir, `${netName}.json`),
    path.join(deploymentsDir, "local.json"),
  ];

  let tokenAddr = process.env.TOKEN_ADDR || "";
  let usedFile = "";
  if (!tokenAddr) {
    for (const f of candidateFiles) {
      if (fs.existsSync(f)) {
        const d = JSON.parse(fs.readFileSync(f, "utf-8"));
        if (d?.RegCFToken && typeof d.RegCFToken === "string") {
          tokenAddr = d.RegCFToken;
          usedFile = f;
          break;
        }
      }
    }
  }
  if (!tokenAddr) {
    throw new Error(
      "No RegCFToken address found. Set TOKEN_ADDR or add deployments/{network}.json or deployments/local.json"
    );
  }
  console.log(`🔗 Using RegCFToken @ ${tokenAddr}${usedFile ? ` (from ${usedFile})` : ""}`);

  // --- Load allowlist.json ---
  const allowlistPath = path.join(process.cwd(), "allowlist.json");
  if (!fs.existsSync(allowlistPath)) {
    throw new Error(`Missing ${allowlistPath}`);
  }
  const raw: string[] = JSON.parse(fs.readFileSync(allowlistPath, "utf-8"));

  // --- Clean & validate addresses ---
  const unique = Array.from(new Set(raw.map((a) => a.trim())));
  const valid = unique.filter((a) => isAddress(a));
  const invalid = unique.filter((a) => !isAddress(a));

  if (invalid.length) {
    console.log("⚠️ Skipping invalid addresses:", invalid);
  }
  if (!valid.length) {
    console.log("⚠️ No valid addresses to process. Exiting.");
    return;
  }

  const [admin] = await ethers.getSigners();
  console.log("🧑‍💼 Admin signer:", admin.address);

  const token = await ethers.getContractAt("RegCFToken", tokenAddr);

  // --- Process allowlist: only call for addresses not already whitelisted ---
  const processed: string[] = [];
  for (const addr of valid) {
    try {
      const already: boolean = await (token as any).isWhitelisted(addr);
      if (already) {
        console.log(`⏭️  Already whitelisted: ${addr}`);
        continue;
      }
      console.log(`✅ Allowlisting: ${addr}`);
      const tx = await (token as any).updateKYCStatus(addr, true);
      console.log("   ↳ tx:", tx.hash);
      await tx.wait();
      processed.push(addr);
    } catch (e) {
      console.error(`❌ Failed on ${addr}:`, e);
    }
  }

  // --- Write verification log ---
  const outFile = path.join(deploymentsDir, `allowlist-verified.${netName}.json`);
  const prev: string[] = fs.existsSync(outFile)
    ? JSON.parse(fs.readFileSync(outFile, "utf-8"))
    : [];
  const merged = Array.from(new Set([...(prev || []), ...processed]));
  fs.writeFileSync(outFile, JSON.stringify(merged, null, 2));
  console.log(`📝 Wrote ${outFile} (${processed.length} newly verified)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

