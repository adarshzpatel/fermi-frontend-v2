import { useOrderbookStore } from "@/stores/useOrderbookStore";
import { useEffect } from "react";
import useFermiProgram from "./useFermiProgram";
import useMarket from "./useMarket";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { priceFromOrderId } from "@/solana/utils";

const useOrderbook = () => {
  const { asks, bids, setAsks, setBids } = useOrderbookStore();
  const { program } = useFermiProgram();
  const { currentMarket } = useMarket();

  const fetchBids = async () => {
    try {
      if (!program) throw new Error("No program found!!");
      if (!currentMarket?.marketPda) throw new Error("No market selected!!");
      // await initializeMarket(program);

      const [bidsPda] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("bids", "utf-8"),
          new PublicKey(currentMarket?.marketPda).toBuffer(),
        ],
        program.programId
      );

      const res = await program.account.orders.fetch(
        new anchor.web3.PublicKey(bidsPda)
      );
      setBids(
        (res?.sorted as any[])?.map((item) => {
          return {
            ...item,
            orderId: item.orderId.toString(),
            price: priceFromOrderId(item?.orderId, currentMarket.pcLotSize),
            qty: Number(item?.qty) / currentMarket.coinLotSize,
          };
        })
      );
    } catch (err) {
      console.log("Error in getBids", err);
    }
  };

  const fetchAsks = async () => {
    try {
      if (!program) throw new Error("No program found!!");
      if (!currentMarket?.marketPda) throw new Error("No market selected!!");

      const [asksPda] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("asks", "utf-8"),
          new PublicKey(currentMarket?.marketPda).toBuffer(),
        ],
        program.programId
      );

      const res = await program.account.orders.fetch(
        new anchor.web3.PublicKey(asksPda)
      );

      setAsks(
        (res?.sorted as any[])?.map((item) => {
          return {
            ...item,
            orderId: item.orderId.toString(),
            price: priceFromOrderId(item?.orderId, currentMarket.pcLotSize),
            qty: (Number(item?.qty) / currentMarket.coinLotSize),
          };
        })
      );
    } catch (err) {
      console.log("Error in getAsks", err);
    }
  };

  useEffect(() => {
    if (program && currentMarket) {
      fetchAsks();
      fetchBids();
    }
  }, [program, currentMarket]);

  return { asks, bids, fetchAsks, fetchBids };
};

export default useOrderbook;
