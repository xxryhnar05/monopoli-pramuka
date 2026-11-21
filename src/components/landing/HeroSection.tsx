"use client";
import { motion } from "framer-motion";
import { BookOpen, Compass, Flag, Flame, Mountain, Play, Tent, TreePine, Waves } from "lucide-react";
import Link from "next/link";
import IndonesiaMap from "@/components/art/IndonesiaMap";
import { GROUPS } from "@/data/board";

const FLOATERS = [
  { Icon: Tent, cls: "left-[4%] top-[18%]", delay: 0 },
  { Icon: Compass, cls: "right-[6%] top-[12%]", delay: 1.2 },
  { Icon: Flame, cls: "left-[46%] bottom-[8%]", delay: 0.6 },
  { Icon: Flag, cls: "right-[3%] bottom-[22%]", delay: 2 },
  { Icon: Mountain, cls: "left-[40%] top-[14%]", delay: 1.6 },
];

export default function HeroSection() {
  const strip = Object.values(GROUPS).map((g) => g.color);
  return (
    <section id="beranda" className="topo relative overflow-hidden bg-gradient-to-br from-deep via-forest to-deep pb-20 pt-28 text-cream sm:pt-32">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-sky/15 blur-3xl" />
      {FLOATERS.map(({ Icon, cls, delay }, i) => (
        <motion.div
          key={i}
          aria-hidden
          className={`absolute hidden rounded-2xl border border-cream/15 bg-cream/5 p-3 text-gold-light backdrop-blur lg:block ${cls}`}
          animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, delay, ease: "easeInOut" }}
        >
          <Icon size={22} />
        </motion.div>
      ))}

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="chip mb-5 border border-gold/40 bg-gold/15 text-gold-light"
          >
            <TreePine size={14} /> The Indonesian Scout Adventure
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
          >
            JELAJAHI NUSANTARA,
            <br />
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-light bg-clip-text text-transparent">
              KUASAI DUNIA!
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg"
          >
            Bangun kerajaan wisata Indonesia, kuasai berbagai wilayah Nusantara, kumpulkan kekayaan, dan buktikan bahwa
            kamu adalah Pramuka paling hebat!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/setup" className="btn-gold text-lg">
              <Play size={18} fill="currentColor" /> Mulai Petualangan
            </Link>
            <Link href="/#cara-bermain" className="btn-ghost border-cream/25 bg-cream/5 text-cream hover:border-cream/60 hover:bg-cream/10">
              <BookOpen size={18} /> Pelajari Cara Bermain
            </Link>
          </motion.div>
          <div className="mt-10 flex gap-8 text-sm text-cream/70">
            {[
              ["40", "Kotak papan"],
              ["22", "Destinasi"],
              ["40", "Kartu Kesempatan"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-3xl font-extrabold text-gold-light">{n}</div>
                {l}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 90 }}
          className="relative"
        >
          {/* mini papan monopoly sebagai bingkai */}
          <div className="relative rounded-[2rem] bg-gradient-to-br from-wood to-[#5E3B23] p-3 shadow-card">
            <div className="grid grid-cols-8 gap-1 pb-2">
              {strip.map((c, i) => (
                <div key={i} className="h-3 rounded-sm" style={{ background: c }} />
              ))}
            </div>
            <div className="relative overflow-hidden rounded-[1.4rem] bg-gradient-to-b from-[#2B7A9C] to-[#1C5876] p-4">
              <Waves className="absolute left-4 top-4 text-white/20" size={60} />
              <IndonesiaMap className="relative w-full drop-shadow-lg" land="#4FA36C" />
              <div className="absolute bottom-4 left-4 rounded-2xl bg-cream/95 px-4 py-2 text-forest shadow-soft">
                <div className="text-[10px] font-bold uppercase tracking-widest text-wood">Tagline</div>
                <div className="font-display text-sm font-extrabold">Jelajahi Nusantara, Kuasai Wilayahnya!</div>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1 pt-2">
              {strip
                .slice()
                .reverse()
                .map((c, i) => (
                  <div key={i} className="h-3 rounded-sm" style={{ background: c }} />
                ))}
            </div>
          </div>
          <motion.div
            className="absolute -right-3 -top-6 rounded-2xl bg-cream p-3 shadow-card sm:-right-6"
            animate={{ rotate: [0, 12, -6, 0], y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            aria-hidden
          >
            <div className="grid h-12 w-12 grid-cols-3 grid-rows-3 place-items-center gap-0.5 rounded-xl border-2 border-forest/20 bg-white p-1.5">
              {[0, 2, 4, 6, 8].map((i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-forest" style={{ gridArea: `${Math.floor(i / 3) + 1} / ${(i % 3) + 1}` }} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
