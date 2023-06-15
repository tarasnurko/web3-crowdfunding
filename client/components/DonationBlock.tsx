import React from "react";
import Blockies from "react-18-blockies";
import { Donation } from "@/types";
import { CopyButton, Typography } from "@web3uikit/core";
import { sliceWalletAddress } from "@/utils";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

export const DonationBlock = ({ donated, donator }: Donation) => {
  const { isConnected, address } = useAccount();

  const isOwnDonate = isConnected && address === donator;

  return (
    <div
      className={`w-full h-14 px-4 flex justify-between items-center bg-orange-100 rounded-md ${
        isOwnDonate ? "bg-green-50" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Blockies seed={donator} />
        <Typography variant="caption14">
          {sliceWalletAddress(donator, 8, 4)} <CopyButton text={donator} />
        </Typography>
      </div>
      <Typography>
        Donated: {ethers.utils.formatEther(donated)} MATIC
      </Typography>
    </div>
  );
};
