require("dotenv").config();

require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@nomiclabs/hardhat-solhint");

/** @type import('hardhat/config').HardhatUserConfig */
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  (INFURA_API_KEY ? `https://sepolia.infura.io/v3/${INFURA_API_KEY}` : "");

const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY || "";
const PRIVATE_KEY =
  PRIVATE_KEY_RAW && PRIVATE_KEY_RAW.startsWith("0x")
    ? PRIVATE_KEY_RAW
    : PRIVATE_KEY_RAW
    ? `0x${PRIVATE_KEY_RAW}`
    : "";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 10000 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545" },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

