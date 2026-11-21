"use client";
import { motion } from "framer-motion";
import { Dice5, House, Swords, UserPlus } from "lucide-react";
import Link from "next/link";
import { SectionHead } from "./DestinationSection";

export const STEPS = [
  { Icon: UserPlus, title: "Masukkan nama pemain", text: "Pilih 2–4 pemain, avatar, warna pion, mode, dan durasi permainan." },
  { Icon: Dice5, title: "Lempar dadu", text: "Tekan LEMPAR DADU. Pion berjalan searah jarum jam mengelilingi papan." },
  { Icon: House, title: "Beli wilayah & bangun aset", text: "Beli destinasi, kuasai satu warna, lalu bangun Pos Wisata hingga Resort." },
  { Icon: Swords, title: "Kalahkan lawan dengan strategi", text: "Tarik kartu, jawab soal Pramuka, dan buat lawan bangkrut!" },
];

export default function HowToPlay() {
  return (
    <section id="cara-bermain" className="paper scroll-mt-16 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead eyebrow="Cara Bermain" title="Empat langkah menuju penguasa Nusantara" />
        <ol className="relative mt-14 grid gap-6 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-10 hidden h-0.5 border-t-2 border-dashed border-wood/30 md:block" />
          {STEPS.map(({ Icon, title, text }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-forest text-gold-light shadow-card ring-8 ring-cream">
                <Icon size={30} />
                <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-gold font-display text-sm font-extrabold text-deep">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-extrabold text-forest">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-ink/70">{text}</p>
            </motion.li>
          ))}
        </ol>
        <div className="mt-14 grid gap-4 rounded-3xl bg-white/70 p-6 text-sm text-ink/80 shadow-soft ring-1 ring-wood/10 sm:grid-cols-3">
          <p><b className="text-forest">Saldo awal</b> setiap pemain Rp3.000.000. Melewati START dapat uang saku, tapi wajib bayar PBB, PPN, dan pajak lainnya.</p>
          <p><b className="text-forest">Sewa berlipat</b> saat pemilik menguasai seluruh wilayah satu warna, dan naik lagi setiap ada bangunan.</p>
          <p><b className="text-forest">Menang</b> jika semua lawan bangkrut, atau memiliki kekayaan tertinggi saat waktu habis.</p>
        </div>
        <div className="mt-10 text-center">
          <Link href="/setup" className="btn-green text-lg">
            <Dice5 size={20} /> Ayo Mulai Bermain
          </Link>
        </div>
      </div>
    </section>
  );
}
