import { useState } from "react";
import * as anchor from "@project-serum/anchor";

// ORDERBOOK
type OrderRowProps = {
  price: string;
  qty: string;
};

const SkeletonRow = () => {
  return (
    <div className="h-4 bg-gray-100/10 mb-1 rounded-sm animate-pulse w-full pb-1"></div>
  );
};

const AskRow = ({ price, qty }: OrderRowProps) => {
  return (
    <div className="flex justify-between items-center font-medium">
      <span className="text-red-500">{qty}</span>
      <span>{price}</span>
    </div>
  );
};

const BidRow = ({ price, qty }: OrderRowProps) => {
  return (
    <div className="flex justify-between items-center font-medium">
      <span>{price}</span>
      <span className="text-green-500">{qty}</span>
    </div>
  );
};

const Orderbook = () => {
  const program = "";
  const bidsPda = "TEST_BID_PDA";
  const asksPda = "TEST_ASK_PDA";
  const [asks, setAsks] = useState<OrderRowProps[]>([]);
  const [bids, setBids] = useState<OrderRowProps[]>([]);

  const getBids = async () => {
    try {
      if (!program) throw new Error("No program found!!");
      // await initializeMarket(program);
      const bidsResponse = await program.account.orders.fetch(
        new anchor.web3.PublicKey(bidsPda)
      );
      setBids(
        bidsResponse?.sorted?.map((item) => {
          return {
            ...item,
            orderId: item.orderId.toString(),
            price: priceFromOrderId(item?.orderId),
            qty: Number(item?.qty.toString()).toFixed(2),
          } as const;
        })
      );
    } catch (err) {
      console.log("Error in getBids", err);
    }
  };

  const getAsks = async () => {
    try {
      if (!program) throw new Error("No program found!!");
      // await initializeMarket(program);
      const asksResponse = await program.account.orders.fetch(
        new anchor.web3.PublicKey(asksPda)
      );
      setAsks(
        asksResponse?.sorted?.map((item) => {
          return {
            ...item,
            orderId: item.orderId.toString(),
            price: priceFromOrderId(item?.orderId),
            qty: Number(item?.qty.toString()).toFixed(2),
          } as const;
        })
      );
    } catch (err) {
      console.log("Error in getAsks", err);
    }
  };

  return (
    <>
      <h6 className="font-heading font-medium">Orderbook</h6>
      <div className="flex items-center font-medium justify-between text-sm mt-2 text-gray-500">
        <div>Price(wSOL)</div>
        <div>Quantity</div>
        <div>Price(wSOL)</div>
      </div>
      <div className="grid gap-4 grid-cols-2 mt-1">
        {/* Bids Column */}
        <div>
          <div className="bg-green-900/10">
            {bids?.map((item, idx) => (
              <BidRow price={item?.price} qty={item?.qty} key={`bid-${idx}`} />
            ))}
          </div>
          {/* Asks column */}
        </div>
        <div>
          <div className="bg-red-900/10">
            {asks?.map((item, idx) => (
              <AskRow price={item?.price} qty={item?.qty} key={`ask-${idx}`} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Orderbook;
