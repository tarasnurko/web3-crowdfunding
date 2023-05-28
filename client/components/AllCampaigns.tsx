import React, { useState } from "react";
import { useIsClient } from "usehooks-ts";
import { useEvmRunContractFunction } from "@moralisweb3/next";
import { abi } from "@/constants";
import { contractAddress } from "@/constants";
import { Pagination, Loading, Typography } from "@web3uikit/core";
import { Campaign, PaginatedCampaigns } from "@/types";
import CampaignBlock from "./CampaignBlock";

const AllCampaigns = () => {
  const [page, setPage] = useState<number>(1);

  const { data, isFetching } = useEvmRunContractFunction({
    abi,
    address: contractAddress,
    chain: 80001,
    functionName: "paginateCampaigns",
    params: {
      _page: page,
      _limit: 9,
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderData = () => {
    if (isFetching) {
      return (
        <div className="w-full h-[400px] flex justify-center items-center">
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

    const paginatedCampaigns = data as PaginatedCampaigns | undefined;

    return (
      <div className="w-full min-h-[400px] flex flex-col justify-between items-center gap-10">
        <div className="grid grid-cols-[repeat(3,280px)] auto-rows-[minmax(340px,max-content)] gap-5 justify-center">
          <CampaignBlock
            amountCollected="0.004"
            closed={false}
            deadline="45544545"
            description="sadad dasd asd asd asd sadad dasd asd asd asdsadad dasd asd asd asdsadad dasd asd asd asdsadad dasd asd asd asdsadad dasd asd asd asdsadad dasd asd asd asdsadad dasd asd asd asdsadad dasd asd asd asdsadad dasd asd asd asdsadad dasd asd asd asdsadad dasd asd asd asd"
            id="asda"
            image="https://images.pexels.com/photos/16944712/pexels-photo-16944712.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load"
            donations={[{ donated: "ads", donator: "dasas" }]}
            owner="0xEB7fc18EB6861ba5FF0A53Bb1b26605Ab251926A"
            title="Title Title Title TitleTitleTitlTitle Title Title e"
          />
          <CampaignBlock
            amountCollected="0.004"
            closed={false}
            deadline="45544545"
            description="sadad dasd asd asd asd "
            id="asda"
            image="https://images.pexels.com/photos/16944712/pexels-photo-16944712.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load"
            donations={[{ donated: "ads", donator: "dasas" }]}
            owner="0xEB7fc18EB6861ba5FF0A53Bb1b26605Ab251926A"
            title="Title"
          />
          <CampaignBlock
            amountCollected="0.004"
            closed={false}
            deadline="45544545"
            description="sadad dasd asd asd asd "
            id="asda"
            image="https://images.pexels.com/photos/16944712/pexels-photo-16944712.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load"
            donations={[{ donated: "ads", donator: "dasas" }]}
            owner="0xEB7fc18EB6861ba5FF0A53Bb1b26605Ab251926A"
            title="Title"
          />
        </div>
        <Pagination
          currentPage={page}
          onPageChange={handlePageChange}
          pageSize={9}
          totalCount={parseInt(paginatedCampaigns?.[2] || "0")}
          siblingCount={1}
        />
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center items-center min-h-[400px] px-10">
      {renderData()}
    </div>
  );
};

export default AllCampaigns;
