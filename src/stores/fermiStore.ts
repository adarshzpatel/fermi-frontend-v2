import { MARKETS, Market, PROGRAM_ID } from "@/solana/config";
import {
  BookSideAccount,
  EventHeapAccount,
  FillEvent,
  LeafNode,
  MarketAccount,
  OpenBookV2Client,
  OpenOrdersAccount,
  OutEvent,
} from "@/solana/fermiClient";
import { AnchorProvider, BN, Wallet } from "@coral-xyz/anchor";
import { Commitment, Connection, Keypair, PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { create } from "zustand";
import { produce } from "immer";
import { subscribeWithSelector } from "zustand/middleware";

import EmptyWallet from "@/solana/utils/emptyWallet";
import { AnchorWallet } from "@solana/wallet-adapter-react";

type FermiStore = {
  connected: boolean;
  connection: Connection;
  client: OpenBookV2Client | undefined;
  set: (x: (x: FermiStore) => void) => void;
  openOrders: {
    publicKey: PublicKey | undefined;
    current: OpenOrdersAccount | undefined;
    orders: { clientId: string; id: string; lockedPrice: string }[] | undefined;
  };
  selectedMarket: {
    publicKey: PublicKey | undefined;
    current: MarketAccount | undefined;
    bids: LeafNode[] | null;
    asks: LeafNode[] | null;
    eventHeap: { fillEvents: FillEvent[]; outEvents: OutEvent[] } | unknown;
    openOrdersAccount: OpenOrdersAccount | null;
  };
  actions: {
    updateConnection: (url: string) => void;
    updateMarket: (newMarketPda: string) => Promise<void>;
    reloadMarket: () => void;
    connectClientWithWallet: (
      wallet: AnchorWallet,
      connection?: Connection
    ) => void;
    fetchOpenOrders: () => Promise<void>;
  };
};

const initFermiClient = (provider: AnchorProvider) => {
  const postSendTxCallback = ({ txid }: { txid: string }) => {
    console.group("Post tx sent callback");
    console.log(`Transaction ${txid} sent`);
    console.log(
      `Explorer: https://explorer.solana.com/tx/${txid}?cluster=devnet`
    );
    toast.success(`Transaction ${txid} sent`);
  };
  const txConfirmationCommitment: Commitment = "confirmed";
  const opts = {
    postSendTxCallback,
    txConfirmationCommitment,
  };
  const client = new OpenBookV2Client(
    provider,
    new PublicKey(PROGRAM_ID),
    opts
  );
  return client;
};

const ENDPOINT = "https://api.devnet.solana.com";
const emptyWallet = new EmptyWallet(Keypair.generate());

export const useFermiStore = create<FermiStore>()(
  subscribeWithSelector((_set, get) => {
    return {
      connected: false,
      connection: new Connection(ENDPOINT),
      client: undefined,
      markets: MARKETS,
      selectedMarket: {
        publicKey: undefined,
        current: undefined,
        bids: null,
        asks: null,
        eventHeap: null,
        openOrdersAccount: null,
      },
      openOrders: {
        publicKey: undefined,
        current: undefined,
        orders: undefined,
      },
      openOrdersAccount: undefined,
      set: (fn) => _set(produce(fn)),
      actions: {
        updateMarket: async (newMarketPda: string) => {
          try {
            console.group("Updating Market");
            const set = get().set;
            const client = get().client;
            if (!client) throw new Error("Client not initialized");

            const newMarket = await client.deserializeMarketAccount(
              new PublicKey(newMarketPda)
            );
            if (!newMarket) throw new Error("Market not found");

            const bidsAccount = await client.deserializeBookSide(
              new PublicKey(newMarket.bids)
            );

            const bids = bidsAccount && client.getLeafNodes(bidsAccount);
            const asksAccount = await client.deserializeBookSide(
              new PublicKey(newMarket.asks)
            );

            const asks = asksAccount && client.getLeafNodes(asksAccount);
            const eventHeap = await client.deserializeEventHeapAccount(
              new PublicKey(newMarket.eventHeap)
            );

            let fillEvents: any = [];
            let outEvents: any = [];

            if (eventHeap !== null) {
              for (const node of eventHeap.nodes as any) {
                if (node.event.eventType === 0) {
                  const fillEvent: FillEvent =
                    client.program.coder.types.decode(
                      "FillEvent",
                      Buffer.from([0, ...node.event.padding])
                    );
                  // console.log('FillEvent Details:',fillEvent);
                  if (fillEvent.timestamp.toString() !== "0")
                    fillEvents.push({
                      ...fillEvent,
                      maker: fillEvent.maker.toString(),
                      makerClientOrderId:
                        fillEvent.makerClientOrderId.toString(),
                      makerTimestamp: fillEvent.makerTimestamp.toString(),
                      price: fillEvent.price.toString(),
                      quantity: fillEvent.quantity.toString(),
                      seqNum: fillEvent.seqNum.toString(),
                      taker: fillEvent.taker.toString(),
                      takerClientOrderId:
                        fillEvent.takerClientOrderId.toString(),
                      takerSide: fillEvent.takerSide.toString(),
                      timestamp: fillEvent.timestamp.toString(),
                      pegLimit: fillEvent.pegLimit.toString(),
                    });
                  fillEvents.push(fillEvent);
                } else {
                  const outEvent: OutEvent = client.program.coder.types.decode(
                    "OutEvent",
                    Buffer.from([0, ...node.event.padding])
                  );
                  // console.log("out event",outEvent)
                  if (outEvent.timestamp.toString() !== "0")
                    outEvents.push(outEvent);
                }
              }
            }

            set((state) => {
              state.selectedMarket.publicKey = new PublicKey(newMarketPda);
              state.selectedMarket.current = newMarket;
              state.selectedMarket.bids = bids;
              state.selectedMarket.asks = asks;
              state.selectedMarket.eventHeap = { fillEvents, outEvents };
            });
            console.log("Market Updated Successfully");
          } catch (err: any) {
            console.log("Error in updateSelectedMarket:", err?.message);
          } finally {
            console.groupEnd();
          }
        },
        connectClientWithWallet: (
          wallet: AnchorWallet,
          connection?: Connection
        ) => {
          const set = get().set;
          const conn = connection || get().connection;
          try {
            const provider = new AnchorProvider(
              conn,
              wallet,
              AnchorProvider.defaultOptions()
            );

            const client = initFermiClient(provider);

            set((s) => {
              s.connected = true;
              s.connection = conn;
              s.client = client;
            });
          } catch (e) {
            console.error("Error in connectClientWithWallet ", e);
          }
        },
        reloadMarket: async () => {
          try {
            const set = get().set;
            const client = get().client;
            const currentMarket = get().selectedMarket.current;
            if (!client) throw new Error("Client not initialized");
            if (!currentMarket) throw new Error("No market selected");

            const bidsAccount = await client.deserializeBookSide(
              new PublicKey(currentMarket.bids)
            );

            const bids = bidsAccount && client.getLeafNodes(bidsAccount);
            const asksAccount = await client.deserializeBookSide(
              new PublicKey(currentMarket.asks)
            );
            bids?.forEach((it) => {
              return {
                ...it,
                clientOrderId: it.clientOrderId.toString(),
                price: new BN(it?.key).shrn(64).toString(),
                key: it?.key.toString(),
                owner: it.owner.toString(),
                timeStamp: it.timestamp.tosString(),

                pegLimit: it.pegLimit.toString(),
                quantity: it.owner.toString(),
                ownerSlot: it.ownerSlot.toString(),
              };
            });
            const asks = asksAccount && client.getLeafNodes(asksAccount);
            asks?.forEach((it) => {
              return {
                ...it,
                clientOrderId: it.clientOrderId.toString(),
                price: new BN(it?.key).shrn(64).toString(),
                key: it?.key.toString(),
                owner: it.owner.toString(),
                timeStamp: it.timestamp.tosString(),
                pegLimit: it.pegLimit.toString(),
                quantity: it.owner.toString(),
                ownerSlot: it.ownerSlot.toString(),
              };
            });
            const eventHeapAccount = await client.deserializeEventHeapAccount(
              new PublicKey(currentMarket.eventHeap)
            );
            const eventHeap = eventHeapAccount && eventHeapAccount.nodes;

            set((state) => {
              state.selectedMarket.current = currentMarket;
              state.selectedMarket.bids = bids;
              state.selectedMarket.asks = asks;
              state.selectedMarket.eventHeap = eventHeap;
            });
            console.log("Reloaded Market");
          } catch (err) {
            console.error("Error in reloadMarket:", err);
          }
        },

        updateConnection: (url: string) => {
          const set = get().set;
          set((state) => {
            state.connected = true;
            state.connection = new Connection(url);
          });
        },

        fetchOpenOrders: async () => {
          try {
            const client = get().client;
            const selectedMarketPk = get().selectedMarket.publicKey;
            const set = get().set;
            if (!client || !selectedMarketPk)
              throw new Error("Client or Market not initialized");
            const openOrdersAccounts = await client.findOpenOrdersForMarket(
              client.walletPk,
              selectedMarketPk
            );

            const openOrdersAccountPk = openOrdersAccounts[0];
            if (!openOrdersAccountPk)
              throw new Error("Open Orders account Public Key not found");
            let openOrdersAccount = await client.deserializeOpenOrderAccount(
              openOrdersAccountPk
            );
            if (!openOrdersAccount)
              throw new Error("Open Orders account not found!");
            let orders: any = openOrdersAccount.openOrders;
            // parse orders

            if (orders) {
              orders = orders.filter((i) => i.isFree === 0);
              orders = orders.map((i) => ({
                clientId: i.clientId.toString(),
                lockedPrice: i.lockedPrice.toString(),
                id: i.id.toString(),
              }));
            }

            set((state) => {
              state.openOrders.publicKey = openOrdersAccountPk;
              state.openOrders.current = openOrdersAccount;
              state.openOrders.orders = orders;
            });
          } catch (err) {
            console.error("Error in fetchOpenOrders:", err);
          }
        },
      },
    };
  })
);
