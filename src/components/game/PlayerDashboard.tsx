"use client";
import { rpShort } from "@/engine/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, Gem, Layers, ShieldCheck, Skull, Tent, TrendingUp, Building2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Coins } from "@/components/ui/Coin";
import { netWorth, ownedTiles } from "@/engine/selectors";
import type { GameState, Player } from "@/engine/types";

function CoinDelta({ player }: { player: Player }) {
  const prev = useRef(player.coins);
  const [bursts, setBursts] = useState<{ id: number; v: number }[]>([]);
  useEffect(() => {
    const d = player.coins - prev.current;
    prev.current = player.coins;
    if (d === 0) return;
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, v: d }]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1400);
    return () => clearTimeout(t);
  }, [player.coins]);
  return (
    <span className="pointer-events-none absolute right-3 top-2">
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.span
            key={b.id}
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: -18, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className={`absolute right-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-extrabold shadow ${
              b.v > 0 ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {b.v > 0 ? "+" : "−"}
            {rpShort(Math.abs(b.v))}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

export function StatusBadges({ p }: { p: Player }) {
  const badges: { Icon: typeof Ban; label: string; cls: string }[] = [];
  if (p.bankrupt) badges.push({ Icon: Skull, label: "Bangkrut", cls: "bg-ink text-white" });
  if (p.inCamp) badges.push({ Icon: Tent, label: "Pos Kemah", cls: "bg-[#9BBF86] text-deep" });
  if (p.skipTurns) badges.push({ Icon: Ban, label: `Skip ${p.skipTurns}`, cls: "bg-red-100 text-red-700" });
  if (p.diceLimit) badges.push({ Icon: Ban, label: "Blokade", cls: "bg-red-100 text-red-700" });
  if (p.theftShield) badges.push({ Icon: ShieldCheck, label: `Kebal ${p.theftShield}`, cls: "bg-sky/20 text-[#1E4E7A]" });
  if (p.assetShield) badges.push({ Icon: ShieldCheck, label: `Aset aman ${p.assetShield}`, cls: "bg-sky/20 text-[#1E4E7A]" });
  if (p.investBonus) badges.push({ Icon: TrendingUp, label: `Investasi ${p.investBonus}`, cls: "bg-gold/25 text-wood" });
  if (p.hand.length) badges.push({ Icon: Layers, label: `${p.hand.length} kartu`, cls: "bg-[#EBDDFB] text-[#4A2A73]" });
  if (!badges.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {badges.map(({ Icon, label, cls }) => (
        <span key={label} className={`chip !px-2 !py-0.5 text-[10px] ${cls}`}>
          <Icon size={11} /> {label}
        </span>
      ))}
    </div>
  );
}

export default function PlayerDashboard({ game, onOpenPlayer }: { game: GameState; onOpenPlayer: (id: string) => void }) {
  return (
    <div className="space-y-2.5">
      {game.players.map((p, i) => {
        const active = i === game.current && game.phase !== "gameover";
        const props = ownedTiles(game, p.id);
        const buildings = props.reduce((n, t) => n + game.props[t.id].level, 0);
        return (
          <motion.button
            layout
            key={p.id}
            onClick={() => onOpenPlayer(p.id)}
            className={`relative w-full overflow-visible rounded-2xl p-3 text-left transition ${
              p.bankrupt ? "bg-white/40 opacity-60 grayscale" : active ? "bg-white shadow-glow" : "bg-white/75 shadow-soft hover:bg-white"
            }`}
          >
            <CoinDelta player={p} />
            <div className="flex items-center gap-3">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: `${p.color}2a`, boxShadow: `inset 0 0 0 2px ${p.color}` }}>
                {p.avatar}
                {active && <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-gold" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
                  <span className="truncate font-display font-extrabold text-forest">{p.name}</span>
                </span>
                {p.team && <span className="block truncate text-[11px] text-ink/50">{p.team}</span>}
                <Coins value={p.coins} className="text-sm text-wood" size={14} />
              </span>
              <span className="text-right text-[10px] font-semibold leading-tight text-ink/55">
                <span className="flex items-center justify-end gap-1"><Gem size={11} /> {props.length} wilayah</span>
                <span className="flex items-center justify-end gap-1"><Building2 size={11} /> {buildings} bangunan</span>
                <span className="block">Kekayaan {rpShort(netWorth(game, p.id))}</span>
              </span>
            </div>
            <StatusBadges p={p} />
          </motion.button>
        );
      })}
    </div>
  );
}
