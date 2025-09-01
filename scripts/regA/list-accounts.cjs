require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
  console.log("Your deployer address:", wallet.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


