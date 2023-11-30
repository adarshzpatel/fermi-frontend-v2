import { useFermiStore } from "@/stores/fermiStore";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/react";
import React, { useMemo } from "react";

type Props = {};

const OpenOrdersAccountDropdown = (props: Props) => {
  const { tokenBalances,  openOrdersAccount } = useFermiStore();
  const openOrdersPda = useMemo(() => {
    const str = openOrdersAccount?.toString();
    if (!str) return; 
    return str.slice(0, 4) + "..." + str.slice(-4);
  }, [openOrdersAccount]);
  return (
    <Dropdown
      showArrow
      radius="none"
      placement="bottom-end"
      classNames={{
        base: "py-1 px-1 border  style-card dark:to-black",
        arrow: "bg-default-200",
      }}
    >
      <DropdownTrigger className="hover:bg-default-50 duration-200 ease-out p-4 border-l border-default-300 cursor-pointer">
        <div>
          <p className="text-default-400 text-xs">Open orders account</p>
          <p className="font-medium hidden sm:block">
            {openOrdersPda}
          </p>
        </div>
    </DropdownTrigger>
      <DropdownMenu aria-label="open order account dropdown" variant="bordered">
        <DropdownSection title={"Actions"}>
          <DropdownItem>Hii</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default OpenOrdersAccountDropdown;
