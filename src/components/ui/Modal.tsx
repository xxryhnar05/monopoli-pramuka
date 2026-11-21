"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  /** label untuk pembaca layar */
  label: string;
  dismissable?: boolean;
  /** tanpa latar kertas (untuk kartu) */
  bare?: boolean;
}

export default function Modal({ open, onClose, children, className = "", label, dismissable = true, bare = false }: Props) {
  useEffect(() => {
    if (!open || !dismissable || !onClose) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose, dismissable]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-deep/60 p-3 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dismissable && onClose?.()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-3xl scrollbar-thin ${bare ? "" : "bg-cream shadow-card"} ${className.includes("max-w-") ? "" : "max-w-lg"} ${className}`}
            initial={{ y: 40, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {dismissable && onClose && (
              <button
                onClick={onClose}
                aria-label="Tutup"
                className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-forest shadow transition hover:bg-white"
              >
                <X size={18} />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
