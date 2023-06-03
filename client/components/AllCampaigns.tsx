import React, { useState } from "react";
import { useIsClient } from "usehooks-ts";

// import { useEvmRunContractFunction } from "@moralisweb3/next";
import { useContractRead } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

import { Pagination, Loading, Typography } from "@web3uikit/core";
import { CampaignBlock } from "./CampaignBlock";

import { ABI, abi, contractAddress } from "@/constants";
import { Campaign, PaginatedCampaigns } from "@/types";
import { formatDeadline } from "@/utils";

export const AllCampaigns = () => {
  const [page, setPage] = useState<number>(1);

  const isClient = useIsClient();

  // const { data, isFetching } = useEvmRunContractFunction({
  //   abi,
  //   address: contractAddress,
  //   chain: 80001,
  //   functionName: "paginateCampaigns",
  // params: {
  //   _page: page,
  //   _limit: 9,
  // },
  // });

  const {
    data: paginatedCampaigns,
    isLoading,
    isError,
  } = useContractRead<ABI, "paginateCampaigns", PaginatedCampaigns>({
    abi,
    address: contractAddress,
    chainId: polygonMumbai.id,
    functionName: "paginateCampaigns",
    args: [page, 9],
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  console.log(paginatedCampaigns);

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

    if (!paginatedCampaigns?.campaigns.length) {
      return (
        <div className="w-full grow flex justify-center items-center text-center">
          <Typography variant="subtitle1">No Campaigns Created yet</Typography>
        </div>
      );
    }

    // const paginatedCampaigns = data as PaginatedCampaigns | undefined;

    return (
      <div className="w-full min-h-[400px] flex flex-col justify-between items-center gap-10">
        <div className="grid grid-cols-[repeat(3,280px)] auto-rows-[minmax(340px,max-content)] gap-5 justify-center">
          {paginatedCampaigns.campaigns.map((campaign) => (
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
        <Pagination
          currentPage={page}
          onPageChange={handlePageChange}
          pageSize={9}
          // totalCount={parseInt(paginatedCampaigns?.[2] || "0")}
          totalCount={Number(paginatedCampaigns?.total) || 0}
          siblingCount={1}
        />
      </div>
    );
  };

  return (
    <div className="w-full grow flex justify-center min-h-[400px] px-10">
      {renderData()}
    </div>
  );
};
