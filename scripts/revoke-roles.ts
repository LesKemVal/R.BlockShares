import * as dotenv from "dotenv";
import { ethers } from "hardhat";
dotenv.config();

async function main() {
  const [adminSigner] = await ethers.getSigners();

  const TOKEN_ADDR = process.env.TOKEN_ADDR || "0x9F2bc4CC40f7e39866F7DcBFe0127E9Dbc925858";
  const REVOKE_ADMIN_ADDR = process.env.REVOKE_ADMIN_ADDR || "";
  const REVOKE_KORE_OPERATOR_ADDR = process.env.REVOKE_KORE_OPERATOR_ADDR || "";
  const REVOKE_DEFAULT_ADMIN_ADDR = process.env.REVOKE_DEFAULT_ADMIN_ADDR || ""; // use with care

  const c = await ethers.getContractAt("BusinessFranchiseToken", TOKEN_ADDR, adminSigner);

  const DEFAULT_ADMIN_ROLE = await c.DEFAULT_ADMIN_ROLE();
  const ADMIN_ROLE = await c.ADMIN_ROLE();
  const KORE_OPERATOR_ROLE = await c.KORE_OPERATOR_ROLE();

  const isDeployerAdmin = await c.hasRole(DEFAULT_ADMIN_ROLE, adminSigner.address);
  if (!isDeployerAdmin) {
    throw new Error("Current signer is not DEFAULT_ADMIN; cannot revoke roles.");
  }

  async function maybeRevoke(roleName: string, role: string, addr?: string) {
    if (!addr) return;
    const has = await c.hasRole(role, addr);
    if (!has) {
      console.log(`✔ ${roleName} not present on ${addr} (nothing to revoke)`);
      return;
    }
    const tx = await c.revokeRole(role, addr);
    console.log(`→ revoking ${roleName} from ${addr}… tx=${tx.hash}`);
    await tx.wait();
    console.log(`✅ revoked ${roleName} from ${addr}`);
  }

  console.log("Signer (DEFAULT_ADMIN):", adminSigner.address, "Contract:", TOKEN_ADDR);

  await maybeRevoke("ADMIN_ROLE", ADMIN_ROLE, REVOKE_ADMIN_ADDR);
  await maybeRevoke("KORE_OPERATOR_ROLE", KORE_OPERATOR_ROLE, REVOKE_KORE_OPERATOR_ADDR);

  // Only do this if you have transferred DEFAULT_ADMIN to a multisig first.
  await maybeRevoke("DEFAULT_ADMIN_ROLE", DEFAULT_ADMIN_ROLE, REVOKE_DEFAULT_ADMIN_ADDR);

  console.log("Done.");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
