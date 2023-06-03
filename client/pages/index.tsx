import { Header } from "@/components/Header";
import { AllCampaigns } from "@/components/AllCampaigns";

export default function Home() {
  return (
    <div className={"flex min-h-screen flex-col items-center gap-10"}>
      <Header />
      <AllCampaigns />
    </div>
  );
}
