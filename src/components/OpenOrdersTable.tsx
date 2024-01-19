import { useFermiStore } from "@/stores/fermiStore";
import { Button, Chip } from "@nextui-org/react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";


const OpenOrders = () => {
  const { openOrders,selectedMarket } = useFermiStore()

  useEffect(()=>{
    if(selectedMarket.publicKey && openOrders.publicKey){
      console.log({selectedMarket,openOrders})
    }
  },[selectedMarket,OpenOrders])
  
  return <></>
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
          {openOrders.orders?.map((order, i) => (
            <tr
              key={"oo-" + i + order.id}
              className=" border-t-1 border-default-100"
            >
              <td className="text-left  p-3">{order.id}</td>
              <td className="text-center p-3">{order.lockedPrice}</td>
              <td className="text-center p-3">{order.qty}</td>
              <td className="text-center p-3">
                <Chip
                  color={order.side === "Ask" ? "danger" : "success"}
                  variant="flat"
                >
                  Buy
                </Chip>
              </td>
              <td className="flex items-center p-3 justify-end gap-4">
                  <Button
                    // onClick={() => handleFinalise(order.orderId)}
                    size="sm"
                    radius="none"
                    variant="ghost"
                  >
                    Finalise
                  </Button>
                )
                <Button
                  // onClick={() => handleCancelOrder(order.orderId, order.side)}
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
      {openOrders.orders?.length === 0 && (
        <span className="p-4 justify-center flex w-full border border-t-0 border-default-100">
          No open orders found
        </span>
      )}
    </div>
  );
};

export default OpenOrders;
