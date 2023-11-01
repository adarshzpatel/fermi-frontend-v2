import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const useSolBalance = () => {
  const [solBalance, setSolBalance] = useState<number|null>(null);
  const { connection } = useConnection();
  const connectedWallet = useAnchorWallet();

  const getSolBalance = async () => {
    if (!connectedWallet) {
      setSolBalance(null);
      return 

    };
    const bal = await connection.getBalance(connectedWallet?.publicKey);
    setSolBalance(bal);
  };
  useEffect(() => {
    getSolBalance();
  }, [connection, connectedWallet]);

  return {
    solBalance,
    getSolBalance,
  };
};

export default useSolBalance;