import { MarketType } from "@/types"
import { Keypair } from "@solana/web3.js";

export const FERMI_PROGRAM_ID = "4jnBbnBjuJB4Qpv7YzBdqb56wEDgC4cVB6uzUzEGMsiH"

export const MARKETS:MarketType[] = [
  {
    marketPda: "AwaZSJWRWRP2pfvSkVa11ruUKbxYMG9YxgnxGcGk9d54",
    coinMint: "H5mVpxEcusRxiBZK5Rve7ZsaGh8LhseyBCsiLCjQwJHi",
    pcMint: "FqAYNUSFfpRpzLzDaGmQx4sSbpHJhA447cCsHmMjgr65",
    pcName: "USDC",
    pcLotSize: 1000000,
    coinLotSize: 1000000000,
    coinName:"BONK"
  },
  {
    marketPda: "eWhbt7gT884CW3GjcqDatkzutodMhGEBZXx97MfHFhAx",
    coinMint: "5ZpUbHfpnfiJTMRARjGY4eCTm1iY6vzJWnvV2bsQaRiT",
    pcLotSize: 1000000,
    coinLotSize: 1000000000,
    pcMint: "GnJ7JtABVVtcQsDJ8QFNhxafmzEcSxeG8mszhhYXkcpc",
    pcName: "USDC",
    coinName:"TONK"
  },
  {
    marketPda: "eWhbt7gT884CW3GjcqDatkzutodMhGEBZXx97MfHFhAy",
    coinMint: "5ZpUbHfpnfiJTMRARjGY4eCTm1iY6vzJWnvV2bsQaRiT",
    pcLotSize: 1000000,
    coinLotSize: 1000000000,
    pcMint: "GnJ7JtABVVtcQsDJ8QFNhxafmzEcSxeG8mszhhYXkcpc",
    pcName: "USDC",
    coinName:"FUNK"
  }
]
