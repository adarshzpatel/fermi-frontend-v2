import { FERMI_PROGRAM_ID } from "@/solana/config";
import { FermiDex, IDL } from "@/solana/idl";
import { getProvider, parseEventQ, priceFromOrderId } from "@/solana/utils";
import {
  EventQueueType,
  MarketType,
  OpenOrdersType,
  Order,
  TokenBalances,
} from "@/types";
import { Program } from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { create } from "zustand";

type FermiStoreState = {
  eventQ: EventQueueType | null;
  selectedMarket: MarketType | null;
  tokenBalances: TokenBalances | null;
  openOrders: OpenOrdersType;
  bids: Order[] | null;
  asks: Order[] | null;
  program: Program<FermiDex> | null;
};

type FermiStoreActions = {
  fetchEventQ: () => Promise<void>;
  setSelectedMarket: (market: MarketType) => void;
  fetchOpenOrders: () => Promise<void>;
  fetchBids: () => Promise<void>;
  fetchAsks: () => Promise<void>;
  setProgram: (connection: Connection, wallet: AnchorWallet) => void;
  loadData:() => void
};

export const useFermiStore = create<FermiStoreState & FermiStoreActions>(
  (set, get) => ({
    program: null,
    selectedMarket: null,
    asks: [],
    bids: [],
    eventQ: [],
    openOrders: [],
    tokenBalances: null,
    setProgram: (connection: Connection, connectedWallet: AnchorWallet) => {
      const provider = getProvider(connection, connectedWallet);
      const program = new Program(IDL, FERMI_PROGRAM_ID, provider);
      set({ program });
    },
    setSelectedMarket: (market: MarketType) => set({ selectedMarket: market }),
    fetchAsks: async () => {
      try {
        const { program, selectedMarket } = get();
        if (!program) throw new Error("Program not found");
        if (!selectedMarket) throw new Error("Market not found");

        const [bidsPda] = await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from("bids", "utf-8"),
            new PublicKey(selectedMarket?.marketPda).toBuffer(),
          ],
          program.programId
        );

        const res = await program.account.orders.fetch(
          new anchor.web3.PublicKey(bidsPda)
        );

        const _bids = (res?.sorted as any[])?.map((item) => {
          return {
            ...item,
            orderId: item.orderId.toString(),
            price: priceFromOrderId(item?.orderId, selectedMarket.pcLotSize),
            qty: Number(item?.qty) / selectedMarket.coinLotSize,
          };
        });

        set({ bids: _bids });
      } catch (err) {
        console.log(err);
      }
    },
    fetchBids: async () => {
      try {
        const { program, selectedMarket } = get();
        if (!program) throw new Error("Program not found");
        if (!selectedMarket) throw new Error("Market not found");

        const [asksPda] = await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from("asks", "utf-8"),
            new PublicKey(selectedMarket?.marketPda).toBuffer(),
          ],
          program?.programId
        );

        const res = await program.account.orders.fetch(
          new anchor.web3.PublicKey(asksPda)
        );

        const _asks = (res?.sorted as any[])?.map((item) => {
          return {
            ...item,
            orderId: item.orderId.toString(),
            price: priceFromOrderId(item?.orderId, selectedMarket.pcLotSize),
            qty: Number(item?.qty) / selectedMarket.coinLotSize,
          };
        });

        set({ asks: _asks });
      } catch (err) {
        console.log(err);
      }
    },
    fetchOpenOrders: async () => {
      try {
        const { program, selectedMarket, asks, bids } = get();
        if (!program) throw new Error("Program not found");
        if (!selectedMarket) throw new Error("Market not found");

        const connectedWallet = program.provider.publicKey;
        if (!connectedWallet) throw new Error("Wallet not connected ");

        const [openOrdersPda] = await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from("open-orders", "utf-8"),
            new anchor.web3.PublicKey(selectedMarket.marketPda).toBuffer(),
            connectedWallet?.toBuffer(),
          ],
          program.programId
        );

        const openOrdersResponse = await program.account.openOrders.fetch(
          openOrdersPda
        );

        set({
          tokenBalances: {
            nativeCoinFree: openOrdersResponse.nativeCoinFree.toString(),
            nativeCoinTotal: openOrdersResponse.nativeCoinTotal.toString(),
            nativePcFree: openOrdersResponse.nativePcFree.toString(),
            nativePcTotal: openOrdersResponse.nativePcTotal.toString(),
          },
        });
        let orderIds = openOrdersResponse?.orders
          .map((item) => {
            return item.toString();
          })
          .filter((item) => item !== "0");
        // match order ids from orderbook ( asks and bids ) and add it to myOrders
        if (orderIds.length > 0) {
          const asksMatched =
            asks
              ?.filter((item) => orderIds.includes(item.orderId))
              .map((order) => ({ ...order, side: "Ask" })) ?? [];

          const bidsMatched =
            bids
              ?.filter((item) => orderIds.includes(item.orderId))
              .map((order) => ({ ...order, side: "Bid" })) ?? [];

          const myOrders = [...asksMatched, ...bidsMatched];
          set({ openOrders: myOrders });
        }
      } catch (err) {
        console.log(err);
      }
    },
    fetchEventQ: async () => {
      try {
        const { program, selectedMarket } = get();
        if (!program) throw new Error("Program not found");
        if (!selectedMarket) throw new Error("Market not found");
        const [eventQPda] = await PublicKey.findProgramAddress(
          [
            Buffer.from("event-q", "utf-8"),
            new PublicKey(selectedMarket.marketPda).toBuffer(),
          ],
          program.programId
        );

        const eventQueueRes = await program.account.eventQueue.fetch(eventQPda);
        console.log("eventQueue", eventQueueRes);

        const parsedEventQueue = parseEventQ(eventQueueRes);
        set({ eventQ: parsedEventQueue });
      } catch (err) {
        console.log(err);
      }
    },
    loadData:async()=>{
      const {fetchAsks,fetchBids,fetchEventQ,fetchOpenOrders} = get()
      await fetchAsks()
      await fetchBids()
      await fetchEventQ()
      await fetchOpenOrders()
    }
  })
);
