import Chart from "@/components/Chart";
import Layout from "@/components/layout/Layout";
import MarketSelector from "@/components/trade/MarketSelector";
import OpenOrders from "@/components/OpenOrdersTable";
import Orderbook from "@/components/trade/Orderbook";
import PlaceOrder from "@/components/trade/PlaceOrderForm";
import TokenBalancesTable from "@/components/TokenBalancesTable";
import { MARKETS } from "@/solana/config";
import { useFermiStore } from "@/stores/fermiStore";
import { Spinner, Tab, Tabs } from "@nextui-org/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AnchorProvider } from "@coral-xyz/anchor";

const TradePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const marketPdaParam = searchParams.get("market");
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const connectedWallet = useAnchorWallet();
  const updateMarket = useFermiStore((state) => state.actions.updateMarket);
  const selectedMarket = useFermiStore((state) => state.selectedMarket);
  const initClient = useFermiStore((state) => state.actions.initClient);

  const changeMarket = (marketPda: string) => {
    const params = new URLSearchParams();
    // if invalid market set to default
    const newMarket =
      MARKETS.find((it) => it.marketPda === marketPda) || MARKETS[0];

    updateMarket(newMarket);
    params.set("market", newMarket.marketPda);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    // Set Market from URL
    if (marketPdaParam) {
      changeMarket(marketPdaParam);
    } else {
      // IF no market in URL set to default
      changeMarket(MARKETS[0].marketPda);
    }
  }, []);

  useEffect(() => {
    // Initialise client
    try {
      if (!connectedWallet || !connection) return;
      const provider = new AnchorProvider(
        connection,
        connectedWallet,
        AnchorProvider.defaultOptions()
      );
      initClient(provider);
    } catch (err: any) {
      const errMessage = err?.message ?? "Error initializing client";
      console.error(errMessage);
      toast.error(errMessage);
    }
  }, [connectedWallet,connection,initClient]);

  if (!connectedWallet) {
    // Display Wallet selection modal
  }

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
                <MarketSelector
                  onSelectionChange={(key) => {
                    const marketPubKey = Array.from(key)[0];
                    changeMarket(marketPubKey as string);
                  }}
                  selectedKeys={[
                    selectedMarket.current?.marketPda || MARKETS[0].marketPda,
                  ]}
                />
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
          {/* <div className="flex-[1] style-card">
            <Orderbook />
          </div> */}
        </div>
      </div>
    </Layout>
  );
};

export default TradePage;
