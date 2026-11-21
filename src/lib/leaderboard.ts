"use client";
import type { PlayerResult } from "@/engine/types";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export interface LeaderRow {
  name: string;
  avatar: string;
  wins: number;
  games: number;
  bestWealth: number;
  mostTerritories: number;
  updatedAt: number;
}

const KEY = "mn-leaderboard-rp"; // v2: kekayaan dalam rupiah

export function readLocal(): LeaderRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LeaderRow[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: LeaderRow[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    // penyimpanan penuh / diblokir
  }
}

export function sortRows(rows: LeaderRow[]): LeaderRow[] {
  return rows.slice().sort((a, b) => b.wins - a.wins || b.bestWealth - a.bestWealth || b.mostTerritories - a.mostTerritories);
}

/** Catat hasil permainan ke leaderboard lokal (dan online bila Supabase aktif). */
export async function recordResults(results: PlayerResult[]): Promise<{ online: boolean; error?: string }> {
  const rows = readLocal();
  for (const r of results) {
    const key = r.name.trim().toLowerCase();
    const row = rows.find((x) => x.name.trim().toLowerCase() === key);
    const win = r.rank === 1 ? 1 : 0;
    if (row) {
      row.wins += win;
      row.games += 1;
      row.bestWealth = Math.max(row.bestWealth, r.netWorth);
      row.mostTerritories = Math.max(row.mostTerritories, r.properties);
      row.avatar = r.avatar;
      row.updatedAt = Date.now();
    } else {
      rows.push({
        name: r.name.trim(),
        avatar: r.avatar,
        wins: win,
        games: 1,
        bestWealth: r.netWorth,
        mostTerritories: r.properties,
        updatedAt: Date.now(),
      });
    }
  }
  writeLocal(sortRows(rows).slice(0, 200));

  const sb = getSupabase();
  if (!sb) return { online: false };
  const { error } = await sb.from("game_results").insert(
    results.map((r) => ({
      player_name: r.name.trim(),
      avatar: r.avatar,
      is_winner: r.rank === 1,
      net_worth: r.netWorth,
      territories: r.properties,
      buildings: r.buildings,
      quiz_correct: r.quizCorrect,
    })),
  );
  return { online: !error, error: error?.message };
}

export function clearLocal() {
  writeLocal([]);
}

/** Ambil leaderboard online dari view `leaderboard` (lihat supabase/schema.sql). */
export async function fetchOnline(): Promise<{ rows: LeaderRow[]; error?: string } | null> {
  if (!isSupabaseConfigured) return null;
  const sb = getSupabase()!;
  const { data, error } = await sb
    .from("leaderboard")
    .select("player_name, avatar, wins, games, best_wealth, most_territories, last_played")
    .order("wins", { ascending: false })
    .order("best_wealth", { ascending: false })
    .limit(50);
  if (error) return { rows: [], error: error.message };
  return {
    rows: (data ?? []).map((d) => ({
      name: d.player_name as string,
      avatar: (d.avatar as string) ?? "🧭",
      wins: Number(d.wins),
      games: Number(d.games),
      bestWealth: Number(d.best_wealth),
      mostTerritories: Number(d.most_territories),
      updatedAt: new Date(d.last_played as string).getTime(),
    })),
  };
}
