import Layout from "@/components/layout/Layout";
import CreateOpenOrdersAccountModal from "@/components/trade/CreateOpenOrdersAccountModal";
import MarketSelector from "@/components/trade/MarketSelector";
import { MARKETS } from "@/solana/config";
import { fetchTokenBalance } from "@/solana/utils/helpers";
import { useFermiStore } from "@/stores/fermiStore";
import { Button, Spinner, useDisclosure } from "@nextui-org/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Balances = { baseBalance: string; quoteBalance: string };

const Airdrop = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const selectedMarketPda = searchParams.get("market");
  const openOrdersAccountPk = useFermiStore(
    (state) => state.openOrders.publicKey
  );
  const isOpenOrdersLoading = useFermiStore((state) => state.isOOLoading);
  const updateMarket = useFermiStore((state) => state.actions.updateMarket);
  const isMarketLoading = useFermiStore((state) => state.isMarketLoading);
  const selectedMarket = useFermiStore((state) => state.selectedMarket);
  const fetchOpenOrders = useFermiStore(
    (state) => state.actions.fetchOpenOrders
  );
  const connectedWallet = useAnchorWallet();
  const { connection } = useConnection();

  const {
    isOpen: isCreateOOModalOpen,
    onOpen: openCreateOOModal,
    onClose: closeCreateOOModal,
    onOpenChange: onCreateOOModalOpenChange,
  } = useDisclosure({ id: "create-oo-modal" });

  const [balances, setBalances] = useState<Balances>({
    quoteBalance: "0.00",
    baseBalance: "0.00",
  });

  useEffect(() => {
    if (!selectedMarketPda) {
      router.push("/airdrop?market=" + MARKETS[0].marketPda);
    } else {
      updateMarket(selectedMarketPda);
      fetchOpenOrders();
    }
  }, [selectedMarketPda]);

  const getQuoteBalance = async () => {
    try {
      setBalances((prev) => ({
        ...prev,
        quoteBalance: "Fetching...",
      }));
      if (!connectedWallet?.publicKey) throw new Error("Wallet not connected");
      if (!selectedMarket.current) throw new Error("Market not selected");

      const quoteBalance = await fetchTokenBalance(
        connectedWallet?.publicKey,
        selectedMarket.current?.quoteMint,
        connection
      );

      setBalances((prev) => ({
        ...prev,
        quoteBalance: (Number(quoteBalance) / 1000000).toFixed(2),
      }));
    } catch (err) {
      setBalances((prev) => ({
        ...prev,
        quoteBalance: "0.00",
      }));
      console.log("Error in getQuoteBalance", err);
    }
  };
  const getBaseBalance = async () => {
    try {
      setBalances((prev) => ({
        ...prev,
        baseBalance: "Fetching...",
      }));
      if (!connectedWallet?.publicKey) throw new Error("Wallet not connected");
      if (!selectedMarket.current) throw new Error("Market not selected");

      const baseBalance = await fetchTokenBalance(
        connectedWallet.publicKey,
        selectedMarket.current?.baseMint,
        connection
      );
      setBalances((prev) => ({
        ...prev,
        baseBalance: (Number(baseBalance) / 1000000000).toFixed(2),
      }));
    } catch (err) {
      setBalances((prev) => ({
        ...prev,
        baseBalance: "0.00",
      }));
      console.log("Error in getBaseBalance", err);
    }
  };

  const airdropToken = async (mint: string, amount: number) => {
    try {
      setIsLoading(true);
      const data = {
        destinationAddress: connectedWallet?.publicKey,
        mint,
        amount,
      };
      console.log(data);
      const res = await axios.post("/api/airdrop", data);
      console.log(res.data);
      await getBaseBalance();
      await getQuoteBalance();
      toast("Airdrop Successful ✅");
    } catch (err) {
      toast.error("Failed to send airdrop!!");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connectedWallet && selectedMarket) {
      getBaseBalance();
      getQuoteBalance();
    }
  }, [selectedMarket, connectedWallet]);

  // if (!isMarketLoading && !selectedMarket.publicKey) {
  //   return (
  //     <Layout>
  //       <div className="flex items-center justify-center screen-center">
  //         INVALID MARKET
  //       </div>
  //     </Layout>
  //   );
  // }

  return (
    <Layout>
      <div className="screen-center">
        <div className="overflow-hidden  relative flex flex-col gap-4 p-6 border border-default-200 bg-gradient-to-br max-w-md w-full from-default-100/75 via-black to-default-100/75">
          {/* PAY SECTION */}
          <div className="flex gap-4 items-center justify-between">
            <p className="text-2xl  font-medium whitespace-nowrap">
              Airdrop Tokens
            </p>
            <MarketSelector />
          </div>
          <div className="bg-default-100/80 p-4  border border-default-300">
            <p className="font-medium">Market</p>
            <p className="text-xs text-default-600">
              {!isMarketLoading
                ? selectedMarket?.publicKey?.toString()
                : "Loading Market...."}
            </p>
          </div>
          <div className="bg-default-100/80 p-4  border border-default-300">
            <p className="font-medium">Quote token</p>
            <p className="text-xs text-default-600">
              {!isMarketLoading
                ? selectedMarket.current?.quoteMint.toString()
                : "Loading..."}
            </p>
            <Button
              isDisabled={isMarketLoading}
              radius="none"
              onClick={() => {
                if (!selectedMarket.current) return;
                airdropToken(
                  selectedMarket?.current?.quoteMint.toString(),
                  1000 * 1000000
                );
              }}
              size="sm"
              className="my-2"
              color="primary"
            >
              Airdrop 1000 quote tokens
            </Button>
            <p>Balance : {balances.quoteBalance}</p>
          </div>
          <div className="bg-default-100/80 p-4  border border-default-300">
            <p className="font-medium">Base Token</p>
            <p className="text-xs text-default-600">
              {!isMarketLoading
                ? selectedMarket.current?.baseMint.toString()
                : "Loading..."}
            </p>
            <Button
              isDisabled={isMarketLoading}
              onClick={() => {
                if (!selectedMarket.current) return;
                airdropToken(
                  selectedMarket.current?.baseMint.toString(),
                  1000 * 1000000000
                );
              }}
              size="sm"
              radius="none"
              className="my-2"
              color="primary"
            >
              Airdrop 1000 base tokens
            </Button>
            <p>Balance : {balances.baseBalance}</p>
          </div>
          <div className="bg-default-100/80 p-4  border border-default-300">
            <p className="font-medium mb-2">
              Open orders account {isOpenOrdersLoading && `( Loading )`}
            </p>
            {openOrdersAccountPk ? (
              <p className="text-xs">{openOrdersAccountPk.toString()}</p>
            ) : (
              <Button
                radius="none"
                size="sm"
                color="primary"
                onClick={() => openCreateOOModal()}
              >
                Create open orders account
              </Button>
            )}
          </div>
          {isLoading && (
            <div className="w-full h-full backdrop-blur-xl z-10 absolute bg-black/50 top-0 left-0 scale-[0.995] flex flex-col items-center justify-center gap-4">
              <Spinner size="lg" />
              <p>Loading...</p>
            </div>
          )}
        </div>
      </div>
      <CreateOpenOrdersAccountModal
        closeModal={closeCreateOOModal}
        isOpen={isCreateOOModalOpen}
        onOpenChange={onCreateOOModalOpenChange}
      />
    </Layout>
  );
};

export default Airdrop;
