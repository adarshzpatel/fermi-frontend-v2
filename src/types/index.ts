import { FermiDex } from "@/solana/idl"
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

export type Order = {
  price:string ,
  qty:string
  orderId:string 
  owner:PublicKey,
  ownerSlot:string
}

export type Side = "Ask" | "Bid"

export type Balances = {
  nativeCoinFree:string,
  nativeCoinTotal:string,
  nativePcFree:string,
  nativePcTotal:string,
}

export type EventQueueItem = {
  price:number ,
  owner:string,
  ownerSlot:string 
  orderId:string ,
  nativeQtyReleased:string 
  nativeQtyPaid:string
}

export type OpenOrdersItem = {
  price:string 
  orderId:string,
  type: Side
  qty:string,
  owner:string,
  ownerSlot:string
}

export type Orderbook = {
  asks:Order[],
  bids:Order[]
}

export type OpenOrdersType = OpenOrdersItem[]
export type EventQueueType = EventQueueItem[]
