import React, { useMemo } from "react";
import { useIsClient } from "usehooks-ts";
import { useContractRead } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

import { Loading, Typography } from "@web3uikit/core";

import { ABI, abi, contractAddress } from "@/constants";
import { Donation } from "@/types";
import { DonationBlock } from "./DonationBlock";

export const TopDonators = () => {
  const isClient = useIsClient();

  const {
    data: donations,
    isLoading,
    isError,
  } = useContractRead<ABI, "getTopDonators", Donation[]>({
    abi,
    address: contractAddress,
    chainId: polygonMumbai.id,
    functionName: "getTopDonators",
  });

  const reversedDonations = useMemo(() => donations?.reverse(), []);

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

    if (!reversedDonations?.length) {
      return (
        <div className="w-full grow flex justify-center items-center text-center">
          <Typography variant="subtitle1">There are no donators yet</Typography>
        </div>
      );
    }

    return (
      <div className="w-[400px] flex flex-col gap-6">
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

  return (
    <div className="w-full grow flex justify-center px-10">{renderData()}</div>
  );
};
