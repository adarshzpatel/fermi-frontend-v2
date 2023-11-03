import { Program, AnchorProvider } from "@project-serum/anchor";
import { AnchorWallet,  } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { FERMI_PROGRAM_ID } from "@/solana/config";
import { IDL } from "@/solana/idl";

export const getProvider = (_connection:Connection,_wallet:AnchorWallet) => {
  try{
    if(!_connection){
      throw new Error("No connection found")
    }
    if(!_wallet){ 
      throw new Error("No wallet found")
    }
    const provider = new AnchorProvider(
      _connection,
      _wallet,
      AnchorProvider.defaultOptions()
    );
    console.log("Got Provider",{provider})
    return provider;
  }catch(err){
    console.log("Error in getProvider",err)
  }
}

export const getProgram = (provider:AnchorProvider) => {
  try{
    if(!provider){
      throw new Error("No Provider found")
    }
    const programId = new PublicKey(FERMI_PROGRAM_ID)
    const program = new Program(IDL, programId, provider);
    console.log("Got program",{program})
    return program;
  }catch(err){
    console.log("Error in getProvider",err)
  }
}