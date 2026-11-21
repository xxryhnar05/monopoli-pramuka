"use client";
// Konten yang bisa diatur admin: soal, kartu, harga properti, hadiah.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BOARD } from "@/data/board";
import { CHANCE_CARDS, FUND_CARDS } from "@/data/cards";
import { DEFAULT_QUESTIONS } from "@/data/questions";
import type { GameContent } from "@/engine";
import type { DurationKey, GameConfig, GameMode, Question, Rewards, TaxConfig } from "@/engine/types";

export interface Economy {
  startingCoins: number;
  startBonus: number;
  campFee: number;
  tax: TaxConfig;
}

export interface CardOverride {
  enabled?: boolean;
  value?: number;
}

interface ContentState {
  questions: Question[];
  cardOverrides: Record<string, CardOverride>;
  priceOverrides: Record<number, number>;
  rewards: Rewards;
  economy: Economy;
  setEconomy: (e: Economy) => void;
  upsertQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;
  resetQuestions: () => void;
  setCardOverride: (id: string, o: CardOverride) => void;
  setPrice: (tileId: number, price: number | null) => void;
  setRewards: (r: Rewards) => void;
  resetAll: () => void;
}

export const DEFAULT_REWARDS: Rewards = { mudah: 100_000, sedang: 150_000, sulit: 250_000, wrongPenalty: 50_000 };

/** Ekonomi bawaan: saldo kecil + pajak agar permainan cepat selesai. */
export const DEFAULT_ECONOMY: Economy = {
  startingCoins: 3_000_000,
  startBonus: 150_000,
  campFee: 50_000,
  tax: { purchasePct: 10, rentPct: 10, landPerTile: 10_000, landPerBuilding: 25_000 },
};

/** Susun konfigurasi permainan baru dari pilihan setup + pengaturan admin. */
export function makeConfig(
  choice: { mode: GameMode; duration: DurationKey; requireFullGroup: boolean },
  content: { rewards: Rewards; economy: Economy },
): GameConfig {
  return { ...choice, ...content.economy, rewards: content.rewards };
}

export const useContent = create<ContentState>()(
  persist(
    (set) => ({
      questions: DEFAULT_QUESTIONS,
      cardOverrides: {},
      priceOverrides: {},
      rewards: DEFAULT_REWARDS,
      economy: DEFAULT_ECONOMY,
      setEconomy: (economy) => set({ economy }),
      upsertQuestion: (q) =>
        set((s) => {
          const exists = s.questions.some((x) => x.id === q.id);
          return { questions: exists ? s.questions.map((x) => (x.id === q.id ? q : x)) : [...s.questions, q] };
        }),
      deleteQuestion: (id) => set((s) => ({ questions: s.questions.filter((q) => q.id !== id) })),
      resetQuestions: () => set({ questions: DEFAULT_QUESTIONS }),
      setCardOverride: (id, o) =>
        set((s) => ({ cardOverrides: { ...s.cardOverrides, [id]: { ...s.cardOverrides[id], ...o } } })),
      setPrice: (tileId, price) =>
        set((s) => {
          const next = { ...s.priceOverrides };
          if (price === null) delete next[tileId];
          else next[tileId] = price;
          return { priceOverrides: next };
        }),
      setRewards: (rewards) => set({ rewards }),
      resetAll: () =>
        set({ questions: DEFAULT_QUESTIONS, cardOverrides: {}, priceOverrides: {}, rewards: DEFAULT_REWARDS, economy: DEFAULT_ECONOMY }),
    }),
    {
      name: "mn-content",
      version: 3,
      // v1 memakai satuan "koin": simpan soal buatan admin, reset nilai uang ke rupiah.
      migrate: (old, version) => {
        const o = (old ?? {}) as Partial<ContentState>;
        if (version < 2) return { questions: o.questions ?? DEFAULT_QUESTIONS } as unknown as ContentState;
        // v3: saldo awal naik ke Rp3.000.000 agar pemain bisa menguasai satu pulau.
        if (version < 3 && o.economy && o.economy.startingCoins <= 1_000_000)
          return { ...o, economy: { ...o.economy, startingCoins: DEFAULT_ECONOMY.startingCoins } } as ContentState;
        return o as ContentState;
      },
    },
  ),
);

/** Gabungkan data bawaan dengan pengaturan admin menjadi konten permainan. */
export function buildContent(state: Pick<ContentState, "questions" | "cardOverrides" | "priceOverrides">): GameContent {
  const tiles = BOARD.map((t) =>
    state.priceOverrides[t.id] && t.price !== undefined ? { ...t, price: state.priceOverrides[t.id] } : t,
  );
  const apply = (c: (typeof CHANCE_CARDS)[number]) => {
    const o = state.cardOverrides[c.id];
    return o ? { ...c, enabled: o.enabled ?? c.enabled, value: o.value ?? c.value } : c;
  };
  return {
    tiles,
    chanceCards: CHANCE_CARDS.map(apply),
    fundCards: FUND_CARDS.map(apply),
    questions: state.questions.length ? state.questions : DEFAULT_QUESTIONS,
  };
}
