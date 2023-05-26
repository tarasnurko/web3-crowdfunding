import { Button } from "@web3uikit/core";
import { ConnectButton } from "@web3uikit/web3";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div className="w-full py-5 px-20 bg-slate-300">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-5">
          <Link href="/">Main</Link>
          <Link href="/campaigns/my">My Campaigns</Link>
          <Link href="/top-donators">Top Donators</Link>
        </div>
        {/* <Button text="text" /> */}
        {/* <ConnectButton moralisAuth={false} /> */}
      </div>
    </div>
  );
};

export default Header;
