import { useFermiStore } from "@/stores/fermiStore";
import { BN } from "@coral-xyz/anchor";
import { Button } from "@nextui-org/react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

type OpenOrdersTableRowProps = {
  id: string;
  clientId: string;
  lockedPrice: string;
  finaliseEvent: any ;
};
const OpenOrdersTableRow = ({
  id,
  clientId,
  lockedPrice,
  finaliseEvent,
}) => {
  const cancelOrderById = useFermiStore(
    (state) => state.actions.cancelOrderById
  );
  const finalise = useFermiStore(state => state.actions.finalise)
  const connectedWallet = useAnchorWallet()
  const [isCancelling, setIsCancelling] = useState(false);
  const [isFinalising, setIsFinalising] = useState(false);

  const handleFinalise = async () => {
    try{
      if(!finaliseEvent || !connectedWallet) return
      setIsFinalising(true)
      console.log(JSON.stringify(finaliseEvent))
      console.log("Trying to finalise", id); 
      await finalise(finaliseEvent.maker,finaliseEvent.taker,new BN(finaliseEvent.makerSlot))
    } catch(err){
      console.log(err)
    } finally{
      setIsFinalising(false)
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    await cancelOrderById(id);
    setIsCancelling(false);
  };

  return (
    <tr className=" border-t-1 border-default-200">
      <td className="text-left  p-3">{id}</td>
      <td className="text-center p-3">{clientId}</td>
      <td className="text-center p-3">{lockedPrice}</td>
      <td className="flex items-center p-3 justify-end gap-4">
        {finaliseEvent && (
          <Button
            onClick={handleFinalise}
            isLoading={isFinalising}
            isDisabled={isCancelling}
            radius="none"
            variant="ghost"
          >
            Finalise
          </Button>
        )}

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

export default OpenOrdersTableRow;
