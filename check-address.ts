import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function checkAddress() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("No private key in .env");
    return;
  }
  const wallet = new ethers.Wallet(`0x${privateKey}`);
  console.log("Wallet address:", wallet.address);
}
checkAddress();
