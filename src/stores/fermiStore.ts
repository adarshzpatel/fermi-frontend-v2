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
import { checkOrCreateAssociatedTokenAccount } from "@/solana/utils/helpers";

type FermiStore = {
  isClientLoading: boolean;
  isMarketLoading: boolean;
  isOOLoading: boolean;
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
    bids: LeafNode[] | null | undefined;
    asks: LeafNode[] | null | undefined;
    eventHeap: any | undefined;
    openOrdersAccount: OpenOrdersAccount | null;
  };
  actions: {
    updateConnection: (url: string) => void;
    updateMarket: (newMarket: string) => Promise<void>;
    reloadMarket: () => Promise<void>;
    connectClientWithWallet: (
      wallet: AnchorWallet,
      connection?: Connection
    ) => void;
    fetchOpenOrders: () => Promise<void>;
    cancelOrderById: (id: string) => Promise<void>;
    finalise: (maker:PublicKey,taker:PublicKey,slotsToConsume:BN) => Promise<void>;
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
      isClientLoading: true,
      isMarketLoading: true,
      isOOLoading: true,
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
          const client = get().client;
          const set = get().set;
          try {
            set((state) => {
              state.isMarketLoading = true;
            });
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
  

            const eventHeapAccount = await client.deserializeEventHeapAccount(
              new PublicKey(newMarket.eventHeap)
            );
            const eventHeap = eventHeapAccount && parseEventHeap(client,eventHeapAccount);

            set((state) => {
              state.selectedMarket.publicKey = new PublicKey(newMarketPda);
              state.selectedMarket.current = newMarket;
              state.selectedMarket.bids = bids;
              state.selectedMarket.asks = asks;
              state.selectedMarket.eventHeap = eventHeap;
              state.isMarketLoading = false;
            });
            console.log("Market Updated Successfully");
          } catch (err: any) {
            console.log("Error in updateSelectedMarket:", err?.message);
            set((state) => {
              state.selectedMarket.publicKey = undefined;
              state.selectedMarket.current = undefined;
              state.selectedMarket.bids = undefined;
              state.selectedMarket.asks = undefined;
              state.selectedMarket.eventHeap = undefined;
              state.isMarketLoading = false;
            });
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
          set((state) => {
            state.isClientLoading = true;
          });

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
          } finally {
            set((state) => {
              state.isClientLoading = false;
            });
          }
        },
        reloadMarket: async () => {
          const set = get().set;
          const client = get().client;
          const currentMarket = get().selectedMarket.current;
          try {
            if (!client) throw new Error("Client not initialized");
            if (!currentMarket) throw new Error("No market selected");

            const bidsAccount = await client.deserializeBookSide(
              new PublicKey(currentMarket.bids)
            );

            const bids = bidsAccount && client.getLeafNodes(bidsAccount);
            const asksAccount = await client.deserializeBookSide(
              new PublicKey(currentMarket.asks)
            );

            const asks = asksAccount && client.getLeafNodes(asksAccount);

            const eventHeapAccount = await client.deserializeEventHeapAccount(
              new PublicKey(currentMarket.eventHeap)
            );
            const eventHeap = eventHeapAccount && parseEventHeap(client,eventHeapAccount);

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
        finalise: async (maker,taker,slotsToConsume:BN) => {
          const client = get().client
          const market = get().selectedMarket.current
          if(!client) throw new Error("Client not found")
          if(!market) throw new Error("No market found!")
          const marketPublicKey = get().selectedMarket.publicKey
          if(!marketPublicKey) throw new Error("No market found!")

          const ooMaker = await client.deserializeOpenOrderAccount(maker)
          const ooTaker = await client.deserializeOpenOrderAccount(taker)
          console.log(ooMaker?.owner.toString())
          console.log(ooTaker?.owner.toString())
          if(!ooMaker || !ooTaker) throw new Error("Open orders not found")
          const makerAtaPublicKey = new PublicKey(await checkOrCreateAssociatedTokenAccount(client.provider, market.quoteMint, ooMaker?.owner));
          const takerAtaPublicKey = new PublicKey(await checkOrCreateAssociatedTokenAccount(client.provider, market.quoteMint, ooTaker?.owner));

          const [ix, signers] = await client.createFinalizeEventsInstruction(
            marketPublicKey,
            market.marketAuthority,
            market.eventHeap,
            makerAtaPublicKey,
            takerAtaPublicKey,
            market.marketBaseVault,
            market.marketQuoteVault,
            maker,
            slotsToConsume
          );

          await client.sendAndConfirmTransaction([ix],{additionalSigners:signers});


        },
        cancelOrderById: async (id: string) => {
          console.group("Cancelling All orders");
          const client = get().client;
          const market = get().selectedMarket;
          const openOrders = get().openOrders;
          const orderId = new BN(id);
          if (!client) throw new Error("Open orders account not found");
          if (!openOrders.current || !openOrders.publicKey)
            throw new Error("Open orders account not found");
          if (!market.current) throw new Error("market not found");
          const [ix, signers] = await client?.cancelOrderById(
            openOrders.publicKey,
            openOrders.current,
            market.current,
            orderId
          );
          await client.sendAndConfirmTransaction([ix]);
          await get().actions.fetchOpenOrders();
          await get().actions.reloadMarket();
        },
        fetchOpenOrders: async (reloadMarket: boolean = false) => {
          console.log("fetching open orders");
          const client = get().client;
          const selectedMarketPk = get().selectedMarket.publicKey;
          const set = get().set;
          set((state) => {
            state.isOOLoading = true;
          });
          try {
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
            console.log("openOrdersAccount", orders);
            console.log("Fetched open orders Successfully");
            set((state) => {
              state.openOrders.publicKey = openOrdersAccountPk;
              state.openOrders.current = openOrdersAccount;
              state.openOrders.orders = orders;
            });
            if (reloadMarket) get().actions.reloadMarket();
          } catch (err) {
            console.error("Error in fetchOpenOrders:", err);
            set((state) => {
              state.openOrders.publicKey = undefined;
              state.openOrders.current = undefined;
              state.openOrders.orders = undefined;
            });
          } finally {
            set((state) => {
              state.isOOLoading = false;
            });
          }
        },
      },
    };
  })
);

