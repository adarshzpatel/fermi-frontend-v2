import { MARKETS } from "@/solana/config";
import { FermiDex } from "@/solana/idl";
import { EventQueueType, MarketType, OpenOrdersType, Order } from "@/types";
import { Program } from "@project-serum/anchor";
import {create} from 'zustand'
// Zustand store to store market data

type ProgramStore = {
  program:Program<FermiDex>
  setProgram: (program: Program<FermiDex>) => void
}

// create program store

type MarketStore = {
  market: MarketType | null 
  setMarket: (market: MarketType) => void
}

// create market store

type OrderbookStore = {
  bids: Order[] | null
  asks: Order[] | null
  setBids: (bids: Order[]) => void
  setAsks: (asks: Order[]) => void
}

// create orderbook store

type OpenOrderAccountStore = {
  tokenBalances: TokenBalances | null
  openOrders: OpenOrdersType | null
  setOpenOrders: (openOrders: OpenOrdersType) => void
  setTokenBalances: (tokenBalances: TokenBalances) => void
}

// create openorderaccount store

type EventQStore = {
  eventQ: EventQueueType | null
  setEventQ: (eventQ: EventQueueType) => void
}

// create eventq store