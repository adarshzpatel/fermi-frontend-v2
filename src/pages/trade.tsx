import Chart from "@/components/Chart";
import Layout from "@/components/Layout";
import OpenOrders from "@/components/OpenOrders";
import Orderbook from "@/components/Orderbook";
import PlaceOrder from "@/components/PlaceOrder";
import { MARKETS } from "@/solana/config";
import { MarketType } from "@/types";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

const TradePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMarketPda = searchParams.get("market");

  const selectedMarket: MarketType = useMemo(() => {
    return (
      MARKETS.find((it) => it.marketPda === selectedMarketPda) ?? MARKETS[0]
    );
  }, [selectedMarketPda]);

  // if no market is provided in query
  if (!selectedMarket) {
    const params = new URLSearchParams();
    params.set("market", MARKETS[0].marketPda);
    router.push(`/trade?${params.toString()}`);
  }

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
              selectedKeys={[selectedMarket.marketPda]}
              onSelectionChange={(key) => {
                const marketPubKey = Array.from(key)[0];
                const _selectedMarket = MARKETS.find(
                  (it) => it.marketPda === marketPubKey
                );
                if (!_selectedMarket) return;
                const params = new URLSearchParams();
                params.set("market", _selectedMarket.marketPda);
                router.push(`/trade?${params.toString()}`);
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
};

export default TradePage;
