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

const CampaignBlock = ({
  id,
  title,
  description,
  owner,
  image,
  deadline,
  amountCollected,
  closed,
}: Campaign) => {
  const router = useRouter();

  const handleVisitCampaign = () => {
    router.push(`/${id}`);
  };

  return (
    <div className="w-full p-3 min-h-full flex flex-col gap-2 bg-teal-50 rounded-lg">
      <Image
        src={image}
        alt="preview"
        className="w-full aspect-square rounded-sm"
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
        Deadline: {formatDeadline(deadline)}
      </Typography>
      <Typography variant="caption14">
        Collected: {amountCollected} ETH
      </Typography>
      {!closed ? (
        <Button text="Visit" theme="primary" onClick={handleVisitCampaign} />
      ) : (
        <Button disabled text="Closed" theme="colored" color="red" />
      )}
    </div>
  );
};

export default CampaignBlock;
