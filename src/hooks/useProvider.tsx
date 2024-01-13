import { AnchorProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

const useProvider = () => {
  const { connection } = useConnection();
  const connectedWallet = useAnchorWallet();

  const provider = useMemo(() => {
    if (connectedWallet) {
      const provider = new AnchorProvider(
        connection,
        connectedWallet,
        AnchorProvider.defaultOptions()
      );

      return provider
    }
  }, [connectedWallet, connection]);

  return provider
};

export default useProvider
