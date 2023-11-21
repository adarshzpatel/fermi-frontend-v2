
import { useFermiStore } from "@/stores/fermiStore";

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
import { useSearchParams } from "next/navigation";


const OpenOrders = () => {
  const { openOrders } = useFermiStore();
  return (
    <div>
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
          {openOrders?.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell className="text-center">{order.price}</TableCell>
              <TableCell className="text-center">{order.qty}</TableCell>
              <TableCell className="text-center">
                <Chip
                  color={order.side === "Ask" ? "danger" : "success"}
                  variant="flat"
                >
                  {order.side}
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
    </div>
  );
};

export default OpenOrders;
