import { CampaignInfo } from "@/components/CampaignInfo";
import { Header } from "@/components/Header";

export default function CampaignInfoPage() {
  return (
    <main className={`flex w-full min-h-screen flex-col items-center gap-10 `}>
      <Header />
      <CampaignInfo />
    </main>
  );
}
