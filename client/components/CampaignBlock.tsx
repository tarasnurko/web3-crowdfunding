import React from "react";
import Image from "next/image";
import { Campaign } from "@/types";
import { Button, CopyButton, Typography } from "@web3uikit/core";
import {
  formatDeadline,
  sliceDescription,
  sliceTitle,
  sliceWalletAddress,
} from "@/utils";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useIsClient } from "usehooks-ts";

export const CampaignBlock = ({
  id,
  title,
  description,
  owner,
  image,
  deadline,
  amountCollected,
  closed,
}: Campaign) => {
  const isClient = useIsClient();
  const router = useRouter();
  const { isConnected, address } = useAccount();

  const handleVisitCampaign = () => {
    router.push(`/${Number(id)}`);
  };

  const ownCampaignStyles =
    isClient && isConnected && address === owner ? "bg-teal-50" : "bg-lime-50";

  const campaignClosedStyles = closed && "bg-red-300";

  return (
    <div
      className={`w-full p-3 min-h-full flex flex-col gap-2 rounded-lg ${ownCampaignStyles} ${campaignClosedStyles}`}
    >
      <Image
        src={image}
        alt="preview"
        className="w-full aspect-square object-cover rounded-sm"
        width="0"
        height="0"
        sizes="100vw"
      />
      <Typography variant="subtitle2">{sliceTitle(title)}</Typography>
      <Typography variant="caption14">
        Owner: {sliceWalletAddress(owner)} <CopyButton text={owner} />
      </Typography>
      <Typography variant="caption14">
        Description: {sliceDescription(description)}
      </Typography>
      <Typography variant="caption14">
        Deadline: {formatDeadline(Number(deadline))}
      </Typography>
      <Typography variant="caption14">
        Collected: {Number(amountCollected)} ETH
      </Typography>
      <div className="mt-auto">
        {!closed ? (
          <Button text="Visit" theme="primary" onClick={handleVisitCampaign} />
        ) : (
          <Button disabled text="Closed" theme="colored" color="red" />
        )}
      </div>
    </div>
  );
};
