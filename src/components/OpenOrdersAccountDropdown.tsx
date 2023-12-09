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
  const { tokenBalances, openOrdersAccount } = useFermiStore();
  const openOrdersPda = useMemo(() => {
    const str = openOrdersAccount?.toString();
    if (!str) return;
    return str.slice(0, 4) + "..." + str.slice(-4);
  }, [openOrdersAccount]);
  return (
    <div className="hover:bg-default-50 duration-200 ease-out p-4 border-l border-default-300 cursor-pointer">
      <p className="text-default-400 text-xs">Open orders account</p>
      <p className="font-medium hidden sm:block">
        {openOrdersPda ?? "Not Initialsed"}
      </p>
    </div>
  );
};

export default OpenOrdersAccountDropdown;
