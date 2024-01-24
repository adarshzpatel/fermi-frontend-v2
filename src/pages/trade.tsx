import Chart from "@/components/Chart";
import Layout from "@/components/layout/Layout";
import PlaceOrder from "@/components/trade/PlaceOrderForm";
import MarketSelector from "@/components/trade/MarketSelector";
import Orderbook from "@/components/trade/Orderbook";
import {  Tab, Tabs } from "@nextui-org/react";
import OpenOrders from "@/components/OpenOrdersTable";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFermiStore } from "@/stores/fermiStore";
import { useRouter } from "next/router";
import { MARKETS } from "@/solana/config";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import DebugInfo from "@/components/DebugInfo";


const TradePage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const market = searchParams.get("market")
  const updateMarket = useFermiStore(state => state.actions.updateMarket)
  const connectedWallet = useAnchorWallet()
  
  useEffect(()=>{
    if(market){
      console.log('Got market:',market)
      updateMarket(market)
    } else {
      router.push("/trade?market="+MARKETS[0].marketPda)
    }
  },[connectedWallet])

  if(!connectedWallet){
    return (
      <Layout>
        <div className="screen-center">
          <p className="text-2xl font-medium font-heading animate-pulse">Please connect your wallet to start trading</p>
        </div>
      </Layout>
    )
  }

   return (
    <Layout>
      <DebugInfo/>
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
