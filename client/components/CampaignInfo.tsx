import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { useIsClient } from "usehooks-ts";

import {
  Badge,
  Button,
  CopyButton,
  Input,
  Loading,
  Typography,
  useNotification,
} from "@web3uikit/core";

import { ABI, abi, contractAddress } from "@/constants";
import { Campaign } from "@/types";
import { formatDeadline, sliceWalletAddress } from "@/utils";
import { parseEther } from "viem";
import { ethers } from "ethers";
import { DonationBlock } from "./DonationBlock";

export const CampaignInfo = () => {
  const isClient = useIsClient();
  const { query } = useRouter();
  const { isConnected, address } = useAccount();

  const [donateAmount, setDonateAmount] = useState("0.5");

  const dispatch = useNotification();

  const campaignId = useMemo(() => query.id, [query]);
  const fetchEnabled = !!(isClient && campaignId);

  const {
    data: campaign,
    isLoading,
    isError,
  } = useContractRead<ABI, "getCampaign", Campaign>({
    abi,
    address: contractAddress,
    chainId: polygonMumbai.id,
    functionName: "getCampaign",
    args: [campaignId],
    enabled: fetchEnabled,
  });

  const { write: donateCampaign } = useContractWrite<ABI, "donateCampaign">({
    abi,
    address: contractAddress,
    chainId: polygonMumbai.id,
    functionName: "donateCampaign",
    account: address,
    args: [campaignId],
    onSuccess: async () => {
      dispatch({
        type: "success",
        title: "Donate Success",
        message: "Successfully donated to the campaign",
        position: "topR",
      });
    },
    onError: () => {
      dispatch({
        type: "error",
        title: "Donate Error",
        message: "Failed to donate to the campaign",
        position: "topR",
      });
    },
  });

  const { write: retrieve } = useContractWrite<ABI, "closeCampaign">({
    abi,
    address: contractAddress,
    chainId: polygonMumbai.id,
    functionName: "closeCampaign",
    account: address,
    args: [campaignId],
    onSuccess: () => {
      dispatch({
        type: "success",
        title: "Donate Success",
        message: "Successfully retrieved funds from the campaign",
        position: "topR",
      });
    },
    onError: () => {
      dispatch({
        type: "error",
        title: "Donate Error",
        message: "Failed to retreive funds from the campaign",
        position: "topR",
      });
    },
  });

  const isCampaignEnded = useMemo(
    () => new Date() > new Date(Number(campaign?.deadline) * 1000),
    [campaign?.deadline]
  );

  const handleRetrieve = useCallback(() => {
    retrieve();
  }, [retrieve]);

  const handleDonate = useCallback(async () => {
    const value = ethers.utils.parseEther(donateAmount).toBigInt();
    donateCampaign({ value });
  }, [donateAmount, donateCampaign]);

  const renderCampaignStatus = () => {
    if (!campaign) return;

    if (!isConnected) {
      <Typography variant="caption14">Connect metamask to donate</Typography>;
    }

    if (campaign?.closed) {
      return <Badge state="danger" text="Closed" />;
    }

    if (isCampaignEnded && campaign?.owner === address) {
      return (
        <Button text="Retrieve" theme="primary" onClick={handleRetrieve} />
      );
    }

    if (isCampaignEnded) {
      return <Badge state="warning" text="Ended" />;
    }

    if (isConnected && campaign?.owner !== address) {
      return (
        <div className="mt-2 flex items-center gap-2">
          <Button text="Donate" theme="primary" onClick={handleDonate} />{" "}
          <Input
            label="Ammount to donate"
            name="funds"
            onChange={(e) => setDonateAmount(e.target.value)}
            value={donateAmount}
            type="number"
            width="220px"
          />
        </div>
      );
    }

    return;
  };

  const renderDonations = () => {
    if (!campaign?.donations || !campaign?.donations.length) return;

    const reversedDonations = campaign.donations.reverse();

    return (
      <div className="mt-8 w-full flex flex-col gap-4">
        {reversedDonations.map((donation, index) => (
          <DonationBlock
            donated={donation.donated}
            donator={donation.donator}
            key={index}
          />
        ))}
      </div>
    );
  };

  const renderCampaign = () => {
    if (!isClient || isLoading) {
      return (
        <div className="w-full grow flex justify-center items-center">
          <Loading
            fontSize={12}
            size={12}
            spinnerColor="#2E7DAF"
            spinnerType="wave"
            text="Loading..."
          />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="w-full grow flex justify-center items-center text-center">
          <Typography variant="subtitle1">
            Something went wrong, try again please
          </Typography>
        </div>
      );
    }

    if (!campaign) {
      return (
        <div className="w-full grow flex justify-center items-center text-center">
          <Typography variant="subtitle1">
            Campaign with id ${campaignId} doesnt exist
          </Typography>
        </div>
      );
    }

    const ammountCollected = ethers.utils.formatEther(campaign.amountCollected);

    return (
      <div className="w-[400px] flex flex-col gap-2">
        <Image
          src={campaign?.image || ""}
          alt="preview"
          className="w-full aspect-square object-cover rounded-sm"
          width="0"
          height="0"
          sizes="100vw"
        />
        <Typography variant="subtitle2">{campaign?.title}</Typography>
        <Typography variant="caption14">{campaign?.description}</Typography>
        <Typography variant="caption14">
          Owner: {sliceWalletAddress(campaign?.owner)}{" "}
          <CopyButton text={campaign?.owner} />
        </Typography>

        <Typography variant="caption14">
          Deadline: {formatDeadline(Number(campaign?.deadline))}
        </Typography>
        <Typography variant="caption14">
          Collected: {ammountCollected} MATIC
        </Typography>
        {renderCampaignStatus()}
        {renderDonations()}
      </div>
    );
  };

  return (
    <div className="w-full grow flex justify-center min-h-[400px] px-10">
      {renderCampaign()}
    </div>
  );
};
