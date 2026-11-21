"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as E from "@/engine";
import type { GameConfig, GameState, PlayerSetupInput } from "@/engine/types";
import type { GameContent } from "@/engine";

export interface Toast {
  id: number;
  text: string;
  tone: "good" | "bad" | "info";
}

interface GameStore {
  game: GameState | null;
  recordedGameId: string | null;
  toasts: Toast[];
  lastSetup: { players: PlayerSetupInput[]; config: Pick<GameConfig, "mode" | "duration" | "requireFullGroup"> } | null;
  newGame: (players: PlayerSetupInput[], config: GameConfig, content: GameContent) => void;
  /** Jalankan aksi engine; jika gagal, tampilkan pesan. Mengembalikan true bila berhasil. */
  act: (fn: (s: GameState) => E.Result) => boolean;
  clearGame: () => void;
  markRecorded: (id: string) => void;
  toast: (text: string, tone?: Toast["tone"]) => void;
  dropToast: (id: number) => void;
}

let toastId = 1;

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,
      recordedGameId: null,
      toasts: [],
      lastSetup: null,
      newGame: (players, config, content) => {
        const game = E.createGame(players, config, content);
        set({
          game,
          lastSetup: { players, config: { mode: config.mode, duration: config.duration, requireFullGroup: config.requireFullGroup } },
        });
      },
      act: (fn) => {
        const g = get().game;
        if (!g) return false;
        const res = fn(g);
        if (res.error) {
          get().toast(res.error, "bad");
          return false;
        }
        if (res.state !== g) set({ game: res.state });
        return true;
      },
      clearGame: () => set({ game: null }),
      markRecorded: (id) => set({ recordedGameId: id }),
      toast: (text, tone = "info") => {
        const id = toastId++;
        set((s) => ({ toasts: [...s.toasts.slice(-3), { id, text, tone }] }));
        setTimeout(() => get().dropToast(id), 3200);
      },
      dropToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "mn-game",
      version: 2, // v2: rupiah & pajak — permainan versi lama tidak dilanjutkan
      migrate: () => ({ game: null, recordedGameId: null, lastSetup: null }) as unknown as GameStore,
      partialize: (s) => ({ game: s.game, recordedGameId: s.recordedGameId, lastSetup: s.lastSetup }),
      // Jika halaman dimuat ulang saat pion bergerak, selesaikan perpindahan.
      onRehydrateStorage: () => (state) => {
        if (state?.game?.phase === "moving") {
          const r = E.finishMove(state.game);
          if (!r.error) setTimeout(() => useGame.setState({ game: r.state }), 0);
        }
      },
    },
  ),
);
