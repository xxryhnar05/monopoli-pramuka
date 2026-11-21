"use client";
import { Cloud, CloudOff, HardDrive, Play, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { Coins } from "@/components/ui/Coin";
import { fetchOnline, readLocal, sortRows, type LeaderRow } from "@/lib/leaderboard";
import { isSupabaseConfigured } from "@/lib/supabase";

export function LeaderTable({ rows }: { rows: LeaderRow[] }) {
  if (rows.length === 0)
    return (
      <div className="p-12 text-center">
        <Trophy className="mx-auto text-gold" size={44} />
        <p className="mt-3 font-display text-xl font-bold text-forest">Belum ada data</p>
        <p className="text-sm text-ink/60">Selesaikan permainan untuk mengisi leaderboard.</p>
      </div>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-forest text-left text-xs uppercase tracking-wider text-gold-light">
          <tr>
            <th className="px-4 py-3">Peringkat</th>
            <th className="px-4 py-3">Pemain</th>
            <th className="px-4 py-3 text-right">Menang</th>
            <th className="px-4 py-3 text-right">Kekayaan tertinggi</th>
            <th className="px-4 py-3 text-right">Wilayah terbanyak</th>
            <th className="px-4 py-3 text-right">Main</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-wood/10">
          {rows.map((r, i) => (
            <tr key={r.name} className={i < 3 ? "bg-gold/10" : ""}>
              <td className="px-4 py-3 font-display text-lg font-extrabold text-wood">{["🥇", "🥈", "🥉"][i] ?? i + 1}</td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-2 font-bold text-forest">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-forest/10 text-lg">{r.avatar}</span>
                  {r.name}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-display text-lg font-extrabold text-forest">{r.wins}</td>
              <td className="px-4 py-3 text-right">
                <Coins value={r.bestWealth} className="justify-end text-wood" />
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{r.mostTerritories}</td>
              <td className="px-4 py-3 text-right tabular-nums text-ink/60">{r.games}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"lokal" | "online">("lokal");
  const [local, setLocal] = useState<LeaderRow[] | null>(null);
  const [online, setOnline] = useState<{ rows: LeaderRow[]; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setLocal(sortRows(readLocal())), []);
  useEffect(() => {
    if (tab !== "online" || !isSupabaseConfigured || online) return;
    setLoading(true);
    fetchOnline()
      .then((r) => setOnline(r))
      .finally(() => setLoading(false));
  }, [tab, online]);

  return (
    <>
      <Navbar />
      <main className="topo min-h-dvh bg-gradient-to-b from-deep to-forest pb-20 pt-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center text-cream">
            <Trophy className="mx-auto text-gold" size={48} />
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Leaderboard</h1>
            <p className="mt-2 text-cream/70">Peringkat berdasarkan kemenangan, lalu kekayaan tertinggi.</p>
          </div>
          <div className="mx-auto mt-8 flex w-fit gap-1 rounded-2xl bg-cream/10 p-1">
            <button onClick={() => setTab("lokal")} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${tab === "lokal" ? "bg-gold text-deep" : "text-cream"}`}>
              <HardDrive size={16} /> Perangkat ini
            </button>
            <button onClick={() => setTab("online")} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${tab === "online" ? "bg-gold text-deep" : "text-cream"}`}>
              <Cloud size={16} /> Online
            </button>
          </div>
          <div className="mt-6 overflow-hidden rounded-3xl bg-cream shadow-card">
            {tab === "lokal" ? (
              local === null ? (
                <p className="p-8 text-center text-ink/50">Memuat…</p>
              ) : (
                <LeaderTable rows={local} />
              )
            ) : !isSupabaseConfigured ? (
              <div className="p-12 text-center">
                <CloudOff className="mx-auto text-wood" size={40} />
                <p className="mt-3 font-display text-xl font-bold text-forest">Leaderboard online belum aktif</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-ink/60">
                  Backend Supabase belum dikonfigurasi, jadi hanya leaderboard di perangkat ini yang tersedia. Pengelola dapat
                  mengisi variabel lingkungan Supabase untuk mengaktifkannya.
                </p>
              </div>
            ) : loading ? (
              <p className="p-8 text-center text-ink/50">Mengambil data online…</p>
            ) : online?.error ? (
              <p className="p-8 text-center text-red-700">Gagal memuat leaderboard online: {online.error}</p>
            ) : (
              <LeaderTable rows={online?.rows ?? []} />
            )}
          </div>
          <div className="mt-8 text-center">
            <Link href="/setup" className="btn-gold">
              <Play size={18} fill="currentColor" /> Main Sekarang
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
