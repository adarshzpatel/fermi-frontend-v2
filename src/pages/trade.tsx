import Chart from "@/components/Chart";
import Layout from "@/components/layout/Layout";
import PlaceOrder from "@/components/trade/PlaceOrderForm";
import MarketSelector from "@/components/trade/MarketSelector";
import Orderbook from "@/components/trade/Orderbook";
import { useEffect, useState } from "react";
import { useFermiStore } from "@/stores/fermiStore";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { OpenBookV2Client } from "@/solana/fermiClient";
import { AnchorProvider } from "@coral-xyz/anchor";
import toast from "react-hot-toast";
import { MARKETS, PROGRAM_ID } from "@/solana/config";
import { Commitment, PublicKey } from "@solana/web3.js";
import { ClientRequest } from "http";
import { useSearchParams } from "next/navigation";
import { setAutoFreeze } from "immer";
import { Spinner, useDisclosure } from "@nextui-org/react";
import CreateOpenOrdersAccountModal from "@/components/trade/CreateOpenOrdersAccountModal";

const postSendTxCallback = ({ txid }: { txid: string }) => {
  console.group("Post tx sent callback");
  console.log(`Transaction ${txid} sent`);
  console.log(
    `Explorer: https://explorer.solana.com/tx/${txid}?cluster=devnet`
  );
  toast.success(`Transaction ${txid} sent`);
};

const txConfirmationCommitment: Commitment = "processed";
const opts = {
  postSendTxCallback,
  txConfirmationCommitment,
};

const TradePage = () => {
  const searchParams = useSearchParams();
  const {
    isOpen: isCreateOOModalOpen,
    onOpen: openCreateOOModal,
    onClose: closeCreateOOModal,
    onOpenChange: onCreateOOModalOpenChange,
  } = useDisclosure({ id: "create-oo-modal" });
  const marketPdaParam = searchParams.get("market");
  const store = useFermiStore();
  const client = store.client;
  const selectedMarket = store.selectedMarket;
  const set = store.set;
  const connectedWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);


  const initialise = async () => {
    setLoading(true);
    try {
      if (!connection) throw new Error("No connection found ");
      if (!connectedWallet) throw new Error("No wallet found");
      const provider = new AnchorProvider(
        connection,
        connectedWallet,
        AnchorProvider.defaultOptions()
      );

      const client = new OpenBookV2Client(
        provider,
        new PublicKey(PROGRAM_ID),
        opts
      );

      set((state) => {
        state.client = client;
        state.connected = true;
        state.connection = connection;
      });

      console.log("Client initialized");
      console.log("Fetching market")
      let marketPubKey: PublicKey;
      if (marketPdaParam) {
        marketPubKey = new PublicKey(marketPdaParam);
      } else {
        marketPubKey = new PublicKey(MARKETS[0].marketPda);
      }
      const market = await client.deserializeMarketAccount(marketPubKey);
      if(!market) throw new Error("Market not found")

      const bidsAccount = await client.deserializeBookSide(
        market.bids
      );

      const bids = bidsAccount && client.getLeafNodes(bidsAccount);
      const asksAccount = await client.deserializeBookSide(
        market.asks
      );

      const asks = asksAccount && client.getLeafNodes(asksAccount);
      const eventHeapAccount = await client.deserializeEventHeapAccount(
        market.eventHeap
      );
      
      const eventHeap = eventHeapAccount && eventHeapAccount.nodes;

      set((state) => {
        state.selectedMarket.publicKey = new PublicKey(marketPubKey);
        state.selectedMarket.current = market;
        state.selectedMarket.bids = bids;
        state.selectedMarket.asks = asks;
        state.selectedMarket.eventHeap = eventHeap;
      });

      console.log("Market initialised")

      await store.actions.fetchOpenOrders()
    
    } catch (err) {
      console.error("Failed to initialise : ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connectedWallet) initialise();
  }, [connectedWallet]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center screen-center">
          <Spinner label="Loading..." size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col  ">
        <div className="flex  gap-4 p-4">
          <div className="flex-[3] gap-4 flex flex-col">
            <div className="flex gap-4">
              <div className="space-y-4">
                <MarketSelector />
                <PlaceOrder />
              </div>
              <div className=" flex-[2] style-card p-4">
                <Chart />
              </div>
            </div>
            {/* <div className="style-card ">
              <Tabs
                variant="underlined"
                classNames={{ cursor: "bg-default-500", panel: "p-4 pt-0" }}
                className="font-heading font-medium"
              >
                <Tab title="OPEN ORDERS" key="open-orders">
                  <OpenOrders />
                </Tab>
                <Tab title="BALANCES" key="balances">
                  <TokenBalancesTable />
                </Tab>
              </Tabs>
            </div>*/}
          </div>
          <div className="flex-[1] style-card">
            <Orderbook />
          </div>
        </div>
      </div>
      <CreateOpenOrdersAccountModal
        isOpen={isCreateOOModalOpen}
        onOpenChange={openCreateOOModal}
        closeModal={closeCreateOOModal}
      />
    </Layout>
  );
};

export default TradePage;
