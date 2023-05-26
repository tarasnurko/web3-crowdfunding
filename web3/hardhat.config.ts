import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";

import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    polygon_mumbai: {
      // url: "https://rpc-mumbai.maticvigil.com",
      url: process.env.POLYGON_MUMBAI_API_KEY,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY as string],
      chainId: 80001,
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },
  gasReporter: {
    noColors: true,
    outputFile: "gas-price.txt",
    currency: "USD",
  },
};

export default config;
