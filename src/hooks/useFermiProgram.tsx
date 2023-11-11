// hook to use fermi dex program

import { FERMI_PROGRAM_ID } from "@/solana/config";
import { IDL } from "@/solana/idl";
import { getProvider } from "@/solana/utils";
import { useProgramStore } from "@/stores/useProgramStore";
import { Program } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

const useFermiProgram = () => {
  const { program, setProgram } = useProgramStore();

  const { connection } = useConnection();
  const connectedWallet = useAnchorWallet();

  useEffect(() => {
    if (!connectedWallet || !connection) return;
    const provider = getProvider(connection, connectedWallet);
    const program = new Program(IDL, FERMI_PROGRAM_ID, provider);
    setProgram(program);
  }, [connectedWallet, connection, setProgram]);

  return { program };
};

export default useFermiProgram