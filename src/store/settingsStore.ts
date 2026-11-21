"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { configureSound } from "@/lib/sound";

interface SettingsState {
  soundOn: boolean;
  volume: number;
  fastAnimations: boolean;
  setSound: (on: boolean) => void;
  setVolume: (v: number) => void;
  setFastAnimations: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      soundOn: true,
      volume: 0.6,
      fastAnimations: false,
      setSound: (soundOn) =>
        set((s) => {
          configureSound(soundOn, s.volume);
          return { soundOn };
        }),
      setVolume: (volume) =>
        set((s) => {
          configureSound(s.soundOn, volume);
          return { volume };
        }),
      setFastAnimations: (fastAnimations) => set({ fastAnimations }),
    }),
    {
      name: "mn-settings",
      onRehydrateStorage: () => (state) => {
        if (state) configureSound(state.soundOn, state.volume);
      },
    },
  ),
);
