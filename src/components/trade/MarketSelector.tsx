import { MARKETS } from "@/solana/config";
import { useFermiStore } from "@/stores/fermiStore";
import { Select, SelectItem, Selection } from "@nextui-org/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const MarketSelector = () => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const marketPdaParam = searchParams.get("market");
  const pathname = usePathname();
  const updateMarket = useFermiStore((state) => state.actions.updateMarket);
  const [selectedKeys, setSelectedKeys] = useState([MARKETS[0].marketPda]);
  const client = useFermiStore(state => state.client)
  const selectedMarketPk = useFermiStore(state => state.selectedMarket.publicKey)
  const changeMarket = async (marketPda: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("market", marketPda);
    replace(`${pathname}?${params.toString()}`);
    const knownMarket = MARKETS.find((m) => m.marketPda === marketPda);
    if (knownMarket) {
      setSelectedKeys([marketPda]);
      await updateMarket(knownMarket.marketPda);
    } else {
      setSelectedKeys(["Unknown"]);
      await updateMarket(marketPda)
    }
  };

  useEffect(() => {
    // If market not defined sin url, set it to first market
    if (!marketPdaParam) {
      changeMarket(MARKETS[0].marketPda);
    } else {
      if(marketPdaParam === selectedMarketPk?.toString()) return 
      changeMarket(marketPdaParam)
    }
  }, [marketPdaParam]);
  
  const onSelectionChange = (key:Selection) => {
    // change market when change
    const marketPubKey = Array.from(key)[0];
    changeMarket(marketPubKey as string)
  };

  return (
    <Select
      label="Select Market"
      placeholder="Select Market"
      variant="faded"
      radius="none"
      classNames={{
        value: "text-lg font-medium",
        label: "text-default-500",
        trigger: "hover:bg-default-50 bg-default-50/50 P",
        popover: " rounded-none style-card shadow-lg",
      }}
      multiple={false}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
    >
      {MARKETS.map((m) => (
        <SelectItem
          aria-label={`${m.name}`}
          key={m.marketPda}
          value={m.marketPda}
          textValue={`${m.name}`}
        >
          {m.name}
        </SelectItem>
      ))}
      <SelectItem
      aria-label="Unknown Market"
      key={"Unknown"}
      value={"Unknown"}
      textValue="Unknown"
      hidden
      > 
      Unknown
      </SelectItem>
    </Select>
  );
};

export default MarketSelector;
