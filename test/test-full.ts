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
      ethers.parseUnits("5000", 18),
      ethers.parseUnits("0.01", "ether"),
      owner.address,
      owner.address,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 86400
    )) as BusinessFranchiseToken;

    await token.waitForDeployment();

    await token.setKoreOperator(owner.address);
    await token.addToWhitelist(addr1.address);
    await token.addToWhitelist(addr2.address);
  });

  it("should deploy and have correct name and symbol", async function () {
    expect(await token.name()).to.equal("FranchiseToken");
    expect(await token.symbol()).to.equal("FTKN");
  });

  it("should allow buying tokens within funding window", async function () {
    await token.connect(addr1).buyTokens({ value: ethers.parseEther("0.05") });
    const balance = await token.balanceOf(addr1.address);
    expect(balance > 0n).to.be.true;
  });

  it("should reject buying tokens outside funding window", async function () {
    await token.setFundingWindow(9999999999, 99999999999);
    await expect(
      token.connect(addr1).buyTokens({ value: ethers.parseEther("0.01") })
    ).to.be.revertedWith("Not in funding window");
  });

  it("should pause and unpause correctly", async function () {
    await token.pause();
    expect(await token.paused()).to.equal(true);

    await expect(
      token.connect(addr1).buyTokens({ value: ethers.parseEther("0.01") })
    ).to.be.revertedWith("Pausable: paused");

    await token.unpause();
    expect(await token.paused()).to.equal(false);

    await token.connect(addr1).buyTokens({ value: ethers.parseEther("0.01") });
    const balance = await token.balanceOf(addr1.address);
    expect(balance > 0n).to.be.true;
  });

  it("should allow adminTransfer by owner", async function () {
    await token.connect(addr1).buyTokens({ value: ethers.parseEther("0.05") });
    const amount = await token.balanceOf(addr1.address);

    await token.adminTransfer(addr1.address, addr2.address, amount);
    expect(await token.balanceOf(addr2.address)).to.equal(amount);
  });

  it("should not allow non-admin to pause", async function () {
    await expect(token.connect(addr1).pause()).to.be.revertedWith(
      "Not authorized"
    );
  });

  it("should allow burning tokens", async function () {
    await token.connect(addr1).buyTokens({ value: ethers.parseEther("0.05") });
    const initial = await token.balanceOf(addr1.address);

    await token.connect(addr1).burn(initial);
    const after = await token.balanceOf(addr1.address);

    expect(after).to.equal(0n);
  });

  it("should emit TokensMinted with full fee", async function () {
    const amount = ethers.parseUnits("10", 18);
    const feeBps = 200n;
    const feeAmount = (amount * feeBps) / 10_000n;
    const netAmount = amount - feeAmount;

    const totalSupply = await token.totalSupply();
    const cap = await token.cap();
    const multiplier = (totalSupply * 10n ** 18n) / cap + 10n ** 18n;
    const finalAmount = (netAmount * multiplier) / 10n ** 18n;

    await expect(token.connect(addr1).mintTokens(amount, true))
      .to.emit(token, "TokensMinted")
      .withArgs(addr1.address, finalAmount, feeAmount);
  });

  it("should emit TokensMinted with partial fee", async function () {
    const amount = ethers.parseUnits("20", 18);
    const feeBps = 100n;
    const feeAmount = (amount * feeBps) / 10_000n;
    const netAmount = amount - feeAmount;

    const totalSupply = await token.totalSupply();
    const cap = await token.cap();
    const multiplier = (totalSupply * 10n ** 18n) / cap + 10n ** 18n;
    const finalAmount = (netAmount * multiplier) / 10n ** 18n;

    await expect(token.connect(addr1).mintTokens(amount, false))
      .to.emit(token, "TokensMinted")
      .withArgs(addr1.address, finalAmount, feeAmount);
  });

  it("should simulate full investor lifecycle", async function () {
    await token.connect(addr1).buyTokens({ value: ethers.parseEther("1.0") });

    const mintAmount = ethers.parseUnits("50", 18);
    await token.connect(addr1).mintTokens(mintAmount, false);

    await token
      .connect(addr1)
      .transfer(addr2.address, ethers.parseUnits("10", 18));
    expect(await token.balanceOf(addr2.address)).to.equal(
      ethers.parseUnits("10", 18)
    );

    const remaining = await token.balanceOf(addr1.address);
    await token.connect(addr1).burn(remaining);
    expect(await token.balanceOf(addr1.address)).to.equal(0n);
  });

  it("should block non-whitelisted user from minting", async function () {
    await expect(
      token.connect(owner).mintTokens(ethers.parseUnits("10", 18), true)
    ).to.be.revertedWith("Address not whitelisted");
  });

  it("should block mint if bonding curve is disabled and toggle is locked", async function () {
    await token.toggleBondingCurve(false);
    await token.connect(addr1).mintTokens(ethers.parseUnits("5", 18), true);

    await expect(token.toggleBondingCurve(true)).to.be.revertedWith(
      "Bonding curve toggle locked after mint"
    );
  });

  it("should allow fee-exempt minting for owner", async function () {
    await token.setFeeExempt(owner.address, true);
    await token.addToWhitelist(owner.address);

    const amount = ethers.parseUnits("10", 18);
    const totalSupply = await token.totalSupply();
    const cap = await token.cap();
    const multiplier = (totalSupply * 10n ** 18n) / cap + 10n ** 18n;
    const finalAmount = (amount * multiplier) / 10n ** 18n;

    await expect(token.connect(owner).mintTokens(amount, true))
      .to.emit(token, "TokensMinted")
      .withArgs(owner.address, finalAmount, 0n);
  });

  it("should prevent minting over cap", async function () {
    const overCap = ethers.parseUnits("10000", 18);
    await expect(
      token.connect(addr1).mintTokens(overCap, true)
    ).to.be.revertedWith("Cap exceeded");
  });

  it("should trigger rollover and emit event", async function () {
    const dummyNewProject = addr2.address;
    await expect(token.triggerRollover(dummyNewProject))
      .to.emit(token, "RolloverTriggered")
      .withArgs(token.target, dummyNewProject);
  });
});
