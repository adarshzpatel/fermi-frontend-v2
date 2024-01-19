import { MARKETS } from "@/solana/config";
import { useFermiStore } from "@/stores/fermiStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useEffect } from "react";

const useMarket = () => {


  useEffect(() => {
    if (client) {
      if (!marketPdaParam) {
        changeMarket(MARKETS[0].marketPda);
      } else {
        changeMarket(marketPdaParam);
      }
    }
  }, []);

  return { selectedMarket, changeMarket };
};

export default useMarket;
