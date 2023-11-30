import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const useSolBalance = () => {
  const [solBalance, setSolBalance] = useState<number|null>(null);
  const { connection } = useConnection();
  const connectedWallet = useAnchorWallet();

  const getSolBalance = async () => {
    try{

      if(!connectedWallet) {
        setSolBalance(null);
        return
      };
      const bal = await connection.getBalance(connectedWallet?.publicKey);
      setSolBalance(bal);
      
    } catch(err){
      console.log("Err in getSolBalance",err);
    }
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