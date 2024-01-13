import { MARKETS, Market, PROGRAM_ID } from "@/solana/config";
import {
  BookSideAccount,
  EventHeapAccount,
  OpenBookV2Client,
  OpenOrdersAccount,
} from "@/solana/fermiClient";
import { AnchorProvider, IdlTypes, Program } from "@coral-xyz/anchor";
import { Commitment, Connection, PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { create } from "zustand";
import { produce } from "immer";
import { subscribeWithSelector } from "zustand/middleware";
import { TbWashDryP } from "react-icons/tb";

type FermiStore = {
  connected: boolean;
  connection: Connection;
  client: OpenBookV2Client | undefined;
  markets: Market[] | undefined;
  set: (x: (x: FermiStore) => void) => void;
  selectedMarket: {
    name: string | undefined;
    current: Market | undefined;
    bidsAccount: BookSideAccount | null;
    asksAccount: BookSideAccount | null;
    eventHeapAccount: EventHeapAccount | null;
  };
  openOrders: Record<string, string> | undefined;
  openOrdersAccount: OpenOrdersAccount | undefined;
  actions: {
    initClient: (provider: AnchorProvider) => void;
    updateConnection: (url: string) => void;
    updateMarket: (newMarket: Market) => void;
    reloadMarket: () => void;
  };
};

export const useFermiStore = create<FermiStore>()(
  subscribeWithSelector((_set, get) => ({
    connected: false,
    connection: new Connection("https://api.devnet.solana.com"),
    client: undefined,
    markets: MARKETS,
    selectedMarket: {
      name: undefined,
      current: undefined,
      bidsAccount: null,
      asksAccount: null,
      eventHeapAccount: null,
    },
    openOrders: {},
    openOrdersAccount: undefined,
    set: (fn) => _set(produce(fn)),
    actions: {
      initClient: (provider: AnchorProvider) => {
        try {
          const set = get().set;
          const postSendTxCallback = ({ txid }: { txid: string }) => {
            console.log(`Transaction ${txid} sent`);
            toast("Transaction sent");
          };

          const txConfirmationCommitment: Commitment = "processed";

          const opts = {
            postSendTxCallback,
            txConfirmationCommitment,
          };

          const client = new OpenBookV2Client(
            provider,
            new PublicKey(PROGRAM_ID),
            opts
          );

          set((state) => {
            state.connected = true;
            state.client = client;
          });
          console.log("Client Initialized Successfully");
        } catch (err:any) {
          console.error("Error in initClient:", err?.message );
        }
      },

      updateMarket: async (newMarket: Market) => {
        try {
          const set = get().set;
          const client = get().client;
          if (!client) throw new Error("Client not initialized");
          const bidsAccount = await client.deserializeBookSide(
            new PublicKey(newMarket.bidsPda)
          );
          const asksAccount = await client.deserializeBookSide(
            new PublicKey(newMarket.asksPda)
          );
          const eventHeapAccount = await client.deserializeEventHeapAccount(
            new PublicKey(newMarket.eventHeapPda)
          );

          set((state) => {
            state.selectedMarket.name = `${newMarket.baseTokenName}/${newMarket.quoteTokenName}`;
            state.selectedMarket.current = newMarket;
            state.selectedMarket.bidsAccount = bidsAccount;
            state.selectedMarket.asksAccount = asksAccount;
            state.selectedMarket.eventHeapAccount = eventHeapAccount;
          });

          console.log("Market Updated Successfully");
        } catch (err:any) {
          console.log("Error in updateSelectedMarket:", err?.message);
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
            new PublicKey(currentMarket.bidsPda)
          );
          const asksAccount = await client.deserializeBookSide(
            new PublicKey(currentMarket.asksPda)
          );
          const eventHeapAccount = await client.deserializeEventHeapAccount(
            new PublicKey(currentMarket.eventHeapPda)
          );

          set((state) => {
            state.selectedMarket.name = `${currentMarket.baseTokenName}/${currentMarket.quoteTokenName}`;
            state.selectedMarket.current = currentMarket;
            state.selectedMarket.bidsAccount = bidsAccount;
            state.selectedMarket.asksAccount = asksAccount;
            state.selectedMarket.eventHeapAccount = eventHeapAccount;
          });
          console.log("Reloaded Market");
        } catch (err) {
          console.error("Error in reloadMarket:", err);
        }
      },
      fetchOpenOrder: async () => {
        try {
          const client = get().client;
          const selectedMarket = get().client;
          const connectedWalletPk = client?.provider.wallet.publicKey;
        } catch (err) {
          console.error("Error in fetchOpenOrder:", err);
        }
      },
      updateConnection: (url: string) => {
        const set = get().set;
        set((state) => {
          state.connected = true;
          state.connection = new Connection(url);
        });
      },
    },
  }))
);
