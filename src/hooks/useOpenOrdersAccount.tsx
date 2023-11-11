import { useOpenOrderAccountStore } from "@/stores/useOpenOrderAccount";
import { use, useEffect } from "react";
import useFermiProgram from "./useFermiProgram";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import useMarket from "./useMarket";
import * as anchor from "@project-serum/anchor";

const useOpenOrdersAccount = () => {
  const { openOrders, setOpenOrders, setTokenBalances, tokenBalances } =
    useOpenOrderAccountStore();
  const { program } = useFermiProgram();
  const connectedWallet = useAnchorWallet();
  const { currentMarket } = useMarket();

  const fetchOpenOrders = async () => {
    try {
      if (!connectedWallet?.publicKey || !program || !currentMarket?.marketPda)
        return;
      let openOrdersPda;
      let openOrdersPdaBump;

      [openOrdersPda, openOrdersPdaBump] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from("open-orders", "utf-8"),
            new anchor.web3.PublicKey(currentMarket.marketPda).toBuffer(),
            connectedWallet?.publicKey.toBuffer(),
          ],
          program.programId
        );

      const openOrdersResponse = await program.account.openOrders.fetch(
        openOrdersPda
      );

      setTokenBalances({
        nativeCoinFree: openOrdersResponse.nativeCoinFree.toString(),
        nativeCoinTotal: openOrdersResponse.nativeCoinTotal.toString(),
        nativePcFree: openOrdersResponse.nativePcFree.toString(),
        nativePcTotal: openOrdersResponse.nativePcTotal.toString(),
      });

      let orderIds = openOrdersResponse?.orders
        .map((item) => {
          return item.toString();
        })
        .filter((item) => item !== "0");
      console.log("orderIds", orderIds);
      setOpenOrders(orderIds);
    } catch (err) {
      console.log("Error in fetchOpenOrders", err);
    }
  };

  useEffect(() => {
    fetchOpenOrders();
  }, [program, currentMarket, connectedWallet]);

  return { openOrders, tokenBalances, fetchOpenOrders };
};

export default useOpenOrdersAccount;