import { getProgram, getProvider } from "@/solana/utils";
import { ProgramContextType } from "@/types";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { createContext, useMemo } from "react";

export const ProgramContext = createContext<ProgramContextType>({
  program: undefined,
  provider: undefined,
});

type ProgramProviderProps = {
  children: React.ReactNode;
};

export const ProgramProvider = ({ children }: ProgramProviderProps) => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

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
    <ProgramContext.Provider value={{ program, provider }}>
      {children}
    </ProgramContext.Provider>
  );
};
