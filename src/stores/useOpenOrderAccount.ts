import {create} from 'zustand';
import { TokenBalances, OpenOrdersType } from '@/types';

type OpenOrderAccountStore = {
  tokenBalances: TokenBalances | null;
  openOrders: OpenOrdersType | null;
  setTokenBalances: (tokenBalances: TokenBalances) => void;
  setOpenOrders: (openOrders: OpenOrdersType) => void;
};

export const useOpenOrderAccountStore = create<OpenOrderAccountStore>((set) => ({
  tokenBalances: null,
  openOrders: null,
  setTokenBalances: (tokenBalances: TokenBalances) => set({ tokenBalances }),
  setOpenOrders: (openOrders: OpenOrdersType) => set({ openOrders }),
}));
