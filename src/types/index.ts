import { type FermiDex } from "@/solana/idl"
import { AnchorProvider, Program,Provider } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { Dispatch, SetStateAction } from "react"


export type ProgramContextType = {
  program: Program<FermiDex> | null | undefined ,
  provider: AnchorProvider | null | undefined,
  market:MarketType
  setMarket: Dispatch<SetStateAction<MarketType>>
}

export type MarketType = {
  pcName:string 
  coinName:string
  pcMint:string 
  coinMint:string 
  marketPda:string 
  pcLotSize:number
  coinLotSize:number
}


export type Side = "Ask" | "Bid"

export type Balances = {
  nativeCoinFree:string,
  nativeCoinTotal:string,
  nativePcFree:string,
  nativePcTotal:string,
}

export type EventQueueItem = {
  idx:number
  price:number 
  owner:string
  ownerSlot:string 
  orderId:string 
  eventFlags:number
  nativeQtyReleased:string 
  nativeQtyPaid:string
  orderIdSecond:string
  finalised:string
  timestamp:string
}
export type Order = {
  price:string ,
  qty:string
  orderId:string 
  owner:PublicKey,
  ownerSlot:string
}

export type OpenOrdersItem = {
  price:string 
  orderId:string,
  side: string
  qty:string,
  owner:PublicKey,
  ownerSlot:string
}

export type Orderbook = {
  asks:Order[],
  bids:Order[]
}


export type TokenBalances = {
  nativeCoinFree:string 
  nativeCoinTotal:string
  nativePcFree:string
  nativePcTotal:string
}

export type OpenOrdersType = OpenOrdersItem[]
export type EventQueueType = EventQueueItem[]
