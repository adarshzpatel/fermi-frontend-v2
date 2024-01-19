

export const RPC_URL = { devnet: "https://devnet.helius-rpc.com/?api-key=5163c3d1-8082-442e-8a15-c27bff3cfabb" };
export const PROGRAM_ID = "E6cNbXn2BNoMjXUg7biSTYhmTuyJWQtAnRX1fVPa7y5v";


export type Market = {
  name:string
  marketPda: string;
  quoteTokenName: string;
  baseTokenName: string;
  
};


// Market account: 86qoxwiEFMYrS4D8Me1ezBAi1MvCeJf5AJMXWMQVCjjy
// Bids account: DUU6ePFexYcxqYSGUmk7sj6rySi2K8eTu9GudZRoKd92
// Asks account: AXLdsAUsLALFsaXkvq2AkzyfbsS6NN3u7F4Fu53MBNho
// Event heap account: BoTmSH6jjaFCdDYBStQ24X6tWCQ44DQMaxh6EeyNuoeQ
// Quote mint: FNgLNFiNTXjx2USH5rtbEvJaoZfTkCfw2BrxZMxy15RK
// Base mint: 5DfgCtxTrQmX5yd6eZufaLsW7HTVQd7cmaffHyQ7mENS
// Quote lot size: 1000000
// Base lot size: 1000000000



export const MARKETS: Market[] = [
  {
    name:'TONK/USDC',
    marketPda: "3MwFEfjmksCxWBYM85t1TS51ofs31oa5hgcWBP877Abu",
    quoteTokenName: "USDC",
    baseTokenName: "BONK",
  },
  {
    name:'SUNK/USDC',
    marketPda: "HArwtuQcLpQdK5zA16Q8nBxuKRPvWuU3Bt8dQpxQxXeT",
    quoteTokenName: "USDC",
    baseTokenName: "BONK",
  },
];
