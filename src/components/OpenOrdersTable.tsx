import {
  cancelAskIx,
  cancelBidIx,
  finaliseAskIx,
  finaliseBidIx,
} from "@/solana/instructions";
import { OrderMatchMap, findMatchingEvents } from "@/solana/utils";
import { useFermiStore } from "@/stores/fermiStore";
import { Button, Chip } from "@nextui-org/react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo } from "react";

import toast from "react-hot-toast";

const OpenOrders = () => {
  const connectedWallet = useAnchorWallet();
  const { openOrders, selectedMarket, program, loadData, eventQ } =
    useFermiStore();

  const finalisableEvents = useMemo(() => {
    if (eventQ && openOrders) {
      const matchedOrders = findMatchingEvents(
        openOrders.map((it) => it.orderId),
        eventQ
      );
      return matchedOrders;
    }
    return [] as unknown as OrderMatchMap;
  }, [eventQ, openOrders]);

  const handleCancelOrder = useCallback(
    async (orderId: string, side: string) => {
      try {
        if (!program) throw new Error("Program not found");
        if (!connectedWallet?.publicKey)
          throw new Error("Wallet not connected");
        if (!selectedMarket?.marketPda) throw new Error("Market not selected");
        let tx: string | undefined;
        if (side === "Ask") {
          tx = await cancelAskIx({
            program,
            authority: connectedWallet.publicKey,
            marketPda: new PublicKey(selectedMarket?.marketPda),
            orderId: orderId,
          });
        }
        if (side === "Bid") {
          tx = await cancelBidIx({
            program,
            authority: connectedWallet.publicKey,
            marketPda: new PublicKey(selectedMarket?.marketPda),
            orderId: orderId,
          });
        }
        if (tx) {
          toast.success("Order cancelled successfully . Tx :" + tx);
        }
      } catch (err: any) {
        console.log("Error in cancel order : ", err);
        toast.error(err.message ?? "Something went wrong , check console ");
      } finally {
        loadData();
      }
    },
    []
  );

  const handleFinalise = async (orderId: string) => {
    try {
      if (!connectedWallet) throw new Error("Please connect wallet");
      if (!selectedMarket) throw new Error("Please select market");
      if (!program) throw new Error("No program found");

      const { event1, event2 } = finalisableEvents[orderId];

      const finaliseAsk = await finaliseAskIx({
        eventSlot1: event1.slot,
        eventSlot2: event2.slot,
        authority: connectedWallet.publicKey,
        program,
        marketPda: new PublicKey(selectedMarket?.marketPda),
        coinMint: new PublicKey(selectedMarket?.coinMint),
        pcMint: new PublicKey(selectedMarket?.pcMint),
        counterparty: event2.owner,
      });

      console.log({ finaliseAsk });

      const finaliseBid = await finaliseBidIx({
        eventSlot1: event1.slot,
        eventSlot2: event2.slot,
        authority: connectedWallet.publicKey,
        program,
        marketPda: new PublicKey(selectedMarket?.marketPda),
        coinMint: new PublicKey(selectedMarket?.coinMint),
        pcMint: new PublicKey(selectedMarket?.pcMint),
        counterparty: event2.owner,
      });

      console.log({ finaliseBid });
    } catch (err: any) {
      console.log("Error in finalise ask : ", err);
      toast.error(err.message ?? "Something went wrong , check console ");
    }
  };

  return (
    <div>
      <table className="w-full mt-2 table-auto border-1 border-default-100">
        <thead className=" bg-default-100 text-sm text-default-500 h-10">
          <tr>
            <th className="text-left pl-4 font-medium">Order Id</th>
            <th className="text-center font-medium">Price</th>
            <th className="text-center font-medium">Quantity</th>
            <th className="text-center font-medium">Side</th>
            <th className="text-right pr-4  font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm ">
          {/* Coin */}
          {openOrders?.map((order, i) => (
            <tr
              key={"oo-" + i + order.orderId}
              className=" border-t-1 border-default-100"
            >
              <td className="text-left  p-3">{order.orderId}</td>
              <td className="text-center p-3">{order.price}</td>
              <td className="text-center p-3">{order.qty}</td>
              <td className="text-center p-3">
                <Chip
                  color={order.side === "Ask" ? "danger" : "success"}
                  variant="flat"
                >
                  {order.side}
                </Chip>
              </td>
              <td className="flex items-center p-3 justify-end gap-4">
                {Object.keys(finalisableEvents)?.includes(order.orderId) && (
                  <Button
                    onClick={() => handleFinalise(order.orderId)}
                    size="sm"
                    radius="none"
                    variant="ghost"
                  >
                    Finalise
                  </Button>
                )}
                <Button
                  onClick={() => handleCancelOrder(order.orderId, order.side)}
                  size="sm"
                  radius="none"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {openOrders?.length === 0 && (
        <span className="p-4 justify-center flex w-full border border-t-0 border-default-100">
          No open orders found
        </span>
      )}
    </div>
  );
};

export default OpenOrders;
