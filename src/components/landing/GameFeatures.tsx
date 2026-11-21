"use client";
import { motion } from "framer-motion";
import { BookOpenCheck, Building2, Crown, Map, Swords, Users } from "lucide-react";
import { SectionHead } from "./DestinationSection";

const FEATURES = [
  { Icon: Map, title: "Beli & kuasai wilayah", text: "22 destinasi wisata dari 8 kelompok wilayah siap kamu beli dan kuasai." },
  { Icon: Building2, title: "Bangun pos & penginapan", text: "Kembangkan wilayah jadi Pos Wisata, Penginapan, hingga Resort Nusantara." },
  { Icon: Swords, title: "Serang & bertahan", text: "Gunakan kartu Serangan dan Pertahanan untuk mengatur strategi melawan lawan." },
  { Icon: BookOpenCheck, title: "Uji pengetahuan Pramuka", text: "Jawab soal sejarah, Dasa Darma, sandi, tali-temali, hingga survival." },
  { Icon: Crown, title: "Jadi penguasa Nusantara", text: "Kumpulkan kekayaan terbesar dan rebut tahta di leaderboard." },
  { Icon: Users, title: "Kompetisi dengan teman", text: "2–4 pemain bergantian di satu perangkat. Seru untuk stan UKM Fair!" },
];

export default function GameFeatures() {
  return (
    <section id="fitur" className="topo bg-gradient-to-b from-forest to-deep py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead light eyebrow="Fitur Game" title="Strategi ekonomi, petualangan, dan ilmu kepramukaan" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group rounded-3xl border border-cream/10 bg-cream/[0.06] p-6 backdrop-blur transition hover:border-gold/40 hover:bg-cream/10"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-light to-gold text-deep shadow-soft transition group-hover:rotate-6">
                  <Icon size={22} />
                </span>
                <span className="font-display text-sm font-bold text-gold-light">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-extrabold text-cream">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
