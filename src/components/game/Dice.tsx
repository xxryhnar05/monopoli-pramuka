"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Face({ value, size }: { value: number; size: number }) {
  return (
    <div
      className="grid grid-cols-3 grid-rows-3 rounded-[22%] bg-gradient-to-br from-white to-cream p-[14%] shadow-[inset_0_-4px_0_rgba(128,85,54,0.25),0_6px_14px_-4px_rgba(16,54,41,0.5)] ring-1 ring-wood/20"
      style={{ width: size, height: size }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="grid place-items-center">
          {PIPS[value]?.includes(i) && <span className="block h-[70%] w-[70%] rounded-full bg-deep" />}
        </span>
      ))}
    </div>
  );
}

export default function Dice({ values, rolling, size = 52 }: { values: number[]; rolling: boolean; size?: number }) {
  const [shown, setShown] = useState(values);
  useEffect(() => {
    if (!rolling) {
      setShown(values);
      return;
    }
    const t = setInterval(() => setShown(values.map(() => 1 + Math.floor(Math.random() * 6))), 70);
    return () => clearInterval(t);
  }, [rolling, values]);

  return (
    <div className="flex items-center gap-3" aria-live="polite" aria-label={`Dadu: ${values.join(" dan ")}`}>
      {shown.map((v, i) => (
        <motion.div
          key={i}
          animate={rolling ? { rotate: [0, 120, 240, 360], y: [0, -14, 0, -6, 0] } : { rotate: 0, y: 0 }}
          transition={rolling ? { duration: 0.45, repeat: Infinity, ease: "linear", delay: i * 0.05 } : { type: "spring" }}
        >
          <Face value={v} size={size} />
        </motion.div>
      ))}
    </div>
  );
}
