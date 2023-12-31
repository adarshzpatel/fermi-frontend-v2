import { FormEvent, useState } from "react";
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
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useFermiStore } from "@/stores/fermiStore";

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
  const connectedWallet = useAnchorWallet();
  const {program,selectedMarket,loadData} = useFermiStore()

  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setProcessing(true);
      if (price <= 0 || quantity <= 0) {
        toast.error("Price and Quantity must be greater than 0");
        throw new Error("Price and Quantity must be greater than 0");

      }
      if (!connectedWallet?.publicKey) {
        toast.error("Please connect your wallet");
        throw new Error("Please connect your wallet");

      }
      if (!program) {
        toast.error("Program not initialized");
        throw new Error("Program not initialized");

      }
      if (!selectedMarket) {
        toast.error("Market not selected");
        throw new Error("Market not selected");

      }
      let tx;
      console.log(selectedMarket);
      
      if (selectedMode === "buy") {
        tx = await createBuyOrderIx({
          authority: connectedWallet?.publicKey,
          coinMint: new anchor.web3.PublicKey(selectedMarket?.coinMint),
          pcMint: new anchor.web3.PublicKey(selectedMarket?.pcMint),
          marketPda: new anchor.web3.PublicKey(selectedMarket?.marketPda),
          price: price.toString(),
          qty: quantity.toString(),
          program,
        });
        if (!tx) throw new Error("Error in creating buy order");
        console.log("Placed buy order : ", tx);
        toast("Buy order placed successfully");
      } else {
        tx = await createSellOrderIx({
          authority: connectedWallet?.publicKey,
          coinMint: new anchor.web3.PublicKey(selectedMarket?.coinMint),
          pcMint: new anchor.web3.PublicKey(selectedMarket?.pcMint),
          price: price.toString(),
          marketPda: new anchor.web3.PublicKey(selectedMarket?.marketPda),
          qty: quantity.toString(),
          program,
        });
        if (!tx) throw new Error("Error in creating sell order");
        console.log("Placed sell order : ", tx);
        toast("Sell order placed successfully");
      }
    } catch (err: any) {
      const errMsg = err?.message ?? "Something went wrong";  
      console.error("Error in handlePlaceOrder",errMsg)
      // TODO :  do proper error handling 
      toast.error("Failed to place order, check console");
    } finally {
      setProcessing(false);
      await loadData()
    }
  };

  return (
    <div className="flex-[1] style-card shadow-sm   p-4">
      <h6 className="font-heading font-medium">{selectedMarket?.coinName}/{selectedMarket?.pcName}</h6>
      <Tabs
        onSelectionChange={(key) => setSelectedMode(key.toString())}
        color={selectedMode === "buy" ? "primary" : "danger"}
        radius="none"
        className="mt-2 font-medium"
        fullWidth
      >
        <Tab title="Buy" key="buy" />
        <Tab title="Sell" key="sell" />
      </Tabs>
      <form onSubmit={handlePlaceOrder} className="mt-2 space-y-2">
        <Select
          label="Order type"
          placeholder="Select order type"
          selectedKeys={["limit"]}
          disabledKeys={["market"]}
          classNames={{
            trigger:
              "bg-default-50  border-1 border-default-200 hover:border-default-400 active:border-default-400",
            popover: "style-card rounded-none shadow-lg",
          }}
          radius="none"
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
          radius="none"
          disabled={processing}
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
          radius="none"
          onChange={(e) => setQuantity(e.target.valueAsNumber)}
          required
          disabled={processing}
        />
        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            radius="none"
            isLoading={processing}
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
