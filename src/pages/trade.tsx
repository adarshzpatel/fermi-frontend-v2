import Chart from "@/components/Chart";
import Layout from "@/components/Layout";
import OpenOrders from "@/components/OpenOrders";
import Orderbook from "@/components/Orderbook";
import PlaceOrder from "@/components/PlaceOrder";
import useMarket from "@/hooks/useMarket";
import useOpenOrdersAccount from "@/hooks/useOpenOrdersAccount";
import { MARKETS } from "@/solana/config";
import { useOpenOrderAccountStore } from "@/stores/useOpenOrderAccount";
import { Input, Select, SelectItem } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const TradePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMarketPda = searchParams.get("market");

  const { currentMarket, changeMarket } = useMarket();
  const tokenBalances = useOpenOrderAccountStore(
    (state) => state.tokenBalances
  );

  useEffect(() => {
    if (!selectedMarketPda) {
      changeMarket(MARKETS[0].marketPda);
    }
  }, []);

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
              selectedKeys={[currentMarket?.marketPda || MARKETS[0].marketPda]}
              onSelectionChange={(key) => {
                const marketPubKey = Array.from(key)[0];

                changeMarket(marketPubKey as string);
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
              label="Native coin Free"
              value={tokenBalances?.nativeCoinFree}
              variant="faded"
              classNames={{ input: "text-lg", label: "text-default-500" }}
            />
            <Input
              as={"div"}
              label="Native coin total"
              value={tokenBalances?.nativeCoinTotal}
              variant="faded"
              classNames={{ input: "text-lg", label: "text-default-500" }}
            />
            <Input
              as={"div"}
              label="Native pc free"
              value={tokenBalances?.nativePcFree}
              variant="faded"
              classNames={{ input: "text-lg", label: "text-default-500" }}
            />
            <Input
              as={"div"}
              label="Natice pc total"
              value={tokenBalances?.nativePcTotal}
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
