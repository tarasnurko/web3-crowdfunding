// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// import { expect } from "chai";
// import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Crowdfunding, Crowdfunding__factory } from "../typechain-types";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, ContractTransaction, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

describe("Crowdfunding", function () {
  let crowdfunding: Crowdfunding;
  let crowdfundingContract: Crowdfunding__factory;
  let deployer: SignerWithAddress;
  let accounts: SignerWithAddress[];

  const campaignTitle = "Test Campaign";
  const campaignDescription = "Test description";
  const campaignImage =
    "https://s0.rbk.ru/v6_top_pics/media/img/3/29/755085079290293.jpg";

  const getDeadline = (seconds: number) =>
    Math.floor(Date.now() / 1000) + seconds;

  const createDefaultCampaign = async (
    campaignOwner: Signer | Provider,
    seconds: number
  ): Promise<ContractTransaction> => {
    const deadline = getDeadline(seconds);

    return await crowdfunding
      .connect(campaignOwner)
      .createCampaign(
        campaignTitle,
        campaignDescription,
        campaignImage,
        deadline
      );
  };

  beforeEach(async () => {
    const allAccounts = await ethers.getSigners();

    deployer = allAccounts[0];
    accounts = allAccounts.slice(1);

    crowdfundingContract = await ethers.getContractFactory("Crowdfunding");
    crowdfunding = await crowdfundingContract.deploy();

    await crowdfunding.deployed();
  });

  describe("constructor", function () {
    it("should set the contract deployer as the owner", async () => {
      expect(await crowdfunding.i_owner()).to.equal(deployer.address);
    });
  });

  describe("createCampaign", function () {
    it("should create campaign", async () => {
      const deadline = Math.floor(Date.now() / 1000) + 100;

      const campaignOwner = accounts[0];

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      const tx = await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      await tx.wait(1);

      const campaign = (await crowdfunding.getAllCampaigns())[campaignId];

      expect(campaign.id).to.equal(0);
      expect(campaign.title).to.equal(campaignTitle);
      expect(campaign.description).to.equal(campaignDescription);
      expect(campaign.image).to.equal(campaignImage);
      expect(campaign.deadline).to.equal(deadline);
      expect(campaign.owner).to.equal(campaignOwner.address);
      expect(campaign.amountCollected).to.equal(0);
    });

    it("should revert if the deadline is in the past and title", async () => {
      const deadline = getDeadline(-100);

      await expect(
        crowdfunding.createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        )
      ).to.be.revertedWithCustomError(crowdfunding, `IncorrectDeadlineError`);
    });

    it("should revert if title, description or image are empty", async () => {
      const deadline = getDeadline(100);

      // Test with empty title
      await expect(
        crowdfunding.createCampaign(
          "",
          campaignDescription,
          campaignImage,
          deadline
        )
      ).to.be.revertedWithCustomError(crowdfunding, `FillAllFields`);

      // Test with empty description
      await expect(
        crowdfunding.createCampaign(campaignTitle, "", campaignImage, deadline)
      ).to.be.revertedWithCustomError(crowdfunding, `FillAllFields`);

      // Test with empty image
      await expect(
        crowdfunding.createCampaign(
          campaignTitle,
          campaignDescription,
          "",
          deadline
        )
      ).to.be.revertedWithCustomError(crowdfunding, `FillAllFields`);
    });

    it("should emit CampaignCreated event", async () => {
      const deadline = getDeadline(100);

      await expect(
        crowdfunding.createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        )
      ).to.emit(crowdfunding, "CampaignCreated");
    });
  });

  describe("donateCampaign", function () {
    it("should add a new donation to the campaign", async () => {
      const deadline = getDeadline(100);

      const campaignOwner = accounts[0];
      const donator = accounts[1];

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      const donationAmount = ethers.utils.parseEther("1"); // 1 ETH
      const tx = await crowdfunding
        .connect(donator)
        .donateCampaign(campaignId, {
          value: donationAmount,
        });

      const campaign = await crowdfunding.getCampaign(campaignId);

      const donations = campaign.donations;

      expect(donations).to.have.lengthOf(1);
      expect(donations[0].donator).to.equal(donator.address);
      expect(donations[0].donated.toString()).to.equal(
        donationAmount.toString()
      );

      await expect(tx)
        .to.emit(crowdfunding, "CampaignDonated")
        .withArgs(donationAmount.toString());
    });

    it("should revert not enough funds", async () => {
      const deadline = getDeadline(100);

      const campaignOwner = accounts[0];
      const donator = accounts[1];

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      const donationAmount = ethers.utils.parseEther("0.005"); // 0.005 ETH

      await expect(
        crowdfunding.connect(donator).donateCampaign(campaignId, {
          value: donationAmount,
        })
      ).to.be.revertedWithCustomError(crowdfunding, "NotEnoughFunds");
    });

    it("should revert campaign not found", async () => {
      const donator = accounts[1];

      const campaignId = 999;
      const donationAmount = ethers.utils.parseEther("1");

      await expect(
        crowdfunding.connect(donator).donateCampaign(campaignId, {
          value: donationAmount,
        })
      ).to.be.revertedWithCustomError(crowdfunding, "NoCampaignFound");
    });

    it("should sum donator funds", async () => {
      const deadline = getDeadline(100);

      const campaignOwner = accounts[0];
      const donator = accounts[1];

      // const initialBalance = await donator.getBalance();

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      const donationAmount = ethers.utils.parseEther("1");
      const donatedSum = ethers.utils.parseEther("2");

      const tx1 = await crowdfunding
        .connect(donator)
        .donateCampaign(campaignId, {
          value: donationAmount,
          gasLimit: 1000000,
        });

      // const receipt1 = await tx1.wait(1);

      const tx2 = await crowdfunding
        .connect(donator)
        .donateCampaign(campaignId, {
          value: donationAmount,
          gasLimit: 1000000,
        });

      // const receipt2 = await tx2.wait(1);

      const campaign = await crowdfunding.getCampaign(campaignId);

      const donations = campaign.donations;

      expect(donations).to.have.lengthOf(1);
      expect(donations[0].donator).to.equal(donator.address);
      expect(donations[0].donated.toString()).to.equal(donatedSum.toString());

      // const finalBalance = await donator.getBalance();

      // const expectedFinalBalance = initialBalance
      //   .add(donationAmount)
      //   .add(donationAmount)
      //   .sub(donatedSum);

      // expect(finalBalance.toString()).to.equal(expectedFinalBalance.toString());
    });
  });
  describe("closeCampaign", function () {
    it("should close the campaign and transfer funds to the owner", async () => {
      const campaignOwner = accounts[0];
      const donator1 = accounts[1];
      const donator2 = accounts[2];

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      console.log("Campaign Id: ", campaignId);

      const donationAmount = ethers.utils.parseEther("1");

      const deadline = getDeadline(100);

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      const initialBalance = await campaignOwner.getBalance();

      const gasPrice1 = await ethers.provider.getGasPrice();

      const tx1 = await crowdfunding
        .connect(donator1)
        .donateCampaign(campaignId, {
          value: donationAmount,
        });

      const receipt1 = await tx1.wait(1);
      const gasCost1 = gasPrice1.mul(receipt1.gasUsed);

      const gasPrice2 = await ethers.provider.getGasPrice();

      const tx2 = await crowdfunding
        .connect(donator2)
        .donateCampaign(campaignId, {
          value: donationAmount,
        });

      const receipt2 = await tx2.wait(1);
      const gasCost2 = gasPrice2.mul(receipt2.gasUsed);

      const gasPrice3 = await ethers.provider.getGasPrice();

      const tx3 = await crowdfunding
        .connect(campaignOwner)
        .closeCampaign(campaignId);

      const receipt3 = await tx3.wait(1);
      const gasCost3 = gasPrice3.mul(receipt3.gasUsed);

      const campaign = await crowdfunding.getCampaign(campaignId);

      expect(campaign.closed).to.be.true;

      const finalBalance = await campaignOwner.getBalance();

      const expectedBalance = initialBalance
        .sub(gasCost1)
        .sub(gasCost2)
        .sub(gasCost3)
        .add(donationAmount.mul(2));

      expect(finalBalance.toString()).to.equal(expectedBalance.toString());
    });
  });
});
