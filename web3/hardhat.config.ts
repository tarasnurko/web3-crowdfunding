import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  gasReporter: {
    noColors: true,
    outputFile: "gas-price.txt",
    currency: "USD",
  },
};

export default config;
