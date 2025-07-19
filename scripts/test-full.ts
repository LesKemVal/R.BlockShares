import { expect } from "chai";
import { ethers } from "hardhat";

describe("BusinessFranchiseToken", function () {
  let token: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("BusinessFranchiseToken");
    token = await Token.deploy(
      "FranchiseToken", // name
      "FTKN", // symbol
      ethers.parseUnits("1000", 18), // initial supply
      ethers.parseUnits("5000", 18), // cap
      ethers.parseUnits("0.01", "ether"), // token price
      owner.address, // funding wallet
      owner.address, // platform fee wallet
      Math.floor(Date.now() / 1000), // funding start (now)
      Math.floor(Date.now() / 1000) + 86400 // funding end (24h later)
    );
    await token.waitForDeployment();

    // Whitelist addr1 and addr2
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
    expect(balance).to.be.gt(0);
  });

  it("should reject buying tokens outside funding window", async function () {
    await token.setFundingWindow(9999999999, 99999999999); // simulate future-only window
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
    expect(balance).to.be.gt(0);
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
    const amountToMint = ethers.parseUnits("10", 18); // 10 tokens
    const expectedFee = (amountToMint * 2n) / 100n;
    const totalCost = ethers.parseEther("0"); // mintTokens does not charge ETH directly

    await expect(
      token.connect(addr1).mintTokens(amountToMint, true, { value: totalCost })
    )
      .to.emit(token, "TokensMinted")
      .withArgs(addr1.address, amountToMint - expectedFee, expectedFee);
  });

  it("should emit TokensMinted with partial fee", async function () {
    const amountToMint = ethers.parseUnits("20", 18); // 20 tokens
    const expectedFee = (amountToMint * 1n) / 100n;

    await expect(token.connect(addr1).mintTokens(amountToMint, false))
      .to.emit(token, "TokensMinted")
      .withArgs(addr1.address, amountToMint - expectedFee, expectedFee);
  });

  it("should simulate full investor lifecycle", async function () {
    // Buy with ETH
    await token.connect(addr1).buyTokens({ value: ethers.parseEther("1.0") });

    // Mint tokens with partial fee
    const mintAmount = ethers.parseUnits("50", 18);
    await token.connect(addr1).mintTokens(mintAmount, false);

    // Transfer to another user
    await token
      .connect(addr1)
      .transfer(addr2.address, ethers.parseUnits("10", 18));
    expect(await token.balanceOf(addr2.address)).to.equal(
      ethers.parseUnits("10", 18)
    );

    // Burn remainder
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
    await token.toggleBondingCurve(false); // disable before mint
    await token.connect(addr1).mintTokens(ethers.parseUnits("5", 18), true); // locks toggle

    await expect(token.toggleBondingCurve(true)).to.be.revertedWith(
      "Bonding curve toggle locked after mint"
    );
  });

  it("should allow fee-exempt minting for owner", async function () {
    await token.setFeeExempt(owner.address, true);
    await token.addToWhitelist(owner.address);

    const amount = ethers.parseUnits("10", 18);
    await expect(token.connect(owner).mintTokens(amount, true))
      .to.emit(token, "TokensMinted")
      .withArgs(owner.address, amount, 0n);
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
