import { create } from "zustand";
import { EventQueueType } from "@/types";

type EventQueueStore = {
  eventQ: EventQueueType | null;
  setEventQ: (eventQ: EventQueueType) => void;
};

export const useEventQueueStore = create<EventQueueStore>((set) => ({
  eventQ: null,
  setEventQ: (eventQ: EventQueueType) => set({ eventQ }),
}));
