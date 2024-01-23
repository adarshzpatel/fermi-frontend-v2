import { parseEventHeap, useFermiStore } from "@/stores/fermiStore";
import { BN } from "@coral-xyz/anchor";
import { Button } from "@nextui-org/react";
import { useEffect } from "react";

// ORDERBOOK
type OrderRowProps = {
  price: string;
  qty: string;
};

const SkeletonRow = () => {
  return (
    <div className="h-4  bg-gray-100/20 mb-1 rounded-sm animate-pulse w-full "></div>
  );
};

const AskRow = ({ price, qty }: OrderRowProps) => {
  return (
    <div className="flex pl-4 pr-2 text-red-500 justify-between items-center font-medium">
      <span>{qty}</span>
      <span>{price}</span>
    </div>
  );
};

const BidRow = ({ price, qty }: OrderRowProps) => {
  return (
    <div className="flex pl-4 pr-2 text-green-500 justify-between items-center font-medium">
      <span>{price}</span>
      <span>{qty}</span>
    </div>
  );
};

const Orderbook = () => {
  const selectedMarket = useFermiStore((state) => state.selectedMarket);
  const isMarketLoading = useFermiStore((state) => state.isMarketLoading);  
  const { asks, bids} = selectedMarket;

  return (
    <>
      <div className="p-4 pb-0">
        <h6 className="font-heading font-medium">Orderbook</h6>
        <div className="flex items-center gap-1 font-medium justify-between text-sm mt-2 text-gray-500">
          <div>Price(wSOL)</div>
          <div>Quantity</div>
          <div>Price(wSOL)</div>
        </div>
      </div>
      <div className="grid  grid-cols-2 mt-1">
        {/* Bids Column */}
        <div>
          <div className="bg-green-900/10">
            {isMarketLoading
              ? [0, 1, 2,3,4,5,6].map((item) => (
                  <SkeletonRow key={"bids-skeleton" + item} />
                ))

              : bids?.map((item) => (
                  <BidRow
                    price={new BN(item?.key).shrn(64).toString()}
                    qty={item?.quantity?.toString()}
                    key={`bid-${item?.clientOrderId?.toString()+item?.key.toString().slice(0,5) }`}
                  />
                ))}
          </div>
          {/* Asks column */}
        </div>
        <div>
          <div className="bg-red-900/10">
            {isMarketLoading
              ? [0, 1, 2,3,4,5,6].map((item) => (
                  <SkeletonRow key={"asks-skeleton" + item} />
                ))
              : asks?.map((item) => (
                  <AskRow
                    price={new BN(item?.key).shrn(64).toString()}
                    qty={item?.quantity?.toString()}
                    key={`ask-${item?.clientOrderId?.toString()}`}
                  />
                ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Orderbook;
