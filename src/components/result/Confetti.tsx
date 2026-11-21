"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#D6A64F", "#ECC97F", "#174D36", "#5C9BC7", "#C8423B", "#F4EBD8", "#7B4CB0"];

export default function Confetti({ count = 70 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.8,
        dur: 2.8 + Math.random() * 2.2,
        rot: Math.random() * 720 - 360,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.6,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 block"
          style={{ left: `${p.left}%`, width: p.size, height: p.round ? p.size : p.size * 0.45, background: p.color, borderRadius: p.round ? "999px" : 2 }}
          initial={{ y: -40, rotate: 0, opacity: 1 }}
          animate={{ y: "105vh", rotate: p.rot, x: [0, 30, -20, 10], opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: 2, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
