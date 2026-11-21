"use client";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Dice5, Hammer, Infinity as InfinityIcon, Layers, Play, Smartphone, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/art/Logo";
import { AVATARS, DEFAULT_NAMES, PAWN_COLORS } from "@/data/players";
import type { DurationKey, GameMode, PlayerSetupInput } from "@/engine/types";
import { useHydrated } from "@/hooks/useHydrated";
import { play } from "@/lib/sound";
import { buildContent, makeConfig, useContent } from "@/store/contentStore";
import { rp } from "@/engine/utils";
import { useGame } from "@/store/gameStore";
import PlayerSetup from "./PlayerSetup";
import TutorialModal from "./TutorialModal";

const defaultPlayer = (i: number): PlayerSetupInput => ({
  name: DEFAULT_NAMES[i],
  avatar: AVATARS[i * 2],
  color: PAWN_COLORS[i].value,
});

const DURATIONS: { key: DurationKey; label: string; sub: string; Icon: typeof Zap }[] = [
  { key: "cepat", label: "Cepat", sub: "10 menit", Icon: Zap },
  { key: "normal", label: "Normal", sub: "20 menit", Icon: Clock },
  { key: "bebas", label: "Bebas", sub: "Sampai bangkrut", Icon: InfinityIcon },
];

const MODES: { key: GameMode; label: string; sub: string; Icon: typeof Users }[] = [
  { key: "lokal", label: "Mode Lokal", sub: "Bergantian di satu perangkat", Icon: Smartphone },
  { key: "tim", label: "Mode Tim / Turn-Based", sub: "Tiap pemain punya profil regu sendiri", Icon: Users },
];

export default function GameSetup() {
  const router = useRouter();
  const hydrated = useHydrated();
  const existing = useGame((s) => s.game);
  const newGame = useGame((s) => s.newGame);
  const content = useContent();
  const [count, setCount] = useState(2);
  const [players, setPlayers] = useState<PlayerSetupInput[]>([0, 1, 2, 3].map(defaultPlayer));
  const [mode, setMode] = useState<GameMode>("lokal");
  const [duration, setDuration] = useState<DurationKey>("normal");
  const [requireFullGroup, setRequireFullGroup] = useState(true);
  const [tutorial, setTutorial] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = players.slice(0, count);
  const canResume = hydrated && existing && existing.phase !== "gameover";

  function validate(): string | null {
    const names = active.map((p) => p.name.trim().toLowerCase());
    if (names.some((n) => !n)) return "Semua pemain harus memiliki nama.";
    if (new Set(names).size !== names.length) return "Nama pemain tidak boleh sama.";
    if (new Set(active.map((p) => p.color)).size !== active.length) return "Setiap pemain harus memilih warna pion berbeda.";
    return null;
  }

  function openTutorial() {
    const err = validate();
    setError(err);
    if (err) return;
    play("click");
    setTutorial(true);
  }

  function start() {
    newGame(
      active.map((p) => ({ ...p, team: mode === "tim" ? p.team : undefined })),
      makeConfig({ mode, duration, requireFullGroup }, content),
      buildContent(content),
    );
    play("dice");
    router.push("/play");
  }

  return (
    <div className="paper min-h-dvh">
      <header className="topo bg-gradient-to-r from-deep to-forest">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" aria-label="Kembali ke beranda">
            <Logo light compact />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-cream/80 hover:text-cream">
            <ArrowLeft size={16} /> Beranda
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <span className="chip bg-forest/10 uppercase tracking-widest text-forest">Persiapan Permainan</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-forest sm:text-5xl">Siapkan regumu!</h1>
          <p className="mt-2 text-ink/70">Atur pemain, mode, dan durasi. Lalu bersiaplah menjelajah Nusantara.</p>
        </motion.div>

        {canResume && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-gold/50 bg-gold/15 p-4">
            <p className="text-sm font-semibold text-wood">
              Ada permainan yang belum selesai ({existing!.players.map((p) => p.name).join(", ")}).
            </p>
            <Link href="/play" className="btn-green !py-2 text-sm">
              <Play size={14} /> Lanjutkan
            </Link>
          </div>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <div className="card-paper p-5">
              <span className="label">Jumlah pemain</span>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    aria-pressed={count === n}
                    className={`rounded-2xl py-3 font-display text-2xl font-extrabold transition ${
                      count === n ? "bg-forest text-gold-light shadow-soft" : "bg-white text-forest ring-1 ring-forest/15 hover:ring-forest/40"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-paper p-5">
              <span className="label">Mode permainan</span>
              <div className="space-y-2">
                {MODES.map(({ key, label, sub, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    aria-pressed={mode === key}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      mode === key ? "bg-forest text-cream shadow-soft" : "bg-white ring-1 ring-forest/15 hover:ring-forest/40"
                    }`}
                  >
                    <Icon size={20} className={mode === key ? "text-gold-light" : "text-forest"} />
                    <span>
                      <span className="block font-bold">{label}</span>
                      <span className={`text-xs ${mode === key ? "text-cream/70" : "text-ink/60"}`}>{sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="card-paper p-5">
              <span className="label">Aturan membangun</span>
              <div className="space-y-2">
                {[
                  { v: true, label: "Klasik", sub: "Kuasai semua wilayah satu warna dulu", Icon: Layers },
                  { v: false, label: "Cepat", sub: "Boleh bangun di wilayah mana pun yang dimiliki", Icon: Hammer },
                ].map(({ v, label, sub, Icon }) => (
                  <button
                    key={label}
                    onClick={() => setRequireFullGroup(v)}
                    aria-pressed={requireFullGroup === v}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      requireFullGroup === v ? "bg-forest text-cream shadow-soft" : "bg-white ring-1 ring-forest/15 hover:ring-forest/40"
                    }`}
                  >
                    <Icon size={20} className={requireFullGroup === v ? "text-gold-light" : "text-forest"} />
                    <span>
                      <span className="block font-bold">{label}</span>
                      <span className={`text-xs ${requireFullGroup === v ? "text-cream/70" : "text-ink/60"}`}>{sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="card-paper p-5">
              <span className="label">Durasi permainan</span>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map(({ key, label, sub, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setDuration(key)}
                    aria-pressed={duration === key}
                    className={`rounded-2xl p-3 text-center transition ${
                      duration === key ? "bg-gold text-deep shadow-soft" : "bg-white ring-1 ring-forest/15 hover:ring-forest/40"
                    }`}
                  >
                    <Icon size={18} className="mx-auto" />
                    <span className="mt-1 block text-sm font-extrabold">{label}</span>
                    <span className="block text-[10px] leading-tight opacity-70">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="grid gap-4 md:grid-cols-2">
              {active.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <PlayerSetup
                    index={i}
                    value={p}
                    showTeam={mode === "tim"}
                    takenColors={active.map((x) => x.color)}
                    onChange={(v) => setPlayers((ps) => ps.map((x, k) => (k === i ? v : x)))}
                  />
                </motion.div>
              ))}
            </div>
            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <span className="text-sm text-ink/60">Saldo awal {rp(content.economy.startingCoins)} · Pemain pertama diundi acak</span>
              <button className="btn-gold text-lg" onClick={openTutorial}>
                <Dice5 size={20} /> Mulai Permainan
              </button>
            </div>
          </div>
        </section>
      </main>
      <TutorialModal open={tutorial} onClose={() => setTutorial(false)} onStart={start} />
    </div>
  );
}
