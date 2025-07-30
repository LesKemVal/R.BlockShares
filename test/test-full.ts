import { expect } from "chai";
import { ethers } from "hardhat";
import { BusinessFranchiseToken } from "../typechain-types/contracts/core/BusinessFranchiseToken";

describe("BusinessFranchiseToken", function () {
  let token: BusinessFranchiseToken;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("BusinessFranchiseToken");
    token = (await Token.deploy(
      "FranchiseToken",
      "FTKN",
      ethers.parseUnits("1000", 18),
      owner.address // escrowWallet
    )) as BusinessFranchiseToken;

    await token.waitForDeployment();
  });

  it("should deploy and have correct name and symbol", async function () {
    expect(await token.name()).to.equal("FranchiseToken");
    expect(await token.symbol()).to.equal("FTKN");
  });

  it("should allow Kore operator to set funding window", async function () {
    const now = Math.floor(Date.now() / 1000);
    await token.setFundingWindow(now, now + 86400);
    expect(await token.fundingStart()).to.equal(now);
    expect(await token.fundingEnd()).to.equal(now + 86400);
  });

  it("should update escrow wallet by Kore operator", async function () {
    await token.setEscrowWallet(addr1.address);
    expect(await token.escrowWallet()).to.equal(addr1.address);
  });

  it("should toggle bonding curve and lock it", async function () {
    await token.toggleBondingCurve(true, false);
    expect(await token.bondingCurveEnabled()).to.be.true;

    await token.toggleBondingCurve(false, true);
    expect(await token.bondingCurveLocked()).to.be.true;
  });

  it("should distribute revenue to admin holders", async function () {
    // Mint tokens to ensure totalSupply > 0
    await token.mintTokens(owner.address, ethers.parseUnits("100", 18));

    // Send ether to the contract to simulate revenue
    await owner.sendTransaction({
      to: token.target,
      value: ethers.parseEther("1.0"),
    });

    // Distribute revenue - should emit event
    await expect(token.distributeRevenue()).to.emit(token, "RevenueDistributed");
  });

  it("should pause and unpause transfers", async function () {
    await token.pause();
    expect(await token.paused()).to.equal(true);

    await token.unpause();
    expect(await token.paused()).to.equal(false);
  });
});
