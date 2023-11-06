import { OpenOrders } from "@/types";
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

const OpenOrders = () => {
  const myOrders: OpenOrders = [
    {
      orderId: "1",
      price: "70",
      qty: "1",
      owner: "1",
      ownerSlot: "1",
      type: "Ask",
    },
    {
      orderId: "2",
      price: "50",
      qty: "1",
      owner: "1",
      ownerSlot: "1",
      type: "Bid",
    },
    {
      orderId: "3",
      price: "999",
      qty: "1",
      owner: "1",
      ownerSlot: "1",
      type: "Ask",
    },
   
  ];

  return (
    <>
      <h6 className="font-heading font-medium">Open Orders</h6>
      <Table removeWrapper aria-label="Example static collection table" className="mt-2">
        <TableHeader>
          <TableColumn className="text-center">Price</TableColumn>
          <TableColumn className="text-center">Quantity</TableColumn>
          <TableColumn className="text-center">Side</TableColumn>
          <TableColumn className="text-center">Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {myOrders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell className="text-center">{order.price}</TableCell>
              <TableCell className="text-center">{order.qty}</TableCell>
              <TableCell className="text-center"><Chip color={order.type === 'Ask' ? 'danger' : 'success'} variant="flat"> {order.type}</Chip></TableCell>
              <TableCell className="flex gap-4 items-center justify-center">
                <Button color="success" size="sm">Finalise</Button>
                <Button variant="ghost" color='danger' size="sm">Cancel</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default OpenOrders;
