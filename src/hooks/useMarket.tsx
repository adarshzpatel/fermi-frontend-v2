import { MARKETS } from "@/solana/config";
import { useMarketStore } from "@/stores/useMarketStore";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

const useMarket = () => {
  const { market, setMarket } = useMarketStore();
  const allMarkets = MARKETS;
  const router = useRouter();

  const changeMarket = (marketPda: string) => {
    const params = new URLSearchParams();
    // if invalid market set to default
    const newMarket =
      allMarkets.find((it) => it.marketPda === marketPda) || allMarkets[0];

    setMarket(newMarket);
    params.set("market", MARKETS[0].marketPda);
    router.push(`${router.pathname}?${params.toString()}`);
  };
  return { currentMarket: market, changeMarket };
};

export default useMarket;
