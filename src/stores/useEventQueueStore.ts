import { create } from "zustand";
import { EventQueueType } from "@/types";

type EventQStore = {
  eventQ: EventQueueType | null;
  setEventQ: (eventQ: EventQueueType) => void;
};

export const useEventQStore = create<EventQStore>((set) => ({
  eventQ: null,
  setEventQ: (eventQ: EventQueueType) => set({ eventQ }),
}));
