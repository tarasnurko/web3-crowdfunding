import React from "react";
import { useAccount, useContractRead } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { useIsClient } from "usehooks-ts";

import { Loading, Typography } from "@web3uikit/core";
import { CampaignBlock } from "./CampaignBlock";

import { ABI, abi, contractAddress } from "@/constants";
import { useConnected } from "@/hooks";
import { Campaign } from "@/types";

export const MyCampaigns = () => {
  useConnected();
  const { isConnected, address } = useAccount();
  const isClient = useIsClient();

  const {
    data: campaigns,
    isLoading,
    isError,
  } = useContractRead<ABI, "getMyCampaigns", Campaign[]>({
    abi,
    address: contractAddress,
    chainId: polygonMumbai.id,
    functionName: "getMyCampaigns",
    enabled: isConnected,
    account: address,
  });

  const renderData = () => {
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

    if (!campaigns?.length) {
      return (
        <div className="w-full grow flex justify-center items-center text-center">
          <Typography variant="subtitle1">You have no campaigns</Typography>
        </div>
      );
    }

    return (
      <div className="w-full min-h-[400px] flex flex-col justify-between items-center gap-10">
        <div className="grid grid-cols-[repeat(3,280px)] auto-rows-[minmax(340px,max-content)] gap-5 justify-center">
          {campaigns?.map((campaign) => (
            <CampaignBlock
              key={Number(campaign?.id)}
              id={campaign?.id}
              title={campaign?.title}
              description={campaign?.description}
              deadline={campaign?.deadline}
              image={campaign?.image || ""}
              amountCollected={campaign?.amountCollected}
              closed={campaign?.closed}
              donations={campaign?.donations || []}
              owner={campaign?.owner}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full grow flex justify-center min-h-[400px] px-10">
      {renderData()}
    </div>
  );
};
