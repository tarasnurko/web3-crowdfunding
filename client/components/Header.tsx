import React from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@web3uikit/core";
import { useIsClient } from "usehooks-ts";

export const Header = () => {
  const isClient = useIsClient();

  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    connect({ connector: connectors[0] });
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const renderConnectBtn = () =>
    isClient &&
    !isConnected && (
      <Button
        text="Connect via Metamask"
        onClick={handleConnect}
        theme="colored"
        color="blue"
      />
    );

  const renderDisconnectBtn = () =>
    isClient &&
    isConnected && (
      <Button
        text="Disconnect"
        onClick={handleDisconnect}
        theme="translucent"
      />
    );

  const renderConnectedLinks = () =>
    isClient &&
    isConnected && (
      <>
        <Link
          href="/campaigns/my"
          className="text-blue-500 hover:text-blue-700"
        >
          My Campaigns
        </Link>
        <Link
          href="/campaigns/create"
          className="text-blue-500 hover:text-blue-700"
        >
          Create Campaign
        </Link>
      </>
    );

  return (
    <div className="w-full bg-slate-100 border-gray-200 px-10 py-2.5 dark:bg-gray-800">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            Main
          </Link>

          <Link
            href="/top-donators"
            className="text-blue-500 hover:text-blue-700"
          >
            Top Donators
          </Link>
          {renderConnectedLinks()}
        </div>
        {renderConnectBtn()}
        {renderDisconnectBtn()}
      </div>
    </div>
  );
};
