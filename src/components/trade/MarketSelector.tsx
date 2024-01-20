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
  const isMarketLoading = useFermiStore((state) => state.isMarketLoading);
  const client = useFermiStore(state => state.client)
  const selectedMarketPk = useFermiStore(
    (state) => state.selectedMarket.publicKey
  );

  const changeMarket = async (marketPda: string) => {
    console.log("Changing market to",marketPda)
    const params = new URLSearchParams(searchParams);
    params.set("market", marketPda);
    replace(`${pathname}?${params.toString()}`);
    const knownMarket = MARKETS.find((m) => m.marketPda === marketPda);
    if (knownMarket) {
      setSelectedKeys([marketPda]);
      await updateMarket(knownMarket.marketPda);
    } 
  };


  const onSelectionChange = (key: Selection) => {
    // change market when change
  
    const marketPubKey = Array.from(key)[0];
    changeMarket(marketPubKey as string);
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
      isLoading={isMarketLoading}
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

    </Select>
  );
};

export default MarketSelector;
