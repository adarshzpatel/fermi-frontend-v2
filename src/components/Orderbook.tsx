import { useEffect, useState } from "react";
import * as anchor from "@project-serum/anchor";
import useProgram from "@/hooks/useFermiProgram";
import { PublicKey } from "@solana/web3.js";
import useOrderbook from "@/hooks/useOrderbook";

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
    <div className="flex text-red-500 justify-between items-center font-medium">
      <span >{qty}</span>
      <span>{price}</span>
    </div>
  );
};

const BidRow = ({ price, qty }: OrderRowProps) => {
  return (
    <div className="flex text-green-500 justify-between items-center font-medium">
      <span>{price}</span>
      <span >{qty}</span>
    </div>
  );
};

const Orderbook = () => {
  const {asks,bids} = useOrderbook()

  
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
