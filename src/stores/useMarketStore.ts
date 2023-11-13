import {create} from 'zustand';
import { MarketType } from '@/types';
import { MARKETS } from '@/solana/config';

type MarketStore = {
  market: MarketType | null;
  setMarket: (market: MarketType) => void;
};

export const useMarketStore = create<MarketStore>((set) => ({
  market: MARKETS[0],
  setMarket: (market: MarketType) => set({ market }),
}));
