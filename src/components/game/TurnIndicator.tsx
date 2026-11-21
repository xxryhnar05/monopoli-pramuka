"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Coins } from "@/components/ui/Coin";
import type { Player } from "@/engine/types";

export default function TurnIndicator({ player, round }: { player: Player; round: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={player.id + round}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center gap-3 rounded-2xl bg-white/90 py-2 pl-2 pr-4 shadow-soft ring-2"
        style={{ ["--tw-ring-color" as string]: player.color }}
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl text-2xl" style={{ background: `${player.color}30` }}>
          {player.avatar}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-wood">Giliran · Putaran {round}</span>
          <span className="block max-w-[180px] truncate font-display text-lg font-extrabold text-forest">{player.name}</span>
          <Coins value={player.coins} size={13} className="text-xs text-wood" />
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
