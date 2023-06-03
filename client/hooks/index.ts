import { ABI, abi, contractAddress } from "@/constants";
import { CreateCampaign } from "@/types";
import { useNotification } from "@web3uikit/core";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useIsClient } from "usehooks-ts";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

export const useConnected = () => {
  const router = useRouter();
  const isClient = useIsClient();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isClient && !isConnected) {
      router.push("/");
    }
  }, [isClient, isConnected, router]);
};

export const useCreateCampaign = () => {
  const dispatch = useNotification();

  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi,
    chainId: polygonMumbai.id,
    functionName: "createCampaign",
    onSuccess: () => {
      dispatch({
        type: "success",
        title: "Campaign Creation",
        message: "Campaign was successfuly created",
        position: "topR",
      });
    },
    onError: () => {
      dispatch({
        type: "error",
        title: "Campaign Creation",
        message: "Failed to create the campaign",
        position: "topR",
      });
    },
  });

  const { write } = useContractWrite(config);

  return useContractWrite(config);
};
