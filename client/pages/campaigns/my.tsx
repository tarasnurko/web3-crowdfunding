import { Header } from "@/components/Header";
import { MyCampaigns } from "@/components/MyCampaigns";

export default function MyCampaignsPage() {
  return (
    <div className={"flex min-h-screen flex-col items-center gap-10"}>
      <Header />
      <MyCampaigns />
    </div>
  );
}
