import { ethers } from "hardhat";

async function main() {
  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy();

  await crowdfunding.deployed();

  console.log(`Crowdfunding deployed to ${crowdfunding.address}`);
}

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

export default main;
main.tags = ["all", "crowdfunding"];
