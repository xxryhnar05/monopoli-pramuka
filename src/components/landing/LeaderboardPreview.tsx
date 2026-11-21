"use client";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Coins } from "@/components/ui/Coin";
import { readLocal, sortRows, type LeaderRow } from "@/lib/leaderboard";
import { SectionHead } from "./DestinationSection";

export default function LeaderboardPreview() {
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  useEffect(() => setRows(sortRows(readLocal()).slice(0, 5)), []);
  const medal = ["🥇", "🥈", "🥉"];
  return (
    <section id="leaderboard" className="topo bg-deep py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHead light eyebrow="Leaderboard" title="Pramuka terhebat di perangkat ini" />
        <div className="mt-10 overflow-hidden rounded-3xl bg-cream shadow-card">
          {rows === null ? (
            <div className="p-8 text-center text-ink/50">Memuat…</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center">
              <Trophy className="mx-auto text-gold" size={40} />
              <p className="mt-3 font-display text-lg font-bold text-forest">Belum ada juara</p>
              <p className="text-sm text-ink/60">Selesaikan satu permainan untuk tampil di sini.</p>
            </div>
          ) : (
            <ul className="divide-y divide-wood/10">
              {rows.map((r, i) => (
                <li key={r.name} className="flex items-center gap-4 px-5 py-4">
                  <span className="w-8 text-center font-display text-xl font-extrabold text-wood">{medal[i] ?? i + 1}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-forest/10 text-xl">{r.avatar}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-forest">{r.name}</span>
                    <span className="text-xs text-ink/60">{r.wins} menang · {r.games} main</span>
                  </span>
                  <Coins value={r.bestWealth} className="text-wood" />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6 text-center">
          <Link href="/leaderboard" className="btn-gold">
            <Trophy size={18} /> Lihat Leaderboard Lengkap
          </Link>
        </div>
      </div>
    </section>
  );
}
