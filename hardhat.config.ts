import * as dotenv from "dotenv";
dotenv.config();

import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-solhint";
import type { HardhatUserConfig } from "hardhat/config";

// Env
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  (INFURA_API_KEY ? `https://sepolia.infura.io/v3/${INFURA_API_KEY}` : "");

const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY || "";
const PRIVATE_KEY = PRIVATE_KEY_RAW
  ? PRIVATE_KEY_RAW.startsWith("0x")
    ? PRIVATE_KEY_RAW
    : `0x${PRIVATE_KEY_RAW}`
  : "";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "";
const BTP_RPC_URL = process.env.BTP_RPC_URL || "";
const BTP_GAS_PRICE = process.env.BTP_GAS_PRICE || "auto";

const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
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
      url: SEPOLIA_RPC_URL, // must be non-empty
      accounts,
      chainId: 11155111,
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts,
      chainId: 80001,
    },
    btp: {
      url: BTP_RPC_URL,
      accounts,
      chainId: 80001, // update if your BTP chain differs
      // @ts-ignore - allow "auto" for gasPrice if your tooling supports it
      gasPrice: BTP_GAS_PRICE === "auto" ? "auto" : parseInt(BTP_GAS_PRICE),
    },
  },

  // Etherscan API key mapping per network
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
    // (optional) explicit endpoints
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

export default config;

