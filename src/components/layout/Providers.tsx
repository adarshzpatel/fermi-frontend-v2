import { NextUIProvider, Spinner } from "@nextui-org/react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

import "@solana/wallet-adapter-react-ui/styles.css";

type ProviderProps = {
  children: React.ReactNode;
};

const SolanaWalletProviders = ({ children }: ProviderProps) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );

  return (
    <>
      <ConnectionProvider endpoint={endpoint} config={{commitment:'finalized'}}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};

const Providers = ({ children }: ProviderProps) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-screen h-screen grid place-items-center"><Spinner size="lg"/></div>;
  }
  return (
    <SolanaWalletProviders>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "!border !border-default-300 !bg-default-50 !shadow-xl !text-gray-200",
        }}
      />
      <NextUIProvider>{children}</NextUIProvider>
    </SolanaWalletProviders>
  );
};

export default Providers;
