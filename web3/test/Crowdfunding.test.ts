import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Crowdfunding, Crowdfunding__factory } from "../typechain-types";
import { ethers, network } from "hardhat";
import { expect } from "chai";

describe("Crowdfunding", function () {
  let crowdfunding: Crowdfunding;
  let crowdfundingContract: Crowdfunding__factory;
  let deployer: SignerWithAddress;
  let accounts: SignerWithAddress[];

  const campaignTitle = "Test Campaign";
  const campaignDescription = "Test description";
  const campaignImage =
    "https://static.wikia.nocookie.net/classikcars/images/f/f8/Top-gear.jpg/revision/latest?cb=20111008175520";

  const getTimestamp = (seconds: number) =>
    Math.floor(Date.now() / 1000) + seconds;

  const getRandomNum = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  beforeEach(async () => {
    [deployer, ...accounts] = await ethers.getSigners();

    await network.provider.send("hardhat_reset");

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
      const deadline = getTimestamp(-100);

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
      const deadline = getTimestamp(100);

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
      const deadline = getTimestamp(100);

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
      const deadline = getTimestamp(100);

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

    it("should revert campaign is closed", async () => {
      const deadline = getTimestamp(100);

      const campaignOwner = accounts[0];
      const donator = accounts[1];

      const donationAmount = ethers.utils.parseEther("1");

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      const pastTimestamp = getTimestamp(200);

      await network.provider.send("evm_setNextBlockTimestamp", [pastTimestamp]);
      await network.provider.send("evm_mine");

      await crowdfunding.connect(campaignOwner).closeCampaign(campaignId);

      await expect(
        crowdfunding
          .connect(donator)
          .donateCampaign(campaignId, { value: donationAmount })
      ).to.be.revertedWithCustomError(crowdfunding, "CampaignAlreadyClosed");
    });

    it("should revert not enough funds", async () => {
      const deadline = getTimestamp(100);

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

    it("owner can not donate to own campaign", async () => {
      const deadline = getTimestamp(100);

      const campaignOwner = accounts[0];

      const donationAmount = ethers.utils.parseEther("1");

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      await expect(
        crowdfunding
          .connect(campaignOwner)
          .donateCampaign(campaignId, { value: donationAmount })
      ).to.be.revertedWithCustomError(
        crowdfunding,
        "CanNotDonateToOwnCampaign"
      );
    });

    it("should sum donator funds", async () => {
      const deadline = getTimestamp(100);

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

      const donationAmount = ethers.utils.parseEther("1");
      const donatedSum = ethers.utils.parseEther("2");

      await crowdfunding.connect(donator).donateCampaign(campaignId, {
        value: donationAmount,
      });

      await crowdfunding.connect(donator).donateCampaign(campaignId, {
        value: donationAmount,
      });

      const campaign = await crowdfunding.getCampaign(campaignId);

      const donations = campaign.donations;

      expect(donations).to.have.lengthOf(1);
      expect(donations[0].donator).to.equal(donator.address);
      expect(donations[0].donated.toString()).to.equal(donatedSum.toString());
    });
  });
  describe("closeCampaign", function () {
    it("should close the campaign and transfer funds to the owner", async () => {
      const campaignOwner = accounts[0];
      const donator1 = accounts[1];
      const donator2 = accounts[2];

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      const donationAmount = ethers.utils.parseEther("1");

      const deadline = getTimestamp(100);

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      const initialBalance = await campaignOwner.getBalance();

      await crowdfunding.connect(donator1).donateCampaign(campaignId, {
        value: donationAmount,
      });

      await crowdfunding.connect(donator2).donateCampaign(campaignId, {
        value: donationAmount,
      });

      const pastTimestamp = getTimestamp(200);

      await network.provider.send("evm_setNextBlockTimestamp", [pastTimestamp]);
      await network.provider.send("evm_mine");

      const tx = await crowdfunding
        .connect(campaignOwner)
        .closeCampaign(campaignId);

      const receipt = await tx.wait(1);
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const campaign = await crowdfunding.getCampaign(campaignId);

      expect(campaign.closed).to.be.true;

      const finalBalance = await campaignOwner.getBalance();

      const expectedBalance = initialBalance
        .add(donationAmount.mul(2))
        .sub(gasUsed);

      expect(finalBalance.toString()).to.equal(expectedBalance.toString());
    });

    it("should revert if the campaign is already closed", async () => {
      const campaignOwner = accounts[0];
      const donator1 = accounts[1];
      const donator2 = accounts[2];

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      const donationAmount = ethers.utils.parseEther("1");

      const deadline = getTimestamp(100);

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      await crowdfunding.connect(donator1).donateCampaign(campaignId, {
        value: donationAmount,
      });

      await crowdfunding.connect(donator2).donateCampaign(campaignId, {
        value: donationAmount,
      });

      const pastTimestamp = getTimestamp(200);

      await network.provider.send("evm_setNextBlockTimestamp", [pastTimestamp]);
      await network.provider.send("evm_mine");

      await crowdfunding.connect(campaignOwner).closeCampaign(campaignId);

      await expect(
        crowdfunding.connect(campaignOwner).closeCampaign(campaignId)
      ).to.be.revertedWithCustomError(crowdfunding, `CampaignAlreadyClosed`);
    });

    it("should revert if a non-owner tries to close the campaign", async () => {
      const campaignOwner = accounts[0];
      const notCampaignOwner = accounts[1];

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      const deadline = getTimestamp(100);

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      await expect(
        crowdfunding.connect(notCampaignOwner).closeCampaign(campaignId)
      ).to.be.revertedWithCustomError(crowdfunding, `AccessDenied`);
    });

    it("should revert if close non-existing campaign", async () => {
      await expect(
        crowdfunding.connect(accounts[0]).closeCampaign(999)
      ).to.be.revertedWithCustomError(crowdfunding, `NoCampaignFound`);
    });

    it("should revert if close not ended campaign", async () => {
      const campaignOwner = accounts[0];

      const campaignId = (await crowdfunding.getNextCampaignId()).toNumber();

      const deadline = getTimestamp(100);

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          campaignTitle,
          campaignDescription,
          campaignImage,
          deadline
        );

      await expect(
        crowdfunding.connect(campaignOwner).closeCampaign(campaignId)
      ).to.be.revertedWithCustomError(crowdfunding, `DeadlineNotEnd`);
    });
  });

  describe("paginateCampaigns", function () {
    it("should paginate campaigns", async () => {
      const campaignOwner = accounts[0];

      const deadline = getTimestamp(100);

      for (let i = 0; i < 5; i++) {
        await crowdfunding
          .connect(campaignOwner)
          .createCampaign(
            campaignTitle,
            campaignDescription,
            campaignImage,
            deadline
          );
      }

      const page = 1;
      const limit = 3;

      const paginatedCampaigns = await crowdfunding.paginateCampaigns(
        page,
        limit
      );

      expect(paginatedCampaigns.page).to.be.equal(page);
      expect(paginatedCampaigns.limit).to.be.equal(limit);
      expect(paginatedCampaigns.campaigns.length).to.be.equal(limit);
    });

    it("should return 0 campaigns", async () => {
      const page = 999;
      const limit = 3;

      const paginatedCampaigns = await crowdfunding.paginateCampaigns(
        page,
        limit
      );

      expect(paginatedCampaigns.campaigns.length).to.be.equal(0);
    });

    it("should return not more than last campaign", async () => {
      const campaignOwner = accounts[0];

      const deadline = getTimestamp(100);

      for (let i = 0; i < 5; i++) {
        await crowdfunding
          .connect(campaignOwner)
          .createCampaign(
            campaignTitle,
            campaignDescription,
            campaignImage,
            deadline
          );
      }

      const page = 1;
      const limit = 10;

      const { campaigns } = await crowdfunding.paginateCampaigns(page, limit);

      const lastCampaignId =
        (await crowdfunding.getNextCampaignId()).toNumber() - 1;

      const lastCampaign = campaigns[campaigns.length - 1];

      expect(lastCampaign.id.toString()).to.be.equal(lastCampaignId.toString());
    });
  });

  describe("getMyCampaigns", function () {
    it("should return my campaigns", async () => {
      const campaignOwner = accounts[0];

      const deadline = getTimestamp(100);

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          "Campaign 1",
          campaignDescription,
          campaignImage,
          deadline
        );

      await crowdfunding
        .connect(campaignOwner)
        .createCampaign(
          "Campaign 2",
          campaignDescription,
          campaignImage,
          deadline
        );

      const myCampaigns = await crowdfunding
        .connect(campaignOwner)
        .getMyCampaigns();

      expect(myCampaigns.length).to.equal(2);
      expect(myCampaigns[0].title).to.equal("Campaign 1");
      expect(myCampaigns[1].title).to.equal("Campaign 2");
    });
  });

  describe("getTopDonators", function () {
    it("should return top donators", async () => {
      let allDonators: Record<string, number> = {};

      const campaignOwner = accounts[0];

      const deadline = getTimestamp(100);

      for (let i = 0; i < 5; i++) {
        const nextCampaignId = (
          await crowdfunding.getNextCampaignId()
        ).toNumber();

        await crowdfunding
          .connect(campaignOwner)
          .createCampaign(
            campaignTitle,
            campaignDescription,
            campaignImage,
            deadline
          );

        for (let j = 0; j < 5; j++) {
          const randomNum = getRandomNum(1, 9);

          const donationAmount = ethers.utils.parseEther(`${randomNum}`);

          const randomDonator = accounts[randomNum];

          await crowdfunding
            .connect(randomDonator)
            .donateCampaign(nextCampaignId, {
              value: donationAmount,
            });

          if (allDonators[randomDonator.address]) {
            allDonators[randomDonator.address] += randomNum;
          } else {
            allDonators[randomDonator.address] = randomNum;
          }
        }
      }

      const topDonators = await crowdfunding.getTopDonators();

      let donatorsArray = Object.entries(allDonators);
      donatorsArray.sort((a, b) => b[1] - a[1]);

      topDonators.forEach((item, index) => {
        expect(item.donator).to.be.equal(donatorsArray[index][0]);
        expect(parseFloat(ethers.utils.formatEther(item.donated))).to.be.equal(
          donatorsArray[index][1]
        );
      });
    });
  });
});
