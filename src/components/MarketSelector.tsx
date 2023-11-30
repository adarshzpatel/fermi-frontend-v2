import { MARKETS } from '@/solana/config';
import { useFermiStore } from '@/stores/fermiStore';
import { Select, SelectItem } from '@nextui-org/react';
import React, { useState } from 'react'

type Props = {
  selectedKeys:Iterable<React.Key> | 'all' | undefined
  onSelectionChange:(key:Iterable<React.Key>) => void
}

const MarketSelector = (props: Props) => {
  const {selectedMarket} = useFermiStore()
  return (
    <Select
    label="Select Market"
    placeholder="Select Market"
    variant="faded"
    radius="none"
    classNames={{
      value: "text-lg font-medium",
      label: "text-default-500",
      trigger:
        "hover:bg-default-50 bg-default-50/50 P",
      popover:" rounded-none style-card shadow-lg",
    }}
    multiple={false}
    selectedKeys={props.selectedKeys}
    onSelectionChange={props.onSelectionChange}
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
  )
}

export default MarketSelector