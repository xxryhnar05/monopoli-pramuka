"use client";
import { Clock, LogOut, Settings, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/art/Logo";
import type { GameState } from "@/engine/types";
import { useSettings } from "@/store/settingsStore";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function TopBar({ game, now, onSettings }: { game: GameState; now: number; onSettings: () => void }) {
  const soundOn = useSettings((s) => s.soundOn);
  const setSound = useSettings((s) => s.setSound);
  const remaining = game.endsAt ? game.endsAt - now : null;
  const elapsed = now - game.startedAt;
  return (
    <header className="topo sticky top-0 z-30 bg-gradient-to-r from-deep to-forest text-cream shadow-card">
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-2 sm:gap-4 sm:px-5">
        <Link href="/" aria-label="Beranda" className="shrink-0">
          <Logo light compact />
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <span className="chip hidden bg-cream/10 text-cream sm:inline-flex">Putaran {game.round}</span>
          <span
            className={`chip font-mono text-sm tabular-nums ${remaining !== null && remaining < 60_000 ? "animate-pulse bg-red-500 text-white" : "bg-gold text-deep"}`}
            title={remaining !== null ? "Sisa waktu" : "Waktu berjalan (mode bebas)"}
          >
            <Clock size={13} /> {remaining !== null ? fmt(remaining) : fmt(elapsed)}
          </span>
          <button
            onClick={() => setSound(!soundOn)}
            className="rounded-xl p-1.5 transition hover:bg-cream/10 sm:p-2"
            aria-label={soundOn ? "Matikan suara" : "Nyalakan suara"}
          >
            {soundOn ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
          <button onClick={onSettings} className="rounded-xl p-1.5 transition hover:bg-cream/10 sm:p-2" aria-label="Pengaturan">
            <Settings size={19} />
          </button>
          <Link href="/" className="rounded-xl p-1.5 transition hover:bg-cream/10 sm:p-2" aria-label="Keluar ke beranda (progres tersimpan)" title="Keluar — progres tersimpan">
            <LogOut size={19} />
          </Link>
        </div>
      </div>
    </header>
  );
}
