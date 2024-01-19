import { useFermiStore } from "@/stores/fermiStore";
import React, { useMemo } from "react";
import Copyable from "./shared/Copyable";

type Props = {};

const OpenOrdersAccount = (props: Props) => {
  
  const { tokenBalances, openOrdersAccount } = useFermiStore();
  const openOrdersPda = useMemo(() => {
    const str = openOrdersAccount?.toString();
  if (!str) return;
    return str.slice(0, 4) + "..." + str.slice(-4);
  }, [openOrdersAccount]);
  
if(!openOrdersAccount) return null;

  return (
    <Copyable textToCopy={openOrdersAccount?.toString() ?? ""}>
      <div className="hover:bg-default-50 duration-200 hidden md:block ease-out p-4 group border-l border-default-300 cursor-pointer">
        <p className="text-default-400 text-xs">Open orders account</p>
        <p className="font-medium items-center flex gap-1 ">
          {openOrdersPda ?? "Not Initialsed"}
          <Copyable.Icon className="h-5 w-5 group-hover:block hidden opacity-0 group-hover:opacity-100 duration-200"/>
        </p>
      </div>
    </Copyable>
  );
};

export default OpenOrdersAccount;
