import { getProgram, getProvider } from "@/solana/utils";
import { ProgramContextType } from "@/types";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { createContext, useMemo, useState } from "react";
import * as anchor from "@project-serum/anchor";
import * as spl from "@solana/spl-token";
import { MARKETS } from "@/solana/config";

export const ProgramContext = createContext<ProgramContextType>({
  program: undefined,
  provider: undefined,
  market: MARKETS[0],
  setMarket: () => {},
});

type ProgramProviderProps = {
  children: React.ReactNode;
};

export const ProgramProvider = ({ children }: ProgramProviderProps) => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const [market, setMarket] = useState<ProgramContextType["market"]>(MARKETS[0]);
  
  const provider = useMemo(() => {
    if (connection && anchorWallet) {
      return getProvider(connection, anchorWallet);
    } else {
      return null;
    }
  }, [connection, anchorWallet]);

  const program = useMemo(() => {
    if (provider) {
      return getProgram(provider);
    } else {
      return null;
    }
  }, [provider]);

  return (
    <ProgramContext.Provider value={{ program, provider, market, setMarket }}>
      {children}
    </ProgramContext.Provider>
  );
};
