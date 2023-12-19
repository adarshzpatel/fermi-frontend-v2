import { useFermiStore } from "@/stores/fermiStore";
import { Button, useDisclosure } from "@nextui-org/react";
import React, { useState } from "react";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";

const TokenBalancesTable = () => {
  const {
    isOpen: isDepositModalOpen,
    onOpen: openDepositModal,
    onClose: closeDepositModal,
    onOpenChange:onDepositModalOpenChange
  } = useDisclosure({ id: "deposit-modal" });
  const { isOpen: isWithdrawModalOpen, onOpenChange:onWithdrawModalOpenChange,onOpen: openWithdrawModal ,onClose:closeWithdrawModal} =
    useDisclosure({ id: "withdraw-modal" });
  const { tokenBalances, selectedMarket } = useFermiStore();

  const [selectedToken, setSelectedToken] = useState<"coin" | "pc">("pc");

  const handleDepositModal = (tokenType: "coin" | "pc") => {
    if (!tokenType) return;
    setSelectedToken(tokenType);
    openDepositModal();
  };

  const handleWithdrawModal = (tokenType: "coin" | "pc") => {
    if (!tokenType) return;
    setSelectedToken(tokenType);
    openWithdrawModal();
  };

  return (
    <>
      <table className="w-full mt-2  table-auto border-1 border-default-100">
        <thead className=" bg-default-100 text-sm text-default-500 h-10">
          <tr>
            <th className="text-left pl-4 font-medium">Name</th>
            <th className="text-center font-medium">Total Balance</th>
            <th className="text-center font-medium">Free Balance</th>
            <th className="text-center font-medium">Mint Address</th>
            <th className="text-right pr-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {/* Coin */}
          <tr className="">
            <td className="text-left p-3">{selectedMarket?.coinName}</td>
            <td className="text-center p-3">
              {tokenBalances?.nativeCoinTotal ?? "NA"}
            </td>
            <td className="text-center p-3">{tokenBalances?.nativeCoinFree ?? "NA"}</td>
            <td className="text-center p-3">
              {selectedMarket?.coinMint.slice(0, 8) +
                "..." +
                selectedMarket?.coinMint.slice(-8)}
            </td>
            <td className="flex items-center p-3 justify-end gap-4">
              <Button
                onPress={() => handleDepositModal("coin")}
                size="sm"
                radius="none"
                variant="ghost"
              >
                Deposit
              </Button>
              <Button
                onPress={() => handleWithdrawModal("coin")}
                size="sm"
                radius="none"
                variant="ghost"
              >
                Withdraw
              </Button>
            </td>
          </tr>
          {/* Pc */}
          <tr className=" border-t-1 border-default-100">
            <td className="text-left p-3">{selectedMarket?.pcName}</td>
            <td className="text-center p-3">{tokenBalances?.nativePcTotal ?? "NA"}</td>
            <td className="text-center p-3">{tokenBalances?.nativePcFree ?? "NA"}</td>
            <td className="text-center p-3">
              {selectedMarket?.pcMint.slice(0, 8) +
                "..." +
                selectedMarket?.pcMint.slice(-8)}
            </td>
            <td className="flex items-center p-3 justify-end gap-4">
              <Button
                onPress={() => handleDepositModal("pc")}
                size="sm"
                radius="none"
                variant="ghost"
              >
                Deposit
              </Button>
              <Button
                onPress={() => handleWithdrawModal("pc")}
                size="sm"
                radius="none"
                variant="ghost"
              >
                Withdraw
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
      <DepositModal
        closeModal={closeDepositModal}
        isOpen={isDepositModalOpen}
        tokenType={selectedToken}
        onOpenChange={onDepositModalOpenChange}
      />
      <WithdrawModal
        closeModal={closeWithdrawModal}
        isOpen={isWithdrawModalOpen}
        tokenType={selectedToken}
        onOpenChange={onWithdrawModalOpenChange}
      />
    </>
  );
};

export default TokenBalancesTable;
