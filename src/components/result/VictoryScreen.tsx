"use client";
import { rp } from "@/engine/utils";
import { motion } from "framer-motion";
import { BookOpenCheck, Building2, Crown, House, Layers, Map, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Coins } from "@/components/ui/Coin";
import { useHydrated } from "@/hooks/useHydrated";
import { recordResults } from "@/lib/leaderboard";
import { play } from "@/lib/sound";
import { buildContent, makeConfig, useContent } from "@/store/contentStore";
import { useGame } from "@/store/gameStore";
import Confetti from "./Confetti";

const MEDAL = [
  { label: "Emas", color: "from-[#F7D774] to-[#C9962C]", h: "h-36" },
  { label: "Perak", color: "from-[#E8EEF2] to-[#9AA8B3]", h: "h-28" },
  { label: "Perunggu", color: "from-[#E8B48A] to-[#A0643A]", h: "h-24" },
];

const REASON = {
  lastStanding: "Semua lawan bangkrut",
  timeUp: "Waktu permainan habis — kekayaan tertinggi menang",
  manual: "Permainan diakhiri — kekayaan tertinggi menang",
};

export default function VictoryScreen() {
  const hydrated = useHydrated();
  const router = useRouter();
  const game = useGame((s) => s.game);
  const recordedId = useGame((s) => s.recordedGameId);
  const markRecorded = useGame((s) => s.markRecorded);
  const lastSetup = useGame((s) => s.lastSetup);
  const newGame = useGame((s) => s.newGame);
  const content = useContent();
  const [online, setOnline] = useState<string | null>(null);
  const played = useRef(false);

  const results = game?.phase === "gameover" ? game.results : null;

  useEffect(() => {
    if (!game || !results) return;
    if (!played.current) {
      played.current = true;
      play("victory");
    }
    if (recordedId === game.id) return;
    markRecorded(game.id);
    recordResults(results).then((r) => {
      if (r.online) setOnline("Hasil juga tersimpan di leaderboard online.");
      else if (r.error) setOnline(`Leaderboard online gagal: ${r.error}`);
    });
  }, [game, results, recordedId, markRecorded]);

  if (!hydrated) return <div className="paper min-h-dvh" />;
  if (!game || !results)
    return (
      <div className="paper grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-forest">Belum ada hasil permainan</h1>
          <Link href={game ? "/play" : "/setup"} className="btn-gold mt-6">
            {game ? "Lanjutkan Permainan" : "Mulai Petualangan"}
          </Link>
        </div>
      </div>
    );

  const winner = results[0];
  const podium = [results[1], results[0], results[2]].filter(Boolean);

  function playAgain() {
    if (!lastSetup) return router.push("/setup");
    newGame(
      lastSetup.players,
      makeConfig({ ...lastSetup.config, requireFullGroup: lastSetup.config.requireFullGroup ?? true }, content),
      buildContent(content),
    );
    router.push("/play");
  }

  return (
    <div className="topo relative min-h-dvh overflow-hidden bg-gradient-to-b from-deep via-forest to-deep pb-16 text-cream">
      <Confetti />
      <div className="relative mx-auto max-w-5xl px-4 pt-12 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="chip bg-gold/20 uppercase tracking-widest text-gold-light">{REASON[game.endReason ?? "manual"]}</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">Penguasa Nusantara!</h1>
        </motion.div>

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mx-auto mt-8 max-w-md rounded-[2rem] bg-cream p-6 text-center text-ink shadow-card"
        >
          <Crown className="mx-auto text-gold" size={44} />
          <div className="mx-auto mt-2 grid h-24 w-24 place-items-center rounded-3xl text-6xl" style={{ background: `${winner.color}33`, boxShadow: `inset 0 0 0 4px ${winner.color}` }}>
            {winner.avatar}
          </div>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-forest">{winner.name}</h2>
          {winner.team && <p className="text-sm text-ink/60">{winner.team}</p>}
          <p className="mt-1 text-sm text-ink/60">Total kekayaan</p>
          <Coins value={winner.netWorth} size={26} className="font-display text-3xl text-wood" />
          <div className="mt-5 grid grid-cols-2 gap-2 text-left text-sm sm:grid-cols-4">
            {[
              [Map, winner.properties, "Wilayah"],
              [Building2, winner.buildings, "Bangunan"],
              [Layers, winner.cardsUsed, "Kartu dipakai"],
              [BookOpenCheck, winner.quizCorrect, "Kuis benar"],
            ].map(([I, v, l]) => {
              const Icon = I as typeof Map;
              return (
                <div key={l as string} className="rounded-xl bg-white p-2 text-center shadow-soft">
                  <Icon size={16} className="mx-auto text-forest" />
                  <div className="font-display text-xl font-extrabold text-forest">{v as number}</div>
                  <div className="text-[10px] font-semibold text-ink/60">{l as string}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* podium */}
        <div className="mx-auto mt-12 flex max-w-lg items-end justify-center gap-3">
          {podium.map((r) => {
            const m = MEDAL[r.rank - 1];
            return (
              <motion.div key={r.playerId} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 + r.rank * 0.15 }} className="flex-1 text-center">
                <div className="text-3xl">{r.avatar}</div>
                <div className="truncate text-sm font-bold">{r.name}</div>
                <div className={`mt-2 ${m.h} rounded-t-2xl bg-gradient-to-b ${m.color} pt-3 text-deep shadow-card`}>
                  <div className="font-display text-3xl font-extrabold">{r.rank}</div>
                  <div className="text-[11px] font-bold uppercase">Medali {m.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* statistik */}
        <div className="mt-12 overflow-x-auto rounded-3xl bg-cream text-ink shadow-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-forest text-left text-xs uppercase tracking-wider text-gold-light">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Pemain</th>
                <th className="px-4 py-3 text-right">Kekayaan</th>
                <th className="px-4 py-3 text-right">Saldo</th>
                <th className="px-4 py-3 text-right">Wilayah</th>
                <th className="px-4 py-3 text-right">Bangunan</th>
                <th className="px-4 py-3 text-right">Kartu</th>
                <th className="px-4 py-3 text-right">Kuis benar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood/10">
              {results.map((r) => (
                <tr key={r.playerId} className={r.rank === 1 ? "bg-gold/15" : ""}>
                  <td className="px-4 py-3 font-display font-extrabold text-wood">{["🥇", "🥈", "🥉"][r.rank - 1] ?? r.rank}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-bold text-forest">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                      {r.avatar} {r.name}
                      {r.bankrupt && <span className="chip bg-ink/10 !py-0 text-[10px] text-ink/60">bangkrut</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">{rp(r.netWorth)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{rp(r.coins)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.properties}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.buildings}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.cardsUsed}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.quizCorrect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {online && <p className="mt-3 text-center text-xs text-cream/70">{online}</p>}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button className="btn-gold" onClick={playAgain}>
            <RotateCcw size={18} /> Main Lagi
          </button>
          <Link href="/" className="btn-ghost border-cream/25 bg-cream/5 text-cream hover:bg-cream/10">
            <House size={18} /> Kembali ke Beranda
          </Link>
          <Link href="/leaderboard" className="btn-ghost border-cream/25 bg-cream/5 text-cream hover:bg-cream/10">
            <Trophy size={18} /> Lihat Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
