import {create} from 'zustand';
import { TokenBalances, OpenOrdersType } from '@/types';

type OpenOrderAccountStore = {
  tokenBalances: TokenBalances | null;
  openOrders: OpenOrdersType;
  setTokenBalances: (tokenBalances: TokenBalances) => void;
  setOpenOrders: (openOrders: OpenOrdersType) => void;
};

export const useOpenOrderAccountStore = create<OpenOrderAccountStore>((set) => ({
  tokenBalances: null,
  openOrders: [],
  setTokenBalances: (tokenBalances: TokenBalances) => set({ tokenBalances }),
  setOpenOrders: (openOrders: OpenOrdersType) => set({ openOrders }),
}));
