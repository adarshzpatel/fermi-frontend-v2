import { FormEvent, useState } from "react";
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
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useFermiStore } from "@/stores/fermiStore";
import { NumericFormat } from "react-number-format";
import {
  Side,
  checkOrCreateAssociatedTokenAccount,
} from "@/solana/utils/helpers";
import { PlaceOrderArgs } from "@/solana/fermiClient";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import useProvider from "@/hooks/useProvider";
import CreateOpenOrdersAccountModal from "./CreateOpenOrdersAccountModal";
import crypto from "crypto";

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
  const connectedWallet = useAnchorWallet();  

  const {client,openOrders,selectedMarket,actions:{reloadMarket,fetchOpenOrders}} = useFermiStore()
  const provider = useProvider();

  const generateUniqueClientOrderId = (
    _walletPubKey: string,
    _marketPubKey: string
  ) => {
    // Concatenate the values
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:]/g, "")
      .split(".")[0];
    const concatenatedValues = `${_walletPubKey}${_marketPubKey}${timestamp}`;

    const uniqueId = crypto
      .createHash("sha256")
      .update(concatenatedValues)
      .digest("hex");

    return uniqueId;
  };
  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if(!formData.price || !formData.size) throw new Error("Please enter price and size")
      if (!connectedWallet?.publicKey) {
        toast.error("Please connect your wallet");
        throw new Error("Please connect your wallet");
      }
      if (!provider) throw new Error("Provider not found");
      if (!client) throw new Error("Client not initialized");
      if (!selectedMarket.publicKey) throw new Error("Market not selected");

      const {publicKey:marketPublicKey, current:market} = selectedMarket
      const openOrdersPublicKey = openOrders.publicKey;

      if (!market) throw new Error("Market not found");

      if (!openOrdersPublicKey) {
        openCreateOOModal()
        return 
      }     


      const { side, price, size } = formData;
      const clientOrderId = openOrders.orders ? new BN(openOrders.orders.length + 1) : new BN(generateUniqueClientOrderId(client.walletPk.toString(),marketPublicKey.toString()))
      console.log(clientOrderId.toString())

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
            provider,
            market?.quoteMint,
            connectedWallet.publicKey
          )
        );
      } else {
        // Get Base Mint Token
        userTokenAccount = new PublicKey(
          await checkOrCreateAssociatedTokenAccount(
            provider,
            market?.baseMint,
            connectedWallet.publicKey
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
      reloadMarket();
      fetchOpenOrders()
    } catch (err: any) {
      const message = err?.message || "Failed to place order";
      toast.error(message)
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
          onSelectionChange={(key) =>
            setFormData((state) => ({
              ...state,
              side: key.toString() as SideType,
            }))
          }
          color={formData.side === SideType.Buy ? "primary" : "danger"}
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
          <NumericFormat
            value={formData.price}
            displayType="input"
            placeholder="0.00"
            min={0}
            customInput={Input}
            label="Price"
            required
            disabled={processing}
            radius="none"
            variant="faded"
            onValueChange={(values) => {
              const { value } = values;
              setFormData((state) => ({ ...state, price: value }));
            }}
            thousandSeparator=","
            allowNegative={false}
          />
          <NumericFormat
            value={formData.size}
            displayType="input"
            placeholder="0.00"
            min={0}
            customInput={Input}
            label="Size"
            required
            disabled={processing}
            radius="none"
            variant="faded"
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
        onOpenChange={openCreateOOModal}
        closeModal={closeCreateOOModal}
      />
    </>
  );
};

export default PlaceOrder;