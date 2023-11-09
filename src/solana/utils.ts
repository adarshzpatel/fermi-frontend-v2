import {Wallet, web3, Program, AnchorProvider } from "@project-serum/anchor";
import { AnchorWallet,  } from "@solana/wallet-adapter-react";
import { Connection, PublicKey,Keypair,  SystemProgram, Transaction } from "@solana/web3.js";
import { FERMI_PROGRAM_ID } from "@/solana/config";
import { IDL } from "@/solana/idl";
import * as spl from "@solana/spl-token";

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

export const createMint = async (
  provider: AnchorProvider,
  mint: Keypair,
  decimal: number,
) => {
  try {
    const tx = new Transaction();
    tx.add(
      SystemProgram.createAccount({
        programId: spl.TOKEN_PROGRAM_ID,
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: spl.MintLayout.span,
        lamports: await provider.connection.getMinimumBalanceForRentExemption(
          spl.MintLayout.span,
        ),
      }),
    );
    tx.add(
      spl.createInitializeMintInstruction(
        mint.publicKey,
        decimal,
        provider.wallet.publicKey,
        provider.wallet.publicKey,
      ),
    );
    await provider.sendAndConfirm(tx, [mint]);
  } catch (error) {
    console.error("Error in createMint:", error);
    throw error;
  }
};

export const createAssociatedTokenAccount = async (
  provider: AnchorProvider,
  mint: PublicKey,
  ata: PublicKey,
  owner: PublicKey,
) => {
  try {
    const tx = new Transaction();
    tx.add(
      spl.createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        ata,
        owner,
        mint,
      ),
    );
    await provider.sendAndConfirm(tx, []);
  } catch (error) {
    console.error("Error in createAssociatedTokenAccount:", error);
    throw error;
  }
};

export const mintTo = async (
  provider: AnchorProvider,
  mint: PublicKey,
  ta: PublicKey,
  amount: bigint,
) => {
  try {
    const tx = new Transaction();
    tx.add(
      spl.createMintToInstruction(
        mint,
        ta,
        provider.wallet.publicKey,
        amount,
        [],
      ),
    );
    await provider.sendAndConfirm(tx, []);
  } catch (error) {
    console.error("Error in mintTo:", error);
    throw error;
  }
};

export const fetchTokenBalance = async (
  userPubKey: PublicKey,
  mintPubKey: PublicKey,
  connection: Connection
) => {
  try {

    const associatedTokenAddress = await spl.getAssociatedTokenAddress(
      mintPubKey,
      userPubKey,
      false
    )
    const account = await spl.getAccount(connection,associatedTokenAddress);

    return account?.amount.toString();

  } catch (error) {
    console.error("Error in fetchTokenBalance:", error);
    throw error;
  }
}


export const airdropCustomToken = async (
  userKp: Keypair,
  owner: Keypair,
  connection: Connection,
  mint: PublicKey,
  amount: BigInt
): Promise<PublicKey | undefined> => {
  try {
    //const { coinMint } = marketConstants;
    const coinMint = mint;
    const authority = userKp;
    const wallet = new Wallet(owner);
    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions(),
    );

    const authorityCoinTokenAccount: PublicKey = await spl.getAssociatedTokenAddress(
      new web3.PublicKey(coinMint),
      authority.publicKey,
      false,
    );

    if (!(await connection.getAccountInfo(authorityCoinTokenAccount))) {
      await createAssociatedTokenAccount(
        provider,
        new web3.PublicKey(coinMint),
        authorityCoinTokenAccount,
        authority.publicKey
      );
      console.log("✅ Coin ATA created for ", authority.publicKey.toString());
    }

    await mintTo(
      provider,
      new web3.PublicKey(coinMint),
      authorityCoinTokenAccount,
      BigInt(amount.toString())
    );
    console.log("✅ Coin tokens minted to ", authorityCoinTokenAccount.toString());

    return authorityCoinTokenAccount;
  } catch (err) {
    console.log('Something went wrong while airdropping coin token.');
    console.log(err);
  }
};