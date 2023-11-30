import Chart from "@/components/Chart";
import Layout from "@/components/Layout";
import MarketSelector from "@/components/MarketSelector";

import OpenOrders from "@/components/OpenOrdersTable";
import Orderbook from "@/components/Orderbook";
import PlaceOrder from "@/components/PlaceOrder";
import TokenBalancesTable from "@/components/TokenBalancesTable";
import { MARKETS } from "@/solana/config";
import { useFermiStore } from "@/stores/fermiStore";

import {
  Input,
  Select,
  SelectItem,
  Spinner,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TradePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedMarketPda = searchParams.get("market");
  const { setProgram, setSelectedMarket, selectedMarket, loadData } =
    useFermiStore();
  const { connection } = useConnection();
  const currentWallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);

  const loadProgramAndMarket = async () => {
    try {
      setLoading(true);
      if (!connection) throw new Error("Connection not found");
      if (!currentWallet) throw new Error("Wallet not connected");
      if (!selectedMarketPda) throw new Error("Market not selected");
      setProgram(connection, currentWallet);
      await loadData();
    } catch (err: any) {
      console.log(err);
      toast.error(err.message ?? "Something went wrong , check console ");
    } finally {
      setLoading(false);
    }
  };

  const changeMarket = (marketPda: string) => {
    const params = new URLSearchParams();
    // if invalid market set to default
    const newMarket =
      MARKETS.find((it) => it.marketPda === marketPda) || MARKETS[0];

    setSelectedMarket(newMarket);
    params.set("market", newMarket.marketPda);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (!selectedMarketPda) {
      changeMarket(MARKETS[0].marketPda);
    } else if (!selectedMarket) {
      changeMarket(selectedMarketPda);
    } else {
      loadProgramAndMarket();
    }
  }, [connection, currentWallet, selectedMarketPda, selectedMarket]);

  if (loading) {
    return (
      <Layout>
        <Spinner label="Loading..." size="lg" />
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
                    selectedMarket?.marketPda || MARKETS[0].marketPda,
                  ]}
                />
                <PlaceOrder />
              </div>
              <div className=" flex-[2] style-card p-4">
                <Chart />
              </div>
            </div>
            <div className="style-card ">
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
            </div>
          </div>
          <div className="flex-[1] style-card">
            <Orderbook />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TradePage;
