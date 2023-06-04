import React from "react";
import { useIsClient } from "usehooks-ts";
import { useContractRead } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import Blockies from "react-18-blockies";

import { CopyButton, Loading, Typography } from "@web3uikit/core";

import { ABI, abi, contractAddress } from "@/constants";
import { Donation } from "@/types";
import { sliceWalletAddress } from "@/utils";

export const TopDonators = () => {
  const isClient = useIsClient();

  // 0xEB7fc18EB6861ba5FF0A53Bb1b26605Ab251926A
  // 0x39673D50E70826E287e595DA274dD67b038E7400

  const {
    data: donators,
    isLoading,
    isError,
  } = useContractRead<ABI, "getTopDonators", Donation[]>({
    abi,
    address: contractAddress,
    chainId: polygonMumbai.id,
    functionName: "getTopDonators",
  });

  console.log(donators);

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

    if (!donators?.length) {
      return (
        <div className="w-full grow flex justify-center items-center text-center">
          <Typography variant="subtitle1">There are no donators yet</Typography>
        </div>
      );
    }

    return (
      <div className="w-[400px] flex flex-col gap-6">
        <div className="w-full h-14 px-4 flex justify-between items-center bg-orange-100 rounded-md">
          <div className="flex items-center gap-2">
            <Blockies seed={"0xEB7fc18EB6861ba5FF0A53Bb1b26605Ab251926A"} />
            <Typography variant="caption14">
              {sliceWalletAddress("0xEB7fc18EB6861ba5FF0A53Bb1b26605Ab251926A")}{" "}
              <CopyButton text={"0xEB7fc18EB6861ba5FF0A53Bb1b26605Ab251926A"} />
            </Typography>
          </div>
          <Typography>Donated: {24}ETH</Typography>
        </div>
        <div className="w-full h-14 px-4 flex justify-between items-center bg-orange-100 rounded-md">
          <div className="flex items-center gap-2">
            <Blockies seed={"0xEB7fc18EB6861ba5FF0A53Bb1b26605Ab251926A"} />
            <Typography variant="caption14">
              {sliceWalletAddress("0xEB7fc18EB6861ba5FF0A53Bb1b26605Ab251926A")}{" "}
              <CopyButton text={"0xEB7fc18EB6861ba5FF0A53Bb1b26605Ab251926A"} />
            </Typography>
          </div>
          <Typography>Donated: {24}ETH</Typography>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full grow flex justify-center px-10">{renderData()}</div>
  );
};
