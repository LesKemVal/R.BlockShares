// scripts/export-cap-table.ts
import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
import { formatUnits } from "ethers";

async function main() {
  // ---- Resolve contract address (from deployments/{network}.json or local.json) ----
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
  console.log(`🔗 Reading cap table from RegCFToken @ ${tokenAddr}${usedFile ? ` (from ${usedFile})` : ""}`);

  const token = await ethers.getContractAt("RegCFToken", tokenAddr);

  // ---- Metadata ----
  const decimalsRaw: bigint = await (token as any).decimals(); // may be BigInt with ethers v6
  const decimals: number = Number(decimalsRaw);                // convert to number for formatting/JSON
  const totalSupply: bigint = await (token as any).totalSupply();
  const holderCount: bigint = await (token as any).holderCount();

  console.log("ℹ️  decimals:", decimals);
  console.log("ℹ️  totalSupply:", totalSupply.toString());
  console.log("ℹ️  holderCount:", holderCount.toString());

  // ---- Pull holders in pages using contract's holders(offset, limit) ----
  const PAGE = Number(process.env.PAGE || 500);
  let offset = 0;
  const allAddrs: string[] = [];

  for (;;) {
    const batch: string[] = await (token as any).holders(offset, PAGE);
    if (!batch.length) break;
    allAddrs.push(...batch);
    offset += batch.length;
    if (batch.length < PAGE) break;
  }

  // Fallback: if holders() returns nothing, attempt linear index via holderAt(i)
  if (allAddrs.length === 0 && holderCount > 0n) {
    for (let i = 0n; i < holderCount; i++) {
      const a: string = await (token as any).holderAt(i);
      allAddrs.push(a);
    }
  }

  // ---- Fetch balances & compliance fields ----
  type Row = {
    address: string;
    balanceRaw: string;
    balance: string;
    isWhitelisted: boolean;
    lockedUntil: string;      // unix seconds as string
    lockedUntilISO: string;   // human readable ISO
    currentlyLocked: boolean;
  };

  const rows: Row[] = [];
  const now = BigInt(Math.floor(Date.now() / 1000));

  for (const addr of allAddrs) {
    const bal: bigint = await (token as any).balanceOf(addr);
    if (bal === 0n) continue;

    const isWL: boolean = await (token as any).isWhitelisted(addr);
    const lu: bigint = await (token as any).lockedUntil(addr);
    const locked = lu > now;

    rows.push({
      address: addr,
      balanceRaw: bal.toString(),
      balance: formatUnits(bal, decimals),
      isWhitelisted: isWL,
      lockedUntil: lu.toString(),
      lockedUntilISO: lu === 0n ? "" : new Date(Number(lu) * 1000).toISOString(),
      currentlyLocked: locked,
    });
  }

  // ---- Sort by balance desc ----
  rows.sort((a, b) => (BigInt(b.balanceRaw) > BigInt(a.balanceRaw) ? 1 : -1));

  // ---- Write JSON & CSV (BigInt-safe) ----
  const outJson = path.join(process.cwd(), `cap-table.${netName}.json`);
  const jsonObj = {
    token: tokenAddr,
    network: netName,
    decimals, // number (not BigInt)
    totalSupply: totalSupply.toString(),
    totalSupplyFormatted: formatUnits(totalSupply, decimals),
    holders: rows,
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(outJson, JSON.stringify(jsonObj, null, 2));
  console.log(`📝 Wrote ${outJson} (${rows.length} holders)`);

  const outCsv = path.join(process.cwd(), `cap-table.${netName}.csv`);
  const header = [
    "address",
    "balanceRaw",
    "balance",
    "isWhitelisted",
    "lockedUntil",
    "lockedUntilISO",
    "currentlyLocked",
  ].join(",");

  const csv = [
    header,
    ...rows.map((r) =>
      [
        r.address,
        r.balanceRaw,
        r.balance,
        r.isWhitelisted ? "true" : "false",
        r.lockedUntil,
        r.lockedUntilISO,
        r.currentlyLocked ? "true" : "false",
      ].join(",")
    ),
  ].join("\n");
  fs.writeFileSync(outCsv, csv);
  console.log(`📝 Wrote ${outCsv}`);
}

main().catch((e) => {
  console.error("❌ export-cap-table failed:", e);
  process.exit(1);
});

