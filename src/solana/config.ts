import { MarketType } from "@/types";
import { Keypair } from "@solana/web3.js";

export const FERMI_PROGRAM_ID = "4jde1a6MyoiwLVqB6UH5mBJp3gbpk1wcth8TZJfnf1V9";

export const MARKETS: MarketType[] = [
  {
    marketPda: "41nBFyihNPc3T7RTjY6td8ateuAV1KmHQCgwZkRpyMBS",
    coinMint: "AUdmvCuWTwoT9kviNUzvp3EZiKr528FDcgJvDnijDsZ3",
    pcMint: "6EioKQEuzYAYWjgyCds9uyd7PzAC1XnPSAbZaeYH6knn",
    pcName: "USDC",
    pcLotSize: 1000000,
    coinLotSize: 1000000000,
    coinName: "BONK",
  },
  {
    marketPda: "2hF3rMkVrhc5LMKPwrwjLC7wT4yb3hHWBuxDKCLwWW8y",
    coinMint: "6aHLAL3HdHvf5AKe6V91ozTDhXa8ZCfrpiWXCiSQK15E",
    pcMint: "HdCMLqqYfjTZQ8mQKFjegg49JHsibLkbRmTPzyZCfyFx",
    pcLotSize: 1000000,
    coinLotSize: 1000000000,
    pcName: "USDC",
    coinName: "TONK",
  },
];
