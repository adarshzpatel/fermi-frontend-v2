import {create} from 'zustand';
import { MarketType } from '@/types';

type MarketStore = {
  market: MarketType | null;
  setMarket: (market: MarketType) => void;
};

export const useMarketStore = create<MarketStore>((set) => ({
  market: null,
  setMarket: (market: MarketType) => set({ market }),
}));
