import { Header } from "@/components/Header";
import { TopDonators } from "@/components/TopDonators";

export default function TopDonatorsPage() {
  return (
    <div className={"flex min-h-screen flex-col items-center gap-10"}>
      <Header />
      <TopDonators />
    </div>
  );
}
