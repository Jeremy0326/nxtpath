import { create } from 'zustand';

interface Booth {
  id: string;
  number: string;
  equipment?: {
    monitor: boolean;
    power: boolean;
    internet: boolean;
    chairs: number;
  };
}

interface CareerFairStore {
  booths: Booth[];
  updateBooth: (boothId: string, updates: Partial<Booth>) => void;
}

export const useCareerFairStore = create<CareerFairStore>((set) => ({
  booths: [],
  updateBooth: (boothId, updates) =>
    set((state) => ({
      booths: state.booths.map((booth) =>
        booth.id === boothId ? { ...booth, ...updates } : booth
      ),
    })),
}));