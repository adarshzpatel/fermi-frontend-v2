import { useFermiStore } from "@/stores/fermiStore";
import { Button } from "@nextui-org/react";
import React from "react";

type Props = {};

const TokenBalancesTable = (props: Props) => {
  const { tokenBalances, selectedMarket } = useFermiStore();
  return (
  <table className="w-full mt-2  table-fixed border-1 border-default-100">
    <thead className=" bg-default-100 text-sm text-default-500 h-10">
      <th className="text-left pl-4 font-medium">Name</th>
      <th className="text-center font-medium">Total Balance</th>
      <th className="text-center font-medium">Free Balance</th>
      <th className="text-center font-medium">Mint Address</th>
      <th className="text-center font-medium">Actions</th>
    </thead>
    <tbody className="text-sm">
      {/* Coin */}
      <tr className="">
        <td className="text-center p-3">{selectedMarket?.coinName}</td>
        <td className="text-center p-3">{tokenBalances?.nativeCoinTotal}</td>
        <td className="text-center p-3">{tokenBalances?.nativePcFree}</td>
        <td className="text-center p-3">
          {selectedMarket?.coinMint.slice(0, 8) +
            "..." +
            selectedMarket?.coinMint.slice(-8)}
        </td>
        <td className="flex items-center p-4 justify-end gap-4">
          <Button color="success" radius="none" variant="flat">
            Deposit
          </Button>
          <Button color="warning" radius="none" variant="flat">
            Withdraw
          </Button>
        </td>
      </tr>
      {/* Pc */}
      <tr className=" border-t-1 border-default-100">
        <td className="text-center p-3">{selectedMarket?.pcName}</td>
        <td className="text-center p-3">{tokenBalances?.nativePcTotal}</td>
        <td className="text-center p-3">{tokenBalances?.nativePcFree}</td>
        <td className="text-center p-3">
          {selectedMarket?.pcMint.slice(0, 8) +
            "..." +
            selectedMarket?.pcMint.slice(-8)}
        </td>
        <td className="flex items-center p-3 justify-end gap-4">
          <Button color="success" radius="none" variant="flat">
            Deposit
          </Button>
          <Button color="warning" radius="none" variant="flat">
            Withdraw
          </Button>
        </td>
      </tr>
    </tbody>
  </table>
  );
};

export default TokenBalancesTable;
