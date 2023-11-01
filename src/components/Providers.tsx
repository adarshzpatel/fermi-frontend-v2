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
import { motion } from "framer-motion";
import '@solana/wallet-adapter-react-ui/styles.css';

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
      <ConnectionProvider endpoint={endpoint}>
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
    return (
      <motion.div
        layout
        animate={{ opacity: [0.5, 1] }}
        transition={{
          opacity: { ease: "linear" },
          layout: { duration: 0.5 },
        }}
        className="h-screen text-default-500 bg-gradient-to-b from-background to-default-50 flex  justify-center gap-4 w-screen"
      >
        <Spinner size="lg" label="Loading..." color="current" />
      </motion.div>
    );
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
