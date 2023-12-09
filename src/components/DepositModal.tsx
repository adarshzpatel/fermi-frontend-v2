import { createDepositCoinIx, createDepositPcIx } from "@/solana/instructions";
import { fetchTokenBalance } from "@/solana/utils";
import { useFermiStore } from "@/stores/fermiStore";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Spinner,
  Link,
} from "@nextui-org/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import React, { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  tokenType: "coin" | "pc";
  isOpen: boolean;
  closeModal: () => void;
  onOpenChange: (isOpen: boolean) => void;
};

// todo : loading state

const DepositModal = ({ isOpen, closeModal, tokenType,onOpenChange }: Props) => {
  const { tokenBalances, selectedMarket, program, fetchOpenOrders } =
    useFermiStore();

  const tokenName =
    tokenType === "coin" ? selectedMarket?.coinName : selectedMarket?.pcName;
  const tokenMintAddress =
    tokenType === "coin" ? selectedMarket?.coinMint : selectedMarket?.pcMint;

  const connectedWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [walletBalance, setWalletBalance] = React.useState(0);
  const [openOrdersBalance, setOpenOrdersBalance] = React.useState(0);
  const [quantity, setQuantity] = useState(0);
  const [processing, setProcessing] = useState(true);
  const [txHash, setTxHash] = useState("");

  const getWalletBalance = async () => {
    try {
      if (!connectedWallet || !tokenMintAddress || !connection) return 0;
      const balance = await fetchTokenBalance(
        connectedWallet?.publicKey,
        new PublicKey(tokenMintAddress),
        connection
      );

      setWalletBalance(Number(balance));
    } catch (err) {
      console.log("Error in DepositModal/getWalletBalance:", err);
    }
  };
  const getOpenOrdersBalance = () => {
    try {
      if (tokenType === "coin") {
        setOpenOrdersBalance(Number(tokenBalances?.nativeCoinFree));
      }
      if (tokenType === "pc") {
        setOpenOrdersBalance(Number(tokenBalances?.nativePcFree));
      }
    } catch (err) {
      console.log("Error in DepositModal/getWalletBalance:", err);
    }
  };

  const handleDeposit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!connectedWallet) throw new Error("Please connect your wallet");
    if (!selectedMarket) throw new Error("Please select a market");
    if (!program) throw new Error("Program not initialized");
    try {
      setProcessing(true);
      if (tokenType === "pc") {
        const signature = await createDepositPcIx({
          amount: quantity,
          authority: connectedWallet?.publicKey,
          tokenMint: new PublicKey(selectedMarket?.pcMint),
          marketPda: new PublicKey(selectedMarket.marketPda),
          program: program,
        });
        console.log({ signature });
        setTxHash(signature ?? "");
        toast.success("Deposit txn sent ");
        await fetchOpenOrders();
      }
      if (tokenType === "coin") {
        const signature = await createDepositCoinIx({
          amount: quantity,
          authority: connectedWallet?.publicKey,
          tokenMint: new PublicKey(selectedMarket?.pcMint),
          marketPda: new PublicKey(selectedMarket.marketPda),
          program: program,
        });
        console.log({ signature });
        setTxHash(signature ?? "");
        toast.success("Deposit txn sent ");
        await fetchOpenOrders();
      }
    } catch (err) {
      console.log("Error in DepositModal/handleDeposit", err);
      toast.error("Failed to deposit ");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    (async () => {
      setProcessing(true);
      await getOpenOrdersBalance();
      await getWalletBalance();
      setProcessing(false);
    })();
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      className="border border-default-200"
        hideCloseButton
      backdrop="blur"
      radius="none"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalBody className="p-6 relative">
          <ModalHeader className="p-0 font-heading">
            Deposit {tokenName}
          </ModalHeader>
          {processing && (
            <div className="absolute inset-0 flex items-center justify-center z-10 h-full w-full backdrop-blur-xl">
              <Spinner size="lg" color="white" />
            </div>
          )}
          {txHash ? (
            <div className="flex flex-col  items-center justify-center">
              <IoMdCheckmarkCircleOutline className="h-16 w-16 text-green-400" />
              <p className="text-xl mt-4 font-heading font-semibold">
                Transaction Sent Successfully
              </p>
              <Link target="_blank" href={`https://solscan.io/tx/${txHash}?cluster=devnet`} className="mb-4 ">Tx Hash : {txHash.slice(0, 4) + "..." + txHash.slice(-4)} {"( click to view in explorer )"}</Link>
              <Button
                color="default"
                variant="ghost"
                onClick={closeModal}
                radius="none"
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-default-100 p-3">
                <p className=" text-default-500 mb-0">Mint Address</p>
                <p className=" text-sm font-medium text-default-400 ">
                  {tokenMintAddress}
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleDeposit}>
                <Input
                  required
                  min={0}
                  type="number"
                  onChange={(e) => setQuantity(e.target.valueAsNumber)}
                  radius="none"
                  variant="faded"
                  placeholder="Enter quantity"
                  label="Deposit Quantity"
                  size="lg"
                  labelPlacement="outside"
                  classNames={{
                    label: "text-default-500",
                    input: "text-lg font-medium",
                  }}
                />
                <div className="flex mt-4 gap-4">
                  <Button
                    fullWidth
                    radius="none"
                    variant="solid"
                    color="danger"
                    type="button"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    radius="none"
                    variant="solid"
                    color="primary"
                  >
                    Deposit
                  </Button>
                </div>
              </form>
              <div className="border-t space-y-2 pt-3 text-sm text-default-600  border-default-200 w-full ">
                <h6 className=" font-semibold text-default-500">Balances</h6>
                <p className="tabular-nums">
                  Wallet : {walletBalance} {tokenName}{" "}
                </p>
                <p>
                  Open orders Account:{openOrdersBalance} {tokenName}{" "}
                </p>
              </div>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DepositModal;
