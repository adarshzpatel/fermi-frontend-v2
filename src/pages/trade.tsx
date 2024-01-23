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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Spinner, Tab, Tabs, useDisclosure } from "@nextui-org/react";
import CreateOpenOrdersAccountModal from "@/components/trade/CreateOpenOrdersAccountModal";
import OpenOrders from "@/components/OpenOrdersTable";

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
  const marketPdaParam = searchParams.get("market")
 
  const set = useFermiStore(state => state.set)
  const router = useRouter()
  const pathname = usePathname()
  const connectedWallet = useAnchorWallet();
  const { connection } = useConnection();
  const isClientLoading = useFermiStore(state => state.isClientLoading)
  const updateMarket = useFermiStore(state => state.actions.updateMarket)
  const fetchOpenOrders = useFermiStore(state => state.actions.fetchOpenOrders)


  const initialise = async () => {
    if(marketPdaParam === null){
      router.replace(`${pathname}?market=${MARKETS[0].marketPda}`)
      return
    }
    set(state => {
      state.isClientLoading = true

    })
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
        state.isClientLoading = false
      });

      console.log("Client initialized");    

      await updateMarket(marketPdaParam)
      await fetchOpenOrders()

    } catch (err) {
      console.error("Failed to initialise : ", err);
    } finally {
     console.groupEnd()
    }
  };

  useEffect(() => {
    if(connectedWallet && connection){
      initialise();
    }
  }, [connectedWallet,connection]);

  if (isClientLoading) {
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
              <div className="space-y-4 flex-1">
                <MarketSelector />
                <PlaceOrder />
              </div>
              <div className=" flex-[3] style-card p-4">
                <Chart />
              </div>
            </div>
            <div className="style-card flex-1">
              <Tabs
                variant="underlined"
                classNames={{ cursor: "bg-default-500", panel: "p-4 pt-0" }}
                className="font-heading font-medium"
              >
                <Tab title="OPEN ORDERS" key="open-orders">
                  <OpenOrders />
                </Tab>
                <Tab title="BALANCES" key="balances">
                  {/* <TokenBalancesTable /> */}
                  Token Balances Table
                </Tab>
              </Tabs>
            </div>
          </div>
          <div className="flex-1 style-card ">
          <Orderbook />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TradePage;
