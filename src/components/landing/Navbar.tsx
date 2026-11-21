"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Play, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/art/Logo";

const LINKS = [
  { href: "/#beranda", label: "Beranda" },
  { href: "/#cara-bermain", label: "Cara Bermain" },
  { href: "/#tentang", label: "Tentang Game" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-deep/90 py-2 shadow-card backdrop-blur-md" : "bg-transparent py-4"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Monopoli Nusantara — beranda">
          <Logo light compact={scrolled} />
        </Link>
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-cream/85 transition hover:bg-cream/10 hover:text-cream"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/setup" className="btn-gold hidden !py-2.5 text-sm sm:inline-flex">
            <Play size={16} fill="currentColor" /> Main Sekarang
          </Link>
          <button
            className="rounded-xl p-2 text-cream md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-deep/95 backdrop-blur md:hidden"
          >
            <ul className="space-y-1 px-4 py-4">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 font-semibold text-cream hover:bg-cream/10"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link href="/setup" onClick={() => setOpen(false)} className="btn-gold w-full">
                  <Play size={16} fill="currentColor" /> Main Sekarang
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
