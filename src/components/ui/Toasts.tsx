"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/store/gameStore";

export default function Toasts() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col-reverse items-center gap-2 px-3 lg:bottom-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`max-w-md rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-card ${
              t.tone === "good" ? "bg-forest text-cream" : t.tone === "bad" ? "bg-red-600 text-white" : "bg-white text-forest"
            }`}
            role="status"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
