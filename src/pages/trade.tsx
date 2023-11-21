import Chart from "@/components/Chart";
import Layout from "@/components/Layout";

import OpenOrders from "@/components/OpenOrders";
import Orderbook from "@/components/Orderbook";
import PlaceOrder from "@/components/PlaceOrder";
import { MARKETS } from "@/solana/config";
import { useFermiStore } from "@/stores/fermiStore";

import { Input, Select, SelectItem } from "@nextui-org/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TradePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedMarketPda = searchParams.get("market");
  const {
    setProgram,
    tokenBalances,
    setSelectedMarket,
    selectedMarket,
    loadData,
  } = useFermiStore();
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
    } else {
      loadProgramAndMarket();
    }
  }, [connection, currentWallet, selectedMarketPda]);

  if (loading) {
    return <Layout>Loading...</Layout>;
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
              selectedKeys={[selectedMarket?.marketPda || MARKETS[0].marketPda]}
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
              value={tokenBalances?.nativeCoinFree ?? "0"}
              variant="faded"
              classNames={{ input: "text-lg", label: "text-default-500" }}
            />
            <Input
              as={"div"}
              label="Native coin total"
              value={tokenBalances?.nativeCoinTotal ?? "0"}
              variant="faded"
              classNames={{ input: "text-lg", label: "text-default-500" }}
            />
            <Input
              as={"div"}
              label="Native pc free"
              value={tokenBalances?.nativePcFree ?? "0"}
              variant="faded"
              classNames={{ input: "text-lg", label: "text-default-500" }}
            />
            <Input
              as={"div"}
              label="Natice pc total"
              value={tokenBalances?.nativePcTotal ?? "0"}
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
