import { Button, useDisclosure } from "@nextui-org/react";
import CreateOpenOrdersAccountModal from "./trade/CreateOpenOrdersAccountModal";
import { useFermiStore } from "@/stores/fermiStore";
import OpenOrdersTableRow from "./OpenOrdersTableRow";
import { useEffect, useMemo } from "react";

const OpenOrdersTable = () => {
  const {
    isOpen: isCreateOOModalOpen,
    onOpen: openCreateOOModal,
    onClose: closeCreateOOModal,
    onOpenChange
  } = useDisclosure({ id: "create-oo-modal" });
  const isOpenOrdersLoading = useFermiStore((state) => state.isOOLoading);
  const openOrders = useFermiStore((state) => state.openOrders);
  const eventHeap = useFermiStore((state) => state.selectedMarket.eventHeap);
  const [client,selectedMarket,fetchOpenOrders] = useFermiStore(state => [state.client,state.selectedMarket,state.actions.fetchOpenOrders])

  useEffect(()=>{
      fetchOpenOrders()
  },[client,selectedMarket.publicKey])

  const canFinalise = useMemo(() => {
    let map: { [x: string]: any } = {};
    if (eventHeap != undefined && openOrders != undefined) {
      openOrders?.orders?.forEach((order) => {
        const match = eventHeap?.find(
          (event) => event.makerClientOrderId.toString() === order.clientId
        );
        if(match) map[order.id] = match;
      });
    }
    return map;
  }, [openOrders,eventHeap]);


  useEffect(()=>{
    console.log("canFinalise",canFinalise)
  },[canFinalise])
  if (isOpenOrdersLoading) {
    return (
      <div className="h-12 w-full bg-neutral-800 animate-pulse mt-2"></div>
    );
  }

  if (!isOpenOrdersLoading && !openOrders.publicKey) {
    return (
      <div className="flex justify-between bg-red-500/20 items-center border-1 border-red-600/50  mt-2 p-3">
        <p className="text-lg font-medium">
          Please create an open orders acccount to start trading...
        </p>
        <Button
          onClick={() => {
            console.log("Opening create oo modal")
            console.log({isCreateOOModalOpen})
            openCreateOOModal()
          }}
          radius="none"
          variant="solid"
          color="warning"
          className="font-medium bg-red-100 text-red-800 "
        >
          Create Open Orders Account{" "}
        </Button>
        <CreateOpenOrdersAccountModal
        isOpen={isCreateOOModalOpen}
        closeModal={closeCreateOOModal}
      />
      </div>
    );
  }

  return (
    <div>
      <table className="w-full mt-2 table-auto border-1 border-default-200">
        <thead className="bg-default-200/75 text-sm text-default-600 h-10">
          <tr>
            <th className="text-left pl-4 font-medium">Order Id</th>
            <th className="text-center font-medium">Client Order Id</th>
            <th className="text-center font-medium">Price</th>
            {/* <th className="text-center font-medium">Side</th> */}
            <th className="text-right pr-4  font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm ">
          {/* Coin */}
          {openOrders.orders?.map((order, i) => (
            <OpenOrdersTableRow
              {...order}
              finaliseEvent={canFinalise[order.id]}
              key={"oo-" + order.id}
            />
          ))}
        </tbody>
      </table>
      {openOrders.orders?.length === 0 && (
        <span className="p-4 justify-center flex w-full border border-t-0 border-default-200">
          No open orders found
        </span>
      )}
    </div>
    
  );
};

export default OpenOrdersTable;
