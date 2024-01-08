import Layout from "@/components/Layout";
import { MARKETS } from "@/solana/config";
import { fetchTokenBalance, mintTo } from "@/solana/utils";
import {
  Button,
  Select,
  SelectItem,
  Selection,
  Spinner,
} from "@nextui-org/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Balances = { pcBalance: string; coinBalance: string };

const Airdrop = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMarketPda = searchParams.get("market");
  const [isLoading, setIsLoading] = useState(false);
  const connectedWallet = useAnchorWallet();
  const { connection } = useConnection();

  const [marketName, setMarketName] = useState<Selection>(
    new Set([MARKETS[0].marketPda])
  );

  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
  const [balances, setBalances] = useState<Balances>({
    pcBalance: "0.00",
    coinBalance: "0.00",
  });

  useEffect(() => {
    // change selected market based on url params selectedMarketPda
    if (!selectedMarketPda) {
      setMarketName(new Set([MARKETS[0].marketPda]));
      setSelectedMarket(MARKETS[0]);
    } else {
      const newMarket =
        MARKETS.find((it) => it.marketPda === selectedMarketPda) || MARKETS[0];
      setMarketName(new Set([newMarket.marketPda]));
      setSelectedMarket(newMarket);
    }
  }, [selectedMarketPda]);

  const getPcBalance = async () => {
    try {
      setBalances((prev) => ({
        ...prev,
        pcBalance: "Fetching...",
      }));
      if (!connectedWallet?.publicKey) {
        alert("No wallet found");
        return;
      }

      const pcBalance = await fetchTokenBalance(
        connectedWallet?.publicKey,
        new PublicKey(selectedMarket.pcMint),
        connection
      );

      setBalances((prev) => ({
        ...prev,
        pcBalance: (Number(pcBalance) / 1000000).toFixed(2),
      }));
    } catch (err) {
      setBalances((prev) => ({
        ...prev,
        pcBalance: "0.00",
      }));
      console.log("Error in getPcBalance", err);
    }
  };
  const getCoinBalance = async () => {
    try {
      setBalances((prev) => ({
        ...prev,
        coinBalance: "Fetching...",
      }));
      if (!connectedWallet?.publicKey) {
        alert("No wallet found");
        return;
      }

      const coinBalance = await fetchTokenBalance(
        connectedWallet.publicKey,
        new PublicKey(selectedMarket.coinMint),
        connection
      );
      setBalances((prev) => ({
        ...prev,
        coinBalance: (Number(coinBalance) / 1000000000).toFixed(
          2
        ),
      }));
    } catch (err) {
      setBalances((prev) => ({
        ...prev,
        coinBalance: "0.00",
      }));
      console.log("Error in getPcBalance", err);
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
      await getPcBalance();
      await getCoinBalance();
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
      getPcBalance();
      getCoinBalance();
    }
  }, [selectedMarket, connectedWallet]);

  return (
    <Layout>
      <div className="screen-center">
        <div className="overflow-hidden  relative flex flex-col gap-4 p-6 border border-default-200 rounded-2xl bg-gradient-to-br max-w-md w-full from-default-100/75 via-black to-default-100/75">
          {/* PAY SECTION */}
          <div className="flex items-center justify-between">
            <p className="text-2xl font-medium whitespace-nowrap">
              Airdrop Tokens
            </p>
            <Select
              selectedKeys={marketName}
              onSelectionChange={(keys) => {
                const marketPubKey = Array.from(keys)[0];
                const selectedMarket = MARKETS.find(
                  (it) => it.marketPda === marketPubKey
                );
                if (!selectedMarket) return;
                router.push("/airdrop?market=" + selectedMarket.marketPda);
              }}
              className="w-40"
              size="md"
              selectionMode="single"
              labelPlacement="outside"
              aria-label="select-market"
              radius="sm"
            >
              {MARKETS.map((m) => (
                <SelectItem
                  aria-label={`${m.coinName} / ${m.pcName}`}
                  key={m.marketPda}
                  value={m.marketPda}
                  textValue={`${m.coinName} / ${m.pcName}`}
                >
                  {m.coinName} / {m.pcName}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="bg-default-100/80 p-4 rounded-md  border border-default-300">
            <p>Market</p>
            <p className="text-xs text-default-600">
              {selectedMarket.marketPda}
            </p>
          </div>
          <div className="bg-default-100/80 p-4 rounded-md  border border-default-300">
            <p>{selectedMarket.pcName}</p>
            <p className="text-xs text-default-600">{selectedMarket.pcMint}</p>
            <Button
              onClick={() =>
                airdropToken(
                  selectedMarket.pcMint,
                  1000 * 1000000
                )
              }
              size="sm"
              className="my-2"
              color="primary"
            >
              Airdrop 1000 {selectedMarket.pcName} tokens
            </Button>
            <p>Balance : {balances.pcBalance}</p>
          </div>
          <div className="bg-default-100/80 p-4 rounded-md  border border-default-300">
            <p>{selectedMarket.coinName}</p>
            <p className="text-xs text-default-600">
              {selectedMarket.coinMint}
            </p>
            <Button
              onClick={() =>
                airdropToken(
                  selectedMarket.coinMint,
                  1000 * 1000000000
                )
              }
              size="sm"
              className="my-2"
              color="primary"
            >
              Airdrop 1000 {selectedMarket.coinName} tokens
            </Button>
            <p>Balance : {balances.coinBalance}</p>
          </div>
          {isLoading && (
            <div className="w-full h-full backdrop-blur-xl z-10 absolute bg-black/50 top-0 left-0 scale-[0.995] rounded-xl flex flex-col items-center justify-center gap-4">
              <Spinner size="lg" />
              <p>Loading...</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Airdrop;
