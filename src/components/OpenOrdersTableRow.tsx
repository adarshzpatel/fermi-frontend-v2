import { useFermiStore } from "@/stores/fermiStore";
import { Button } from "@nextui-org/react";
import { useState } from "react";

const OpenOrdersTableRow = ({ id, clientId, lockedPrice }) => {
  const cancelOrderById = useFermiStore(state => state.actions.cancelOrderById)
  const [isCancelling,setIsCancelling] = useState(false)
  const [isFinalising,setIsFinalising] = useState(false)
  
  const handleFinalise = async () => {
    console.log("Trying to finalise",id)
  };
  
  const handleCancel = async () => {
    setIsCancelling(true)
    await cancelOrderById(id)
    setIsCancelling(false)
  };

  return (
    <tr className=" border-t-1 border-default-200">
      <td className="text-left  p-3">{id}</td>
      <td className="text-center p-3">{clientId}</td>
      <td className="text-center p-3">{lockedPrice}</td>
      <td className="flex items-center p-3 justify-end gap-4">
        <Button
          onClick={handleFinalise}
          isLoading={isFinalising}
          isDisabled={isCancelling}
          radius="none"
          variant="ghost"
        >
          Finalise
        </Button>

        <Button
          onClick={handleCancel}
          isLoading={isCancelling}
          isDisabled={isFinalising}
          radius="none"
          variant="ghost"
          
        >
          Cancel
        </Button>
      </td>
    </tr>
  );
};

export default OpenOrdersTableRow