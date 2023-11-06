import Chart from "@/components/Chart";
import Layout from "@/components/Layout";
import OpenOrders from "@/components/OpenOrders";
import Orderbook from "@/components/Orderbook";
import PlaceOrder from "@/components/PlaceOrder";
import useProgram from "@/hooks/useProgram";
import { MARKETS } from "@/solana/config";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { useEffect } from "react";


export default function Home() {
  const { program ,market, setMarket } = useProgram();

  useEffect(()=>{
    const getMarket = async () => {
      const res = await program?.account.market.fetch(market.marketPda)
      console.log("coinLotSize",)
    }
    getMarket()
  },[market])

  return (
    <Layout>
      <div className="flex flex-col gap-4 ">
        <div className="flex gap-4 ">
          <div className="flex-[1]">
            <Select
              label="Select Market"
              placeholder="Select Market"
              variant="faded"
              classNames={{
                value: "text-lg font-medium",
                label: "text-default-500",
                trigger:
                  "bg-default-50 border-1 border-default-200 hover:border-default-400 active:border-default-400",
                popover: "style-card shadow-lg",
              }}
              multiple={false}
              selectedKeys={[market.marketPda]}
              onSelectionChange={(key) => {
                const marketPubKey = Array.from(key)[0];
                const selectedMarket = MARKETS.find(
                  (it) => it.marketPda === marketPubKey
                );
                if (!selectedMarket) return;
                setMarket(selectedMarket);
              }}
            >
              {MARKETS.map((m) => (
                <SelectItem
                  aria-label={`${m.coinName} / ${m.pcName}`}
                  key={m.marketPda}
                  value={m.marketPda}
                  textValue={`${m.coinName} / ${m.pcName}`}
                >
                  {m.coinName} / {m.pcName}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex-[4] flex gap-2">
            <Input
              as={"div"}
              label="Market cap"
              value="0.00"
              variant="faded"
              classNames={{ input: "text-lg", label: "text-default-500" }}
            />
            <Input
              as={"div"}
              label="Market cap"
              value="0.00"
              variant="faded"
              classNames={{ input: "text-lg", label: "text-default-500" }}
            />
            <Input
              as={"div"}
              label="Market cap"
              value="0.00"
              variant="faded"
              classNames={{ input: "text-lg", label: "text-default-500" }}
            />
            <Input
              as={"div"}
              label="Market cap"
              value="0.00"
              variant="faded"
              classNames={{ input: "text-lg", label: "text-default-500" }}
            />
          </div>
        </div>
        <div className="flex  gap-4">
          <div className="flex-[3] gap-4 flex flex-col">
            <div className="flex gap-4">
              <PlaceOrder />
              <div className=" flex-[2] style-card p-4">
                <Chart />
              </div>
            </div>
            <div className="style-card p-4">
              <OpenOrders />
            </div>
          </div>
          <div className="flex-[1] style-card p-4">
            <Orderbook />
          </div>
        </div>
      </div>
    </Layout>
  );
}
