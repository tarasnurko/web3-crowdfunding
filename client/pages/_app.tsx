import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NotificationProvider } from "@web3uikit/core";

import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { Inter } from "next/font/google";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [new MetaMaskConnector({ chains })],
});

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      {/* <SessionProvider session={pageProps.session} refetchInterval={0}> */}
      <NotificationProvider>
        <main className={`${inter.className}`}>
          <Component {...pageProps} />
        </main>
      </NotificationProvider>
      {/* </SessionProvider> */}
    </WagmiConfig>
  );
}
