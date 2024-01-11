import { create } from "zustand";

type FermiStoreState = {};

type FermiStoreActions = {};

export const useFermiStore = create<FermiStoreState & FermiStoreActions>(
  (set, get) => ({})
);
