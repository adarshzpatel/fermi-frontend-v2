import useProgram from "@/hooks/useFermiProgram";
import { getOpenOrders } from "@/solana/utils";

import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const OpenOrders = () => {
  const { program } = useProgram();
  const connectedWallet = useAnchorWallet();
  const searchParams = useSearchParams();
  const marketPda = searchParams.get("market");
  const [orderIds, setOrderIds] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      if (!connectedWallet?.publicKey || !program || !marketPda) return;
      const openOrdersResponse = await getOpenOrders(
        connectedWallet?.publicKey,
        new PublicKey(marketPda),
        program
      );
      const orders = openOrdersResponse?.orders.map((o) =>  o.toString()).filter((o)=>o !== '0');
      console.log("My open order ids",orders)
      setOrderIds(orders);
    })();
  }, [connectedWallet, program, marketPda]);
  

  return (
    <>
      <h6 className="font-heading font-medium">Open Orders</h6>
      <Table
        removeWrapper
        aria-label="Example static collection table"
        className="mt-2"
      >
        <TableHeader>
          <TableColumn className="text-center">Price</TableColumn>
          <TableColumn className="text-center">Quantity</TableColumn>
          <TableColumn className="text-center">Side</TableColumn>
          <TableColumn className="text-center">Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {orderIds.map((id) => (
            <TableRow key={id}>
              <TableCell className="text-center">{10}</TableCell>
              <TableCell className="text-center">{1}</TableCell>
              <TableCell className="text-center">
                <Chip
                  // color={order.type === "Ask" ? "danger" : "success"}
                  variant="flat"
                >
                  {" "}
                  BUY
                  {/* {order.type} */}
                </Chip>
              </TableCell>
              <TableCell className="flex gap-4 items-center justify-center">
                <Button color="success" size="sm">
                  Finalise
                </Button>
                <Button variant="ghost" color="danger" size="sm">
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default OpenOrders;
