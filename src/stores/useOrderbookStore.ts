import {create} from 'zustand';
import { Order } from '@/types';

type OrderbookStore = {
  bids: Order[];
  asks: Order[];
  setBids: (bids: Order[]) => void;
  setAsks: (asks: Order[]) => void;
};

export const useOrderbookStore = create<OrderbookStore>((set) => ({
  bids: [],
  asks: [],
  setBids: (bids: Order[]) => set({ bids }),
  setAsks: (asks: Order[]) => set({ asks }),
}));
