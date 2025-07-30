require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts/core/reg-cf-token-contract/contracts",
    tests: "./contracts/core/reg-cf-token-contract/test",
    cache: "./contracts/core/reg-cf-token-contract/cache",
    artifacts: "./contracts/core/reg-cf-token-contract/artifacts"
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
