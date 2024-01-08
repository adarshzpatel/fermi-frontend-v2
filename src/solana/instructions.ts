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

export type FinaliseOrderParams = {
  eventSlot1: number;
  eventSlot2: number;
  authority: PublicKey;
  program: anchor.Program<FermiDex>;
  counterparty: PublicKey;
  marketPda: anchor.web3.PublicKey;
  coinMint: anchor.web3.PublicKey;
  pcMint: anchor.web3.PublicKey;
};

export async function cancelAskIx({
  program,
  authority,
  orderId,
  marketPda,
}: CancelOrderParams) {
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
      authority: authority,
    })
    .rpc();
  console.log(`Cancelled order ${orderId} `, { cancelIx });
  return cancelIx;
}

export async function cancelBidIx({
  program,
  authority,
  orderId,
  marketPda,
}: CancelOrderParams) {
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
  const pcVault = await spl.getAssociatedTokenAddress(pcMint, marketPda, true);
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

  // const pcLotSize = new anchor.BN(1000000);
  // const coinLotSize = new anchor.BN(1000000000);
  const _price = new anchor.BN(price);
  const _qty = new anchor.BN(qty);

  const tx = await program.methods
    .newOrder(
      { bid: {} },
      new anchor.BN(_price),
      new anchor.BN(_qty),
      new anchor.BN(_price).mul(_qty),
      {
        limit: {},
      }
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
};

export const createSellOrderIx = async ({
  price,
  qty,
  pcMint,
  program,
  marketPda,
  coinMint,
  authority,
}: PlaceOrderIxParams) => {
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
  const pcVault = await spl.getAssociatedTokenAddress(pcMint, marketPda, true);

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
  // const pcLotSize = new anchor.BN(1000000);
  // const coinLotSize = new anchor.BN(1000000000)
  const _price = new anchor.BN(price);
  const _qty = new anchor.BN(qty);
  const tx = await program.methods
    .newOrder(
      { ask: {} },
      new anchor.BN(_price),
      new anchor.BN(_qty),
      new anchor.BN(_price).mul(_qty),
      {
        limit: {},
      }
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
};

export const createDepositCoinIx = async ({
  amount,
  marketPda,
  authority,
  program,
  tokenMint,
}: DepositParams) => {
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
};

export const createDepositPcIx = async ({
  amount,
  marketPda,
  authority,
  program,
  tokenMint,
}: DepositParams) => {
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
};

export const createWithdrawCoinIx = async ({
  program,
  amount,
  marketPda,
  coinMint,
  pcMint,
  authority,
}: WithdrawParams) => {
  const pcVault = await spl.getAssociatedTokenAddress(pcMint, marketPda, true);

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

  return withdrawIx;
};

export const createWithdrawPcIx = async ({
  program,
  amount,
  marketPda,
  coinMint,
  pcMint,
  authority,
}: WithdrawParams) => {
  const pcVault = await spl.getAssociatedTokenAddress(pcMint, marketPda, true);

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
    })
    .rpc();

  return withdrawIx;
};

export const finaliseAskIx = async ({
  eventSlot1,
  eventSlot2,
  authority,
  program,
  marketPda,
  coinMint,
  pcMint,
  counterparty,
}: FinaliseOrderParams) => {
  const [reqQPda] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("req-q", "utf-8"), marketPda.toBuffer()],
    program.programId
  );
  const [eventQPda] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("event-q", "utf-8"), marketPda.toBuffer()],
    program.programId
  );

  const authorityCoinTokenAccount: anchor.web3.PublicKey =
    await spl.getAssociatedTokenAddress(
      new anchor.web3.PublicKey(coinMint),
      authority,
      true
    );

  const coinVault = await spl.getAssociatedTokenAddress(
    coinMint,
    marketPda,
    true
  );

  const [openOrdersOwnerPda] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("open-orders", "utf-8"),
      marketPda.toBuffer(),
      authority.toBuffer(),
    ],
    new anchor.web3.PublicKey(program.programId)
  );

  const finalizeAskTx: string = await program.methods
    .finaliseMatchesAsk(eventSlot1, eventSlot2)
    .accounts({
      openOrdersOwner: openOrdersOwnerPda,
      openOrdersCounterparty: counterparty,
      market: marketPda,
      coinMint: coinMint,
      pcMint: pcMint,
      reqQ: reqQPda,
      eventQ: eventQPda,
      coinpayer: authorityCoinTokenAccount,
      coinVault: coinVault,
      authority: authority,
      authoritySecond: authority,
    })
    .rpc();

  return {
    message: "Finalised ask successfully ",
    tx: finalizeAskTx,
  };
};

export const finaliseBidIx = async ({
  eventSlot1,
  eventSlot2,
  authority,
  program,
  counterparty,
  marketPda,
  coinMint,
  pcMint,
}: FinaliseOrderParams) => {
  const [reqQPda] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("req-q", "utf-8"), marketPda.toBuffer()],
    program.programId
  );
  const [eventQPda] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("event-q", "utf-8"), marketPda.toBuffer()],
    program.programId
  );

  const authorityPcTokenAccount = await spl.getAssociatedTokenAddress(
    new anchor.web3.PublicKey(pcMint),
    authority,
    true
  );

  const pcVault = await spl.getAssociatedTokenAddress(pcMint, marketPda, true);

  const [openOrdersOwnerPda] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("open-orders", "utf-8"),
      marketPda.toBuffer(),
      authority.toBuffer(),
    ],
    new anchor.web3.PublicKey(program.programId)
  );

  const finalizeBidTx = await program.methods
    .finaliseMatchesBid(eventSlot1, eventSlot2)
    .accounts({
      openOrdersOwner: openOrdersOwnerPda,
      openOrdersCounterparty: counterparty,
      market: marketPda,
      pcVault: pcVault,
      reqQ: reqQPda,
      eventQ: eventQPda,
      coinMint: coinMint,
      pcMint: pcMint,
      pcpayer: authorityPcTokenAccount,
      authority: authority,
      authoritySecond: authority,
    })
    .rpc();

  return finalizeBidTx;
};
