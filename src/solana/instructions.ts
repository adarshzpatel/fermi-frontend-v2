// TODO
// placeBuyOrder
// placeSellOrder
// finalize order
// cancel order

import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { FermiDex } from "./idl";
import * as spl from "@solana/spl-token";
import { FERMI_PROGRAM_ID } from "./config";

export type PlaceOrderIxParams = {
  marketPda: PublicKey;
  coinMint: PublicKey;
  pcMint: PublicKey;
  price: string;
  qty: string;
  authority: PublicKey;
  program: anchor.Program<FermiDex>;
};

export const createBuyOrderIx = async ({
  price,
  qty,
  program,
  marketPda,
  coinMint,
  pcMint,
  authority,
}: PlaceOrderIxParams) => {
  try {
    const [bidsPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("bids", "utf-8"), marketPda.toBuffer()],
      program.programId
    );
    const [asksPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("asks", "utf-8"), marketPda.toBuffer()],
      program.programId
    );

    const [reqQPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("req-q", "utf-8"), marketPda.toBuffer()],
      program.programId
    );
    const [eventQPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("event-q", "utf-8"), marketPda.toBuffer()],
      program.programId
    );

    const coinVault = await spl.getAssociatedTokenAddress(
      coinMint,
      marketPda,
      true
    );
    const pcVault = await spl.getAssociatedTokenAddress(
      pcMint,
      marketPda,
      true
    );
    const authorityPcTokenAccount = await spl.getAssociatedTokenAddress(
      new anchor.web3.PublicKey(pcMint),
      authority,
      false
    );

    const [openOrdersPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("open-orders", "utf-8"),
        new anchor.web3.PublicKey(marketPda).toBuffer(),
        authority.toBuffer(),
      ],
      new anchor.web3.PublicKey(FERMI_PROGRAM_ID)
    );

    const tx = await program.methods
      .newOrder(
        { bid: {} },
        new anchor.BN(price).mul(),
        new anchor.BN(qty),
        new anchor.BN(price).mul(new anchor.BN(qty)),
        { limit: {} }
      )
      .accounts({
        openOrders: openOrdersPda,
        market: marketPda,
        coinVault,
        pcVault,
        coinMint: coinMint,
        pcMint: pcMint,
        payer: authorityPcTokenAccount,
        bids: bidsPda,
        asks: asksPda,
        reqQ: reqQPda,
        eventQ: eventQPda,
        authority: authority,
      })
      .rpc();

    return tx;
  } catch (err) {
    console.log("Error in createBuyOrder", err);
  }
};

export const createSellOrderIx = async ({
  price,
  qty,
  program,
  marketPda,
  coinMint,
  pcMint,
  authority,
}: PlaceOrderIxParams) => {
  try {
    const [bidsPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("bids", "utf-8"), marketPda.toBuffer()],
      program.programId
    );
    const [asksPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("asks", "utf-8"), marketPda.toBuffer()],
      program.programId
    );

    const [reqQPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("req-q", "utf-8"), marketPda.toBuffer()],
      program.programId
    );
    const [eventQPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("event-q", "utf-8"), marketPda.toBuffer()],
      program.programId
    );

    const coinVault = await spl.getAssociatedTokenAddress(
      coinMint,
      marketPda,
      true
    );
    const pcVault = await spl.getAssociatedTokenAddress(
      pcMint,
      marketPda,
      true
    );

    const authorityCoinTokenAccount = await spl.getAssociatedTokenAddress(
      new anchor.web3.PublicKey(coinMint),
      authority,
      false
    );

    const [openOrdersPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("open-orders", "utf-8"),
        new anchor.web3.PublicKey(marketPda).toBuffer(),
        authority.toBuffer(),
      ],
      new anchor.web3.PublicKey(FERMI_PROGRAM_ID)
    );

    const tx = await program.methods
      .newOrder(
        { ask: {} },
        new anchor.BN(price),
        new anchor.BN(qty),
        new anchor.BN(price).mul(new anchor.BN(qty)),
        { limit: {} }
      )
      .accounts({
        openOrders: openOrdersPda,
        market: marketPda,
        coinVault,
        pcVault,
        coinMint: coinMint,
        pcMint: pcMint,
        payer: authorityCoinTokenAccount,
        bids: bidsPda,
        asks: asksPda,
        reqQ: reqQPda,
        eventQ: eventQPda,
        authority: authority,
      })
      .rpc();

    return tx;
  } catch (err) {
    console.log("Error in createSellOrder", err);
  }
};
