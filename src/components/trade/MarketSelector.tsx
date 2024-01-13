import { MARKETS } from "@/solana/config";
import { useFermiStore } from "@/stores/fermiStore";
import { Select, SelectItem } from "@nextui-org/react";
import React from "react";

type Props = {
  selectedKeys: Iterable<React.Key> | "all" | undefined;
  onSelectionChange: (key: Iterable<React.Key>) => void;
};

const MarketSelector = (props: Props) => {
  const selectedMarket = useFermiStore((state) => state.selectedMarket);

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
      selectedKeys={props.selectedKeys}
      onSelectionChange={props.onSelectionChange}
    >
      {MARKETS.map((m) => (
        <SelectItem
          aria-label={`${selectedMarket.name}`}
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
