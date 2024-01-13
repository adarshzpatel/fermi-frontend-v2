export const FERMI_PROGRAM_ID = "3Ek56WB263s9WH7bhGtjpNkFk8V2UDXmvsKxDJ9RzmGR";

export const RPC_URL = { devnet: "https://api.devnet.solana.com" };
export const PROGRAM_ID = "E6cNbXn2BNoMjXUg7biSTYhmTuyJWQtAnRX1fVPa7y5v";
export type Market = {
  name:string 
  marketPda: string;
  bidsPda: string;
  asksPda: string;
  eventHeapPda: string;
  quoteMintPda: string;
  baseMintPda: string;
  quoteTokenName: string;
  baseTokenName: string;
  quoteLotSize?: number;
  baseLotSize?: number;
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
    name:"BONK/USDC",
    marketPda: "86qoxwiEFMYrS4D8Me1ezBAi1MvCeJf5AJMXWMQVCjjy",
    asksPda: "AXLdsAUsLALFsaXkvq2AkzyfbsS6NN3u7F4Fu53MBNho",
    bidsPda: "DUU6ePFexYcxqYSGUmk7sj6rySi2K8eTu9GudZRoKd92",
    eventHeapPda: "BoTmSH6jjaFCdDYBStQ24X6tWCQ44DQMaxh6EeyNuoeQ" ,
    quoteMintPda: "FNgLNFiNTXjx2USH5rtbEvJaoZfTkCfw2BrxZMxy15RK",
    baseMintPda: "5DfgCtxTrQmX5yd6eZufaLsW7HTVQd7cmaffHyQ7mENS",
    quoteTokenName: "USDC",
    baseTokenName: "BONK",
    quoteLotSize: 1000000,
    baseLotSize: 1000000000,
  },
];
