const { ethers } = require("hardhat");
const config = require("../contract-config");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with deployer:", deployer.address);

  // Replace with your desired initial feeReceiver and complianceAdmin addresses
  const feeReceiver = deployer.address;
  // Leave complianceAdmin as zero address for now or put a placeholder for later update
  const complianceAdmin = ethers.constants.AddressZero;

  const CreateTokenFactory = await ethers.getContractFactory("CreateTokenFactory");

  const factory = await CreateTokenFactory.deploy(
    deployer.address, // initialOwner
    feeReceiver,
    complianceAdmin
  );

  await factory.deployed();

  console.log("CreateTokenFactory deployed to:", factory.address);

  // Save the factory address for use in other scripts
  // e.g. update your contract-config.js or write to a file
  // Here just output for manual update
  console.log("Update contract-config.js with factoryAddress:", factory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
