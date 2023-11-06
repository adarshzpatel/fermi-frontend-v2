import { ChangeEvent, FormEvent, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@nextui-org/react";
import * as anchor from "@project-serum/anchor";
import toast from "react-hot-toast";
import { createBuyOrderIx, createSellOrderIx } from "@/solana/instructions";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import useProgram from "@/hooks/useProgram";

type OrderParams = {
  limitPrice: anchor.BN;
  maxCoinQty: anchor.BN;
  maxNativeQty: anchor.BN;
};

const PlaceOrder = () => {
  const [selectedMode, setSelectedMode] = useState("buy");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [processing, setProcessing] = useState(false);
  const connectedWallet = useAnchorWallet()
  const {program} = useProgram()

  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setProcessing(true);
      if (price <= 0 || quantity <= 0) {
        toast.error("Price and Quantity must be greater than 0");
        throw new Error("Price and Quantity must be greater than 0");
        return
      }
      if(!connectedWallet?.publicKey){
        toast.error("Please connect your wallet");
        throw new Error("Please connect your wallet");  
        return
      }
      if(!program){
        toast.error("Program not initialized");
        throw new Error("Program not initialized")
        return
      }

      if (selectedMode === "buy") {
        await createBuyOrderIx({
          authority:connectedWallet?.publicKey,
          coinMint: new anchor.web3.PublicKey("ewe"),
          pcMint: new anchor.web3.PublicKey("dw"),
          marketPda: new anchor.web3.PublicKey("dw"),
          price:price.toString(),
          qty:quantity.toString(),
          program
        })
      } else {
        await createSellOrderIx({
          authority:connectedWallet?.publicKey,
          coinMint: new anchor.web3.PublicKey("ewe"),
          pcMint: new anchor.web3.PublicKey("dw"),
          marketPda: new anchor.web3.PublicKey("dw"),
          price:price.toString(),
          qty:quantity.toString(),
          program
        })
      }
    } catch (err: any) {
      console.log("Error in handlePlaceOrder:", err);
      toast.error(err?.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex-[1] style-card shadow-sm rounded-md  p-4">
      <h6 className="font-heading font-medium">BONK/USDC</h6>
      <Tabs
        onSelectionChange={(key) => setSelectedMode(key.toString())}
        color={selectedMode === "buy" ? "primary" : "danger"}
        radius="md"
        className="mt-2 font-medium  "
        fullWidth
      >
        <Tab title="Buy" key="buy" />
        <Tab title="Sell" key="sell" />
      </Tabs>
      <form onSubmit={handlePlaceOrder} className="mt-2 space-y-2">
        <Select
          label="Order type"
          placeholder="Select order type"
          defaultValue={"limit"}
          disabledKeys={["market"]}
          classNames={{
            trigger:
              "bg-default-50 border-1 border-default-200 hover:border-default-400 active:border-default-400",
            popover: "style-card shadow-lg",
          }}
        >
          <SelectItem key="limit" textValue="Limit">
            Limit
          </SelectItem>
          <SelectItem key="market" textValue="Market">
            Market
          </SelectItem>
        </Select>
        <Input
          type="number"
          variant="faded"
          // labelPlacement="outside"
          classNames={{
            label: "text-default-500",
            input: "text-lg font-medium",
            inputWrapper:
              "bg-default-50 hover:border-default-400 active:border-default-400",
          }}
          placeholder="0.00"
          label="Price"
          onChange={(e) => setPrice(e.target.valueAsNumber)}
          value={price.toString()}
          required
        />
        <Input
          type="number"
          variant="faded"
          // labelPlacement="outside"
          classNames={{
            label: "text-default-500",
            input: "text-lg font-medium",
            inputWrapper:
              "bg-default-50 hover:border-default-400 active:border-default-400",
          }}
          placeholder="0.00"
          label="Quantity"
          value={quantity.toString()}
          onChange={(e) => setQuantity(e.target.valueAsNumber)}
          required
        />
        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            color={selectedMode === "buy" ? "primary" : "danger"}
          >
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
