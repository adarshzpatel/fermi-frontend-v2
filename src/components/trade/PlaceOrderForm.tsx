import { FormEvent, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useFermiStore } from "@/stores/fermiStore";

type TradeForm = {
  side: string;
  price: string;
  size: string;
};

export const DEFAULT_TRADE_FORM: TradeForm = {
  side: "buy",
  price: "",
  size: "",
};

const PlaceOrder = () => {
  const [formData, setFormData] = useState<TradeForm>(DEFAULT_TRADE_FORM);
  const [processing, setProcessing] = useState(false);
  const connectedWallet = useAnchorWallet();
  const selectedMarket = useFermiStore((state) => state.selectedMarket);

  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setProcessing(true);
      if (Number(formData.price) <= 0 || Number(formData.size) <= 0) {
        toast.error("Price and Quantity must be greater than 0");
        throw new Error("Price and Quantity must be greater than 0");
      }
      if (!connectedWallet?.publicKey) {
        toast.error("Please connect your wallet");
        throw new Error("Please connect your wallet");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex-[1] style-card shadow-sm   p-4">
      <h6 className="font-heading font-medium">

      </h6>
      <Tabs
        onSelectionChange={(key) => setFormData(state => ({...state,side:key.toString()}))}
        color={formData.side === "buy" ? "primary" : "danger"}
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
          onChange={(e) => setFormData((state) => ({ ...state, price: e.target.value }))}
          value={formData.price}n
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
          value={formData.size}
          radius="none"
          onChange={(e) =>
            setFormData((state) => ({ ...state, size: e.target.value }))
          }
          required
          disabled={processing}
        />
        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            radius="none"
            isLoading={processing}
            color={formData.side === "buy" ? "primary" : "danger"}
          >
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
