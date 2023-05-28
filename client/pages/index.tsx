import Image from "next/image";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import { useEvmNativeBalance } from "@moralisweb3/next";
import AllCampaigns from "@/components/AllCampaigns";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center gap-10 ${inter.className}`}
    >
      <Header />
      <AllCampaigns />
    </main>
  );
}
