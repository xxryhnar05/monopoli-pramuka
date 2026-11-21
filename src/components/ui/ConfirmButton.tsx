"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/** Tombol dua langkah: klik pertama meminta konfirmasi. */
export default function ConfirmButton({
  children,
  confirmText,
  onConfirm,
  disabled,
  className = "",
  title,
}: {
  children: React.ReactNode;
  confirmText: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!asking) return;
    const t = setTimeout(() => setAsking(false), 4000);
    return () => clearTimeout(t);
  }, [asking]);
  return (
    <AnimatePresence mode="wait" initial={false}>
      {asking ? (
        <motion.span key="ask" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex gap-1">
          <button
            className="rounded-lg bg-forest px-2.5 py-1.5 text-xs font-bold text-cream hover:brightness-110"
            onClick={() => {
              setAsking(false);
              onConfirm();
            }}
          >
            {confirmText}
          </button>
          <button className="rounded-lg bg-white px-2 py-1.5 text-xs font-bold text-ink/70 ring-1 ring-ink/10" onClick={() => setAsking(false)}>
            Batal
          </button>
        </motion.span>
      ) : (
        <motion.button
          key="btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          disabled={disabled}
          title={title}
          className={className}
          onClick={() => setAsking(true)}
        >
          {children}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
