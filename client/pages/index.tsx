import Image from "next/image";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import { useEvmNativeBalance } from "@moralisweb3/next";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const address = "0x1...";
  const { data: nativeBalance } = useEvmNativeBalance({ address });

  return (
    <main
      className={`flex min-h-screen flex-col items-center gap-10 ${inter.className}`}
    >
      <Header />
    </main>
  );
}
