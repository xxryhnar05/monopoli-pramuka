"use client";
import { motion } from "framer-motion";
import type { Player } from "@/engine/types";

export default function PlayerToken({
  player,
  x,
  y,
  active,
  fast,
}: {
  player: Player;
  x: number;
  y: number;
  active: boolean;
  fast: boolean;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute z-20"
      initial={false}
      animate={{ left: x - 15, top: y - 15 }}
      transition={{ type: "spring", stiffness: fast ? 700 : 420, damping: fast ? 40 : 26 }}
      style={{ width: 30, height: 30 }}
      aria-hidden
    >
      <motion.div
        animate={active ? { y: [0, -5, 0] } : { y: 0 }}
        transition={active ? { duration: 1, repeat: Infinity } : undefined}
        className={`grid h-full w-full place-items-center rounded-full border-[3px] border-white text-base shadow-[0_6px_10px_-2px_rgba(0,0,0,0.45)] ${
          active ? "ring-4 ring-gold/70" : ""
        }`}
        style={{ background: player.color }}
      >
        <span className="drop-shadow">{player.avatar}</span>
      </motion.div>
    </motion.div>
  );
}