export const openOrdersSelector = (state: FermiStore) => state.openOrders;
export const selectedMarketSelector = (state: FermiStore) =>
  state.selectedMarket;

export const parseEventHeap = (
  client: OpenBookV2Client,
  eventHeap: EventHeapAccount | null
) => {
  if (eventHeap == null) throw new Error("Event Heap not found");
  let fillEvents: any = [];
  // let outEvents: any = [];

  if (eventHeap !== null) {
    for (const node of eventHeap.nodes as any) {
      if (node.event.eventType === 0) {
        const fillEvent: FillEvent = client.program.coder.types.decode(
          "FillEvent",
          Buffer.from([0, ...node.event.padding])
        );

        if (fillEvent.timestamp.toString() !== "0") {
          fillEvents.push({
            ...fillEvent,
            // maker: fillEvent.maker.toString(),
            // taker: fillEvent.taker.toString(),
            // price: fillEvent.price.toString(),
            // quantity: fillEvent.quantity.toString(),
            // makerClientOrderId: fillEvent.makerClientOrderId.toString(),
            // takerClientOrderId: fillEvent.takerClientOrderId.toString(),
          });
        }
      }
      // else {
      // NOT RELEVANT FOR NOW
      // const outEvent: OutEvent = client.program.coder.types.decode(
      //   "OutEvent",
      //   Buffer.from([0, ...node.event.padding])
      // );
      // if (outEvent.timestamp.toString() !== "0") outEvents.push(outEvent);
      // }
    }
  }

  return  fillEvents ;
};
