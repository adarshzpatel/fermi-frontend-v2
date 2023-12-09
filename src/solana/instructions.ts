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

export type CancelOrderParams = {
  program: anchor.Program<FermiDex>;
  authority: PublicKey;
  orderId: string;
  marketPda: PublicKey;
};

export type DepositParams = {
  amount: number;
  marketPda: PublicKey;
  authority: PublicKey;
  program: anchor.Program<FermiDex>;
  tokenMint: PublicKey;
};

export type WithdrawParams = {
  program: anchor.Program<FermiDex>;
  amount: number;
  marketPda: PublicKey;
  coinMint: PublicKey;
  pcMint: PublicKey;
  authority: PublicKey;
};

export async function cancelAskIx({
  program,
  authority,
  orderId,
  marketPda,
}: CancelOrderParams) {
  try {
    if (Number(orderId) === 0) {
      console.log("Invalid order id. Aborting ...");
      return;
    }

    const [bidsPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("bids", "utf-8"), marketPda.toBuffer()],
      program.programId
    );
    const [asksPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("asks", "utf-8"), marketPda.toBuffer()],
      program.programId
    );

    const [openOrdersPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("open-orders", "utf-8"),
        new anchor.web3.PublicKey(marketPda).toBuffer(),
        authority.toBuffer(),
      ],
      new anchor.web3.PublicKey(program.programId)
    );

    const [eventQPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("event-q", "utf-8"), marketPda.toBuffer()],
      program.programId
    );

    const cancelIx = await program.methods
      .cancelAsk(new anchor.BN(orderId), authority)
      .accounts({
        openOrders: openOrdersPda,
        market: marketPda,
        bids: bidsPda,
        asks: asksPda,
        eventQ: eventQPda,
        authority: authority, // Assuming this is the expected owner
      })
      .rpc();
    console.log(`Cancelled order ${orderId} `, { cancelIx });
    return cancelIx;
  } catch (err) {
    console.log(err);
  }
}

export async function cancelBidIx({
  program,
  authority,
  orderId,
  marketPda,
}: CancelOrderParams) {
  try {
    if (Number(orderId) === 0) {
      console.log("Invalid order id. Aborting ...");
      return;
    }

    const [bidsPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("bids", "utf-8"), marketPda.toBuffer()],
      program.programId
    );
    const [asksPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("asks", "utf-8"), marketPda.toBuffer()],
      program.programId
    );

    const [openOrdersPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("open-orders", "utf-8"),
        new anchor.web3.PublicKey(marketPda).toBuffer(),
        authority.toBuffer(),
      ],
      new anchor.web3.PublicKey(program.programId)
    );

    const [eventQPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("event-q", "utf-8"), marketPda.toBuffer()],
      program.programId
    );

    const cancelIx = await program.methods
      .cancelBid(new anchor.BN(orderId), authority)
      .accounts({
        openOrders: openOrdersPda,
        market: marketPda,
        bids: bidsPda,
        asks: asksPda,
        eventQ: eventQPda,
        authority: authority, // Assuming this is the expected owner
      })
      .rpc();

    console.log(`Cancelled order ${orderId} `, { cancelIx });
    return cancelIx;
  } catch (err) {
    console.log(err);
  }
}

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

    const _price = new anchor.BN(price);
    const _qty = new anchor.BN(qty);

    const tx = await program.methods
      .newOrder({ bid: {} }, _price, _qty, new anchor.BN(_price).mul(_qty), {
        limit: {},
      })
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

    const _price = new anchor.BN(price);
    const _qty = new anchor.BN(qty);

    const tx = await program.methods
      .newOrder({ ask: {} }, _price, _qty, new anchor.BN(_price).mul(_qty), {
        limit: {},
      })
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

export const createDepositCoinIx = async ({
  amount,
  marketPda,
  authority,
  program,
  tokenMint,
}: DepositParams) => {
  try {
    const coinVault = await spl.getAssociatedTokenAddress(
      tokenMint,
      marketPda,
      true
    );
    const authorityCoinTokenAccount = await spl.getAssociatedTokenAddress(
      new anchor.web3.PublicKey(tokenMint),
      authority,
      false
    );

    const [openOrdersPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("open-orders", "utf-8"),
        new anchor.web3.PublicKey(marketPda).toBuffer(),
        authority.toBuffer(),
      ],
      new anchor.web3.PublicKey(program.programId)
    );

    const depositIx = await program.methods
      .depositCoinTokens(new anchor.BN(amount))
      .accounts({
        openOrders: openOrdersPda,
        market: marketPda,
        vault: coinVault,
        payer: authorityCoinTokenAccount,
        authority: authority,
      })
      .rpc();

    return depositIx;
  } catch (err) {
    console.log("Error in createDepositCoinIx", err);
  }
};

export const createDepositPcIx = async ({
  amount,
  marketPda,
  authority,
  program,
  tokenMint,
}: DepositParams) => {
  try {
    const pcVault = await spl.getAssociatedTokenAddress(
      tokenMint,
      marketPda,
      true
    );

    const authorityPcTokenAccount = await spl.getAssociatedTokenAddress(
      new anchor.web3.PublicKey(tokenMint),
      authority,
      false
    );

    const [openOrdersPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("open-orders", "utf-8"),
        new anchor.web3.PublicKey(marketPda).toBuffer(),
        authority.toBuffer(),
      ],
      new anchor.web3.PublicKey(program.programId)
    );

    const depositIx = await program.methods
      .depositPcTokens(new anchor.BN(amount))
      .accounts({
        openOrders: openOrdersPda,
        market: marketPda,
        vault: pcVault,
        payer: authorityPcTokenAccount,
        authority: authority,
      })
      .rpc();

    return depositIx;
  } catch (err) {
    console.log("Error in createDepositPcIx", err);
  }
};

export const createWithdrawCoinIx = async ({
  program,
  amount,
  marketPda,
  coinMint,
  pcMint,
  authority,
}: WithdrawParams) => {
  try {
    const pcVault = await spl.getAssociatedTokenAddress(
      pcMint,
      marketPda,
      true
    );

    const coinVault = await spl.getAssociatedTokenAddress(
      coinMint,
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
      new anchor.web3.PublicKey(program.programId)
    );

    const withdrawIx = await program.methods
      .withdrawCoins(new anchor.BN(amount))
      .accounts({
        openOrders: openOrdersPda,
        market: marketPda,
        coinMint: coinMint,
        pcMint: pcMint,
        coinVault: coinVault,
        pcVault: pcVault,
        payer: authorityCoinTokenAccount,
        authority: authority,
      })
      .rpc();

      return withdrawIx
  } catch (err) {
    console.log("Error in createWithdrawCoinIx", err);
  }
};

export const createWithdrawPcIx = async ({
  program,
  amount,
  marketPda,
  coinMint,
  pcMint,
  authority,
}: WithdrawParams) => {
  try {
    const pcVault = await spl.getAssociatedTokenAddress(
      pcMint,
      marketPda,
      true
    );

    const coinVault = await spl.getAssociatedTokenAddress(
      coinMint,
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
      new anchor.web3.PublicKey(program.programId)
    );

    const withdrawIx = await program.methods
      .withdrawTokens(new anchor.BN(amount))
      .accounts({
        openOrders: openOrdersPda,
        market: marketPda,
        coinMint: coinMint,
        pcMint: pcMint,
        coinVault: coinVault,
        pcVault: pcVault,
        payer: authorityPcTokenAccount,
        authority: authority,
      }).rpc();

      return withdrawIx;
  } catch (err) {
    console.log("Error in createWithdrawPcIx", err);
  }
};
