import {create} from "zustand";
import { Program } from "@project-serum/anchor";
import { FermiDex } from "@/solana/idl";

type ProgramStore = {
  program: Program<FermiDex> | null;
  setProgram: (program: Program<FermiDex>) => void;
};

export const useProgramStore = create<ProgramStore>((set) => ({
  program: null,
  setProgram: (program: Program<FermiDex>) => set({ program }),
}));
