"use client";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import DestinationArt from "@/components/art/DestinationArt";
import { BOARD, GROUPS } from "@/data/board";
import type { SceneKind } from "@/engine/types";

const FEATURED: { name: string; location: string; desc: string; scene: SceneKind; color: string }[] = [
  ...["Danau Toba", "Candi Borobudur", "Gunung Bromo"].map((n) => fromBoard(n)),
  { name: "Bali", location: "Pantai Kuta, Bali", desc: "Pulau Dewata dengan pantai, pura, dan budaya yang mendunia.", scene: "beach", color: GROUPS.balinusra.color },
  ...["Labuan Bajo", "Tana Toraja", "Raja Ampat", "Monas"].map((n) => fromBoard(n)),
];

function fromBoard(name: string) {
  const t = BOARD.find((x) => x.name === name)!;
  return { name: t.name, location: t.location ?? "", desc: t.info ?? "", scene: t.scene ?? "park", color: GROUPS[t.group!].color };
}

export default function DestinationSection() {
  return (
    <section id="destinasi" className="paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead eyebrow="Jelajahi Indonesia" title="Dari Sabang sampai Merauke, semua bisa kamu kuasai" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((d, i) => (
            <motion.article
              key={d.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 4) * 0.08 }}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-wood/10"
            >
              <div className="relative h-40 overflow-hidden">
                <DestinationArt scene={d.scene} accent={d.color} alt={d.name} className="h-full w-full transition duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 h-2 w-14 rounded-full" style={{ background: d.color }} />
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-extrabold text-forest">{d.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-wood">
                  <MapPin size={13} /> {d.location}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{d.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className={`chip ${light ? "bg-gold/20 text-gold-light" : "bg-forest/10 text-forest"} mb-3 uppercase tracking-widest`}>
        {eyebrow}
      </span>
      <h2 className={`font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl ${light ? "text-cream" : "text-forest"}`}>
        {title}
      </h2>
    </div>
  );
}
