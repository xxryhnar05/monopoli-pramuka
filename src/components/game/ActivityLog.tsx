"use client";
import { motion } from "framer-motion";
import type { GameState } from "@/engine/types";

const TONE = {
  good: "border-l-green-500 bg-green-50/70",
  bad: "border-l-red-400 bg-red-50/70",
  info: "border-l-sky bg-white/70",
  card: "border-l-[#7B4CB0] bg-[#F5EEFD]",
};

export default function ActivityLog({ game, limit = 60 }: { game: GameState; limit?: number }) {
  return (
    <ol className="space-y-1.5" aria-live="polite">
      {game.log.slice(0, limit).map((l) => (
        <motion.li
          key={l.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className={`rounded-lg border-l-4 px-2.5 py-1.5 text-xs leading-snug text-ink/80 ${TONE[l.tone]}`}
        >
          <span className="mr-1 font-bold text-ink/40">P{l.round}</span>
          {l.text}
        </motion.li>
      ))}
    </ol>
  );
}
