import { MarketType } from "@/types";
import { Keypair } from "@solana/web3.js";

export const FERMI_PROGRAM_ID = "2BM843fAN55fqsMGidaqNr1P4127YLcxvTM5W4B2gNpn";

export const MARKETS: MarketType[] = [
  {
    marketPda: "5Qh64iKL6VbEByFYgVn2kupGn26K49c633wufUsKVkLV",
    coinMint: "Bgd9zcXgVTAfKTrtgnSjspuRz5LXEfn5CGUZ83RmLMMz",
    pcMint: "HUaSBG4fumCpQkna1k5RqAn9DuvXPG2jmwnLCznk9jXo",
    pcLotSize: 1000000,
    coinLotSize: 1000000000,
    pcName: "USDC",
    coinName: "TONK",
  },
  {
    marketPda: "DFv44oksLKaXKv8VpgYvuRf2QEdT9feKU7gwLMn1xfsK",
    coinMint: "hAG8BV8zf5Q9rByShj8RBRefjrkC5tZPgAwLqJWNU5Z",
    pcMint: "AfJmPcmHtU8AW2V7hSJxXo48sc7oLDhuunrFvxnmqBCz",
    pcName: "USDC",
    pcLotSize: 1000000,
    coinLotSize: 1000000000,
    coinName: "BONK",
  },
];
