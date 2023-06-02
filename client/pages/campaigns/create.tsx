import Header from "@/components/Header";

import CreateCampaignForm from "@/components/CreateCampaign";

export default function CreateCampaignPage() {
  return (
    <main className={`flex w-full min-h-screen flex-col items-center gap-10 `}>
      <Header />
      <CreateCampaignForm />
    </main>
  );
}
