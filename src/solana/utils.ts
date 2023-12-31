import {
  Wallet,
  web3,
  Program,
  AnchorProvider,
  BN,
} from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { FERMI_PROGRAM_ID } from "@/solana/config";

import * as spl from "@solana/spl-token";
import { EventQueueItem, Order } from "@/types";
import { FermiDex, IDL } from "./idl";

export const priceFromOrderId = (orderId: BN) => {
  const price = BN(orderId).shrn(64).toNumber();
  return price
};

export const timestampFromOrderId = (orderId: BN) => {
  const timestamp = (BigInt(orderId.toString()) << BigInt(64)).toString();
  return timestamp;
};

export function parseEventQ(eventQ: any) {
  const events: EventQueueItem[] = [];

  for (let i = 0; i < (eventQ as any[]).length; i++) {
    const e = eventQ[i];

    if (e.orderId.toString() === "0") continue;
    const event: EventQueueItem = {} as EventQueueItem;
    event["idx"] = i;
    event["orderId"] = e.orderId.toString();
    event["orderIdSecond"] = e.orderIdSecond.toString();
    event["owner"] = e.owner.toString();
    event["eventFlags"] = e.eventFlags;
    event["ownerSlot"] = e.ownerSlot;
    event["finalised"] = e.finalised;
    event["nativeQtyReleased"] = e.nativeQtyReleased.toString();
    event["nativeQtyPaid"] = e.nativeQtyPaid.toString();
    event["timestamp"] = e.timestamp.toString();
    events.push(event);
  }
  return events;
}

export const getProvider = (_connection: Connection, _wallet: AnchorWallet) => {
  try {
    if (!_connection) {
      throw new Error("No connection found");
    }
    if (!_wallet) {
      throw new Error("No wallet found");
    }
    const provider = new AnchorProvider(
      _connection,
      _wallet,
      AnchorProvider.defaultOptions()
    );
    return provider;
  } catch (err) {
    console.log("Error in getProvider", err);
  }
};

export const getProgram = (provider: AnchorProvider) => {
  try {
    if (!provider) {
      throw new Error("No Provider found");
    }
    const programId = new PublicKey(FERMI_PROGRAM_ID);
    const program = new Program(IDL, programId, provider);
    return program;
  } catch (err) {
    console.log("Error in getProvider", err);
  }
};

export const getOpenOrders = async (
  authorityPubKey: PublicKey,
  marketPda: web3.PublicKey,
  program: Program<FermiDex>
) => {
  const [openOrdersPda] = await web3.PublicKey.findProgramAddress(
    [
      Buffer.from("open-orders", "utf-8"),
      marketPda.toBuffer(),
      authorityPubKey.toBuffer(),
    ],
    new web3.PublicKey(program?.programId)
  );

  const openOrders = await program.account.openOrders.fetch(openOrdersPda);
  return openOrders;
};

export const createMint = async (
  provider: AnchorProvider,
  mint: Keypair,
  decimal: number
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
          spl.MintLayout.span
        ),
      })
    );
    tx.add(
      spl.createInitializeMintInstruction(
        mint.publicKey,
        decimal,
        provider.wallet.publicKey,
        provider.wallet.publicKey
      )
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
  owner: PublicKey
) => {
  try {
    const tx = new Transaction();
    tx.add(
      spl.createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        ata,
        owner,
        mint
      )
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
  amount: bigint
) => {
  try {
    const tx = new Transaction();
    tx.add(
      spl.createMintToInstruction(
        mint,
        ta,
        provider.wallet.publicKey,
        amount,
        []
      )
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
    );
    const account = await spl.getAccount(connection, associatedTokenAddress);

    return account?.amount.toString();
  } catch (error) {
    console.error("Error in fetchTokenBalance:", error);
    throw error;
  }
};

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
      AnchorProvider.defaultOptions()
    );

    const authorityCoinTokenAccount: PublicKey =
      await spl.getAssociatedTokenAddress(
        new web3.PublicKey(coinMint),
        authority.publicKey,
        false
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
    console.log(
      "✅ Coin tokens minted to ",
      authorityCoinTokenAccount.toString()
    );

    return authorityCoinTokenAccount;
  } catch (err) {
    console.log("Something went wrong while airdropping coin token.");
    console.log(err);
  }
};

export type OrderMatch = {
  event1: {
    slot: number;
    owner: PublicKey;
  };
  event2: {
    slot: number;
    owner: PublicKey;
  };
};

export type OrderMatchMap = {
  [key: string]: OrderMatch;
};

export const findMatchingEvents = (
  orderIds: string[],
  events: EventQueueItem[]
) => {
  const orderIdMap = new Map<string, EventQueueItem>();
  const orderIdSecondMap = new Map<string, EventQueueItem>();

  // Pre-process events into separate maps
  for (const e of events) {
    if (
      e.nativeQtyReleased !== "0" &&
      e.orderId !== "0" &&
      e.nativeQtyPaid !== "0"
    ) {
      if (!orderIdMap.has(e.orderId)) {
        orderIdMap.set(e.orderId, e);
      }
      if (!orderIdSecondMap.has(e.orderIdSecond) && e.orderIdSecond !== "0") {
        orderIdSecondMap.set(e.orderIdSecond, e);
      }
    }
  }

  const matchedEvents: OrderMatchMap = {} as OrderMatchMap;
  for (const orderId of orderIds) {
    if (orderId === "0") continue;
    // console.log("matching events for ", orderId)
    const orderIdMatched = orderIdMap.get(orderId);
    // console.log("Found order id matching with event idx",orderIdMatched?.idx)
    if (!orderIdMatched) continue;

    let orderIdSecondMatched;

    if (orderIdMatched?.orderIdSecond === "0") {
      // console.log('hey could not find order id second ')
      orderIdSecondMatched = orderIdSecondMap.get(orderId);
    } else {
      // console.log("Found order id second")
      orderIdSecondMatched = orderIdMap.get(orderIdMatched?.orderIdSecond);
    }
    if (orderIdMatched && orderIdSecondMatched) {
      if (orderIdMatched < orderIdSecondMatched) {
        matchedEvents[orderId] = {
          event1: {
            slot: orderIdMatched.idx,
            owner: new PublicKey(orderIdMatched.owner),
          },
          event2: {
            slot: orderIdSecondMatched.idx,
            owner: new PublicKey(orderIdSecondMatched.owner),
          },
        };
      } else {
        matchedEvents[orderId] = {
          event1: {
            slot: orderIdSecondMatched.idx,
            owner: new PublicKey(orderIdSecondMatched.owner),
          },
          event2: {
            slot: orderIdMatched.idx,
            owner: new PublicKey(orderIdMatched.owner),
          },
        };
      }
    }
  }

  return matchedEvents;
};
