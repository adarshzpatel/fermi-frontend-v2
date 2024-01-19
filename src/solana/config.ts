

export const RPC_URL = { devnet: "https://devnet.helius-rpc.com/?api-key=5163c3d1-8082-442e-8a15-c27bff3cfabb" };
export const PROGRAM_ID = "E6cNbXn2BNoMjXUg7biSTYhmTuyJWQtAnRX1fVPa7y5v";


export type Market = {
  name:string
  marketPda: string;
  quoteTokenName: string;
  baseTokenName: string;
  
};


export const MARKETS: Market[] = [
  {
    name:'TONK/USDC',
    marketPda: "ikFtY4ZDuitei7tsjQf1B8m47XEe2F4XjVgBLieifQv",
    quoteTokenName: "USDC",
    baseTokenName: "BONK",
  },
  {
    name:'SUNK/USDC',
    marketPda: "Hzzd2TJijM16r2yK8ktnXWF3NDJvJyGSixKV4ykLgV1Z",
    quoteTokenName: "USDC",
    baseTokenName: "BONK",
  },
];
