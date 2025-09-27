import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

function toUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function atUtcMidnightPlusDays(daysFromToday: number): Date {
  const now = new Date();
  // Today at 00:00:00Z
  const todayMidnightZ = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
  // Add days
  return new Date(todayMidnightZ.getTime() + daysFromToday * 24 * 60 * 60 * 1000);
}

async function main() {
  const [signer] = await ethers.getSigners();

  const TOKEN_ADDR =
    process.env.TOKEN_ADDR ||
    "0x9F2bc4CC40f7e39866F7DcBFe0127E9Dbc925858";

  // MODE 1: explicit ISO datetimes via CLI args
  const startIsoArg = process.argv[2];
  const endIsoArg = process.argv[3];

  let start: number;
  let end: number;
  let startIso: string;
  let endIso: string;

  if (startIsoArg && endIsoArg) {
    const s = new Date(startIsoArg);
    const e = new Date(endIsoArg);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      throw new Error("Invalid ISO datetimes. Example: 2025-10-01T00:00:00Z 2025-12-31T23:59:59Z");
    }
    start = toUnix(s);
    end = toUnix(e);
    startIso = s.toISOString();
    endIso = e.toISOString();
  } else {
    // MODE 2: dynamic enterprise-friendly defaults (env-driven)
    const START_IN_DAYS = Number(process.env.START_IN_DAYS ?? 1);   // default: tomorrow
    const DURATION_DAYS = Number(process.env.DURATION_DAYS ?? 90);  // default: 90-day window

    if (!Number.isFinite(START_IN_DAYS) || !Number.isFinite(DURATION_DAYS) || DURATION_DAYS <= 0) {
      throw new Error("Invalid START_IN_DAYS or DURATION_DAYS. Provide positive integers.");
    }

    // Start at 00:00:00Z on (today + START_IN_DAYS)
    const startDate = atUtcMidnightPlusDays(START_IN_DAYS);

    // End at 23:59:59Z on (start + DURATION_DAYS - 1)
    const endDate = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate() + (DURATION_DAYS - 1),
      23, 59, 59, 0
    ));

    start = toUnix(startDate);
    end = toUnix(endDate);
    startIso = startDate.toISOString();
    endIso = endDate.toISOString();
  }

  if (end <= start) {
    throw new Error("END must be after START.");
  }

  console.log("Signer:", signer.address);
  console.log("Contract:", TOKEN_ADDR);
  console.log("Funding window:", startIso, "->", endIso, `(${start}..${end})`);

  const c = await ethers.getContractAt("BusinessFranchiseToken", TOKEN_ADDR, signer);
  const tx = await c.setFundingWindow(start, end);
  console.log("tx:", tx.hash);
  await tx.wait();
  console.log("✅ Funding window updated.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
