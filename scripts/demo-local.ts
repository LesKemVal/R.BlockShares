import * as fs from "fs";
import { ethers } from "hardhat";

async function main() {
  const [owner, alt1] = await ethers.getSigners();
  console.log("Owner:", owner.address);
  console.log("Alt 1:", alt1.address);

  // Read deployments/local.json written by the deploy scripts
  const deployments = JSON.parse(fs.readFileSync("deployments/local.json", "utf8"));

  // Swap if your keys are under different names
  const bftAddr  = deployments.BusinessFranchiseToken;
  const regcfAddr = deployments.RegCFToken;

  const BFT = await ethers.getContractAt("BusinessFranchiseToken", bftAddr);
  const CF  = await ethers.getContractAt("RegCFToken", regcfAddr);

  console.log(`\nBFT @ ${await BFT.getAddress()}`);
  console.log(`RegCF @ ${await CF.getAddress()}`);

  // --- BFT quick demo ---
  console.log("\nSetting BFT funding window (now -> now+7d)...");
  const now = Math.floor(Date.now() / 1000);
  await (await BFT.connect(owner).setFundingWindow(now, now + 7 * 24 * 60 * 60)).wait();

  console.log("Enabling bonding curve on BFT...");
  await (await BFT.connect(owner).toggleBondingCurve(true, false)).wait();

  console.log("Minting 100 BFT to owner...");
  await (await BFT.connect(owner).mintTokens(owner.address, ethers.parseUnits("100", 18))).wait();
  const bftBal = await BFT.balanceOf(owner.address);
  console.log("Owner BFT balance:", ethers.formatUnits(bftBal, 18));

  console.log("\nSending 1.0 ETH to BFT and calling distributeRevenue()...");
  await owner.sendTransaction({ to: await BFT.getAddress(), value: ethers.parseEther("1.0") });
  await (await BFT.connect(owner).distributeRevenue()).wait();
  const bftSupply = await BFT.totalSupply();
  console.log("BFT totalSupply:", ethers.formatUnits(bftSupply, 18));

  // --- RegCF quick demo ---
  console.log("\nBuying 5 OBN (RegCF) from owner account...");
  // 5 tokens (5e18 units); cost must be >= calculatePrice(amount)
  const amount = ethers.parseUnits("5", 18);
  const quoted = await CF.calculatePrice(amount);
  console.log("Quoted cost (wei):", quoted.toString());
  await (await CF.connect(owner).buyTokens(amount, { value: quoted })).wait();

  const cfBalOwner = await CF.balanceOf(owner.address);
  console.log("Owner OBN balance:", ethers.formatUnits(cfBalOwner, 18));

  console.log("\nSending 0.5 ETH as platform revenue to RegCF contract...");
  await owner.sendTransaction({ to: await CF.getAddress(), value: ethers.parseEther("0.5") });

  console.log("Distributing RegCF revenue to admin (placeholder logic)...");
  await (await CF.connect(owner).distributeRevenue()).wait();

  console.log("\n✅ Demo complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

