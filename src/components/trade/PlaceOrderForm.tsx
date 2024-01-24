import { FormEvent, useId, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Tab,
  Tabs,
  useDisclosure,
} from "@nextui-org/react";
import toast from "react-hot-toast";

import { useFermiStore } from "@/stores/fermiStore";
import { NumericFormat } from "react-number-format";
import {
  Side,
  checkOrCreateAssociatedTokenAccount,
} from "@/solana/utils/helpers";
import { PlaceOrderArgs } from "@/solana/fermiClient";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

import CreateOpenOrdersAccountModal from "./CreateOpenOrdersAccountModal";


export enum SideType {
  Buy = "buy",
  Sell = "sell",
}

type TradeForm = {
  side: SideType;
  price: string;
  size: string;
};

export const DEFAULT_TRADE_FORM: TradeForm = {
  side: SideType.Buy,
  price: "",
  size: "",
};



const PlaceOrder = () => {
  const [formData, setFormData] = useState<TradeForm>(DEFAULT_TRADE_FORM);
  const [processing, setProcessing] = useState(false);
  const {
    isOpen: isCreateOOModalOpen,
    onOpen: openCreateOOModal,
    onClose: closeCreateOOModal,
    onOpenChange: onCreateOOModalOpenChange,
  } = useDisclosure({ id: "create-oo-modal" });
  const client = useFermiStore((state) => state.client);
  const {publicKey:openOrdersPublicKey,orders} = useFermiStore(
    (state) => state.openOrders
  );
  const reloadMarket = useFermiStore((state) => state.actions.reloadMarket);
  const fetchOpenOrders = useFermiStore(
    (state) => state.actions.fetchOpenOrders
  );
  const selectedMarket = useFermiStore((state) => state.selectedMarket);


  
  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (!formData.price || !formData.size)
        throw new Error("Please enter price and size");
      if (!client) throw new Error("Client not initialized");
      if (!selectedMarket) throw new Error("Market not selected");

      const { publicKey: marketPublicKey, current: market } = selectedMarket;
      if (!market || !marketPublicKey) throw new Error("Market not found");

      if (!openOrdersPublicKey) {
        openCreateOOModal();
        return;
      }

      const { side, price, size } = formData;
      if(orders == undefined) throw new Error("Orders not found")
      const clientOrderId = new BN(orders.length + 1)
      console.log({price,size,side,clientOrderId})
      const orderArgs: PlaceOrderArgs = {
        side: side === SideType.Buy ? Side.Bid : Side.Ask,
        priceLots: new BN(price),
        maxBaseLots: new BN(size),
        maxQuoteLotsIncludingFees: new BN(size).mul(new BN(price)),
        clientOrderId,
        orderType: { limit: {} },
        expiryTimestamp: new BN(Math.floor(Date.now() / 1000) + 3600),
        selfTradeBehavior: { decrementTake: {} }, // Options might include 'decrementTake', 'cancelProvide', 'abortTransaction', etc.
        limit: 5,
      };

      const marketAuthorityPDA = market?.marketAuthority;

      let userTokenAccount;
      if (side === SideType.Buy) {
        // Prepare Bid Order

        // Get Quote Mint Token
        userTokenAccount = new PublicKey(
          await checkOrCreateAssociatedTokenAccount(
            client.provider,
            market?.quoteMint,
            client.walletPk
          )
        );
      } else {
        // Get Base Mint Token
        userTokenAccount = new PublicKey(
          await checkOrCreateAssociatedTokenAccount(
            client.provider,
            market?.baseMint,
            client.walletPk
          )
        );
      }

      const [ix, signers] = await client.placeOrderIx(
        openOrdersPublicKey,
        marketPublicKey,
        market,
        marketAuthorityPDA,
        userTokenAccount,
        null, // openOrdersAdmin
        orderArgs,
        [] // remainingAccounts
      );
      // Send transaction
      await client.sendAndConfirmTransaction([ix], {
        additionalSigners: signers,
      });

      toast.success("Order placed successfully");
      await reloadMarket();
      await fetchOpenOrders();
    } catch (err: any) {
      const message = err?.message || "Failed to place order";
      toast.error(message);
      console.error("Error in placeOrder:", err);
    } finally {
      setFormData(DEFAULT_TRADE_FORM);
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="flex-[1] style-card shadow-sm   p-4">
        <h6 className="font-heading font-medium"></h6>

        <Tabs
        size="lg"
          onSelectionChange={(key) =>
            setFormData((state) => ({
              ...state,
              side: key.toString() as SideType,
            }))
          }
          color={formData.side === SideType.Buy ? "primary" : "danger"}
          radius="none"
          selectedKey={formData.side}
          className=" font-medium"
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
            size="lg"
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
          <NumericFormat
            value={formData.price}
            displayType="input"
            placeholder="0.00"
            min={0}
            customInput={Input}
            label="Price"
            name="price"
            required
            isDisabled={processing}
            radius="none"
            variant="faded"
            onValueChange={(values) => {

              const { value } = values;
              setFormData((state) => ({ ...state, price: value }));
            }}
            thousandSeparator=","
            size="lg"
            allowNegative={false}
          />
          <NumericFormat
            value={formData.size}
            displayType="input"
            placeholder="0.00"
            min={0}
            name="size"
            customInput={Input}
            label="Size"
            required
            isDisabled={processing}
            radius="none"
            variant="faded"
            size="lg"
            onValueChange={(values) => {

              const { value } = values;
              setFormData((state) => ({ ...state, size: value }));
            }}
            thousandSeparator=","
            allowNegative={false}
          />
          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              size="lg"
              radius="none"
              isLoading={processing}
              color={formData.side === SideType.Buy ? "primary" : "danger"}
            >
              Place Order
            </Button>
          </div>
        </form>
      </div>
      <CreateOpenOrdersAccountModal
        isOpen={isCreateOOModalOpen}

        closeModal={closeCreateOOModal}
      />
    </>
  );
};

export default PlaceOrder;
