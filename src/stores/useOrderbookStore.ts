import {create} from 'zustand';
import { Order } from '@/types';

type OrderbookStore = {
  bids: Order[] | null;
  asks: Order[] | null;
  setBids: (bids: Order[]) => void;
  setAsks: (asks: Order[]) => void;
};

export const useOrderbookStore = create<OrderbookStore>((set) => ({
  bids: null,
  asks: null,
  setBids: (bids: Order[]) => set({ bids }),
  setAsks: (asks: Order[]) => set({ asks }),
}));
