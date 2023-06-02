import { useRouter } from "next/router";
import { useEffect } from "react";
import { useIsClient } from "usehooks-ts";
import { useAccount } from "wagmi";

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
