import { ethers, run } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy();

  await crowdfunding.deployed();

  console.log(`Crowdfunding deployed to ${crowdfunding.address}`);

  console.log("Verifying contract...");

  try {
    await run("verify:verify", {
      address: crowdfunding.address,
      constructorArguments: [],
    });
  } catch (error: any) {
    if (error?.message?.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
