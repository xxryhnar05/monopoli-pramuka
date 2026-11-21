"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2, Dice5, Flag, Layers, Receipt, Trophy } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

const SLIDES = [
  {
    Icon: Flag,
    title: "Tujuanmu",
    points: [
      "Setiap pemain mulai dengan Rp3.000.000 di Gerbang Nusantara (START).",
      "Kumpulkan kekayaan, kuasai wilayah, dan buat lawan bangkrut.",
      "Jika waktu habis, pemain dengan kekayaan tertinggi menang.",
    ],
  },
  {
    Icon: Dice5,
    title: "Giliran & Dadu",
    points: [
      "Tekan LEMPAR DADU, pion maju sesuai jumlah dua dadu.",
      "Melewati START: dapat uang saku Rp150.000, tapi bayar PBB untuk setiap wilayah & bangunan.",
      "Masuk Hutan Tantangan = dikirim ke Pos Perkemahan. Keluar dengan dadu kembar, bayar Rp50.000, atau kartu Evakuasi.",
      "Setelah semua aksi selesai, tekan GILIRAN BERIKUTNYA.",
    ],
  },
  {
    Icon: Building2,
    title: "Wilayah & Bangunan",
    points: [
      "Berhenti di wilayah kosong? Pilih BELI atau LEWATI.",
      "Pemain lain yang berhenti di wilayahmu membayar sewa.",
      "Kuasai semua wilayah satu warna: sewa dobel. Mode Klasik: baru boleh membangun setelah satu warna lengkap. Mode Cepat: boleh langsung membangun.",
      "Cara membangun Pos Wisata: berhenti lagi di wilayahmu sendiri, atau buka tab Properti di giliranmu lalu tekan Bangun.",
      "Butuh uang? Jual bangunan, gadaikan, atau jual wilayah lewat menu Properti.",
    ],
  },
  {
    Icon: Receipt,
    title: "Pajak",
    points: [
      "PPN 10%: setiap membeli wilayah, bayar harga + 10%.",
      "Pajak sewa 10%: pemilik hanya menerima 90% sewa, sisanya ke kas negara.",
      "PBB: setiap melewati START bayar Rp10.000 per wilayah dan Rp25.000 per bangunan.",
      "Kotak PPh 10% memotong 10% kekayaanmu; ada juga Retribusi, Biaya Logistik, dan PPnBM.",
    ],
  },
  {
    Icon: Layers,
    title: "Kartu Kesempatan",
    points: [
      "Serangan: pilih target untuk dirampas uangnya, diblokade, atau disabotase.",
      "Pertahanan: beberapa kartu disimpan dan bisa dipakai saat diserang.",
      "Ekonomi: bonus atau biaya. Pramuka: soal kuis berhadiah uang.",
    ],
  },
  {
    Icon: Trophy,
    title: "Kuis Pramuka",
    points: [
      "Kamu punya 20 detik untuk memilih dari empat jawaban.",
      "Benar: hadiah Rp100.000–Rp250.000 sesuai tingkat kesulitan. Salah: penalti Rp50.000.",
      "Penjelasan jawaban muncul setelah menjawab — sekalian belajar!",
    ],
  },
];

export default function TutorialModal({ open, onClose, onStart }: { open: boolean; onClose: () => void; onStart: () => void }) {
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <Modal open={open} onClose={onClose} label="Tutorial singkat" className="max-w-xl">
      <div className="bg-gradient-to-br from-forest to-deep px-6 pb-6 pt-8 text-cream">
        <div className="text-xs font-bold uppercase tracking-widest text-gold-light">
          Tutorial singkat · {i + 1}/{SLIDES.length}
        </div>
        <div className="mt-3 flex gap-1.5">
          {SLIDES.map((_, k) => (
            <span key={k} className={`h-1.5 flex-1 rounded-full ${k <= i ? "bg-gold" : "bg-cream/20"}`} />
          ))}
        </div>
      </div>
      <div className="min-h-[300px] p-6">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-deep">
                <s.Icon size={24} />
              </span>
              <h3 className="font-display text-2xl font-extrabold text-forest">{s.title}</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {s.points.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-relaxed text-ink/80">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-wood/10 p-4">
        <button className="btn-ghost !px-4 !py-2.5" onClick={() => (i === 0 ? onStart() : setI(i - 1))}>
          {i === 0 ? "Lewati tutorial" : (<><ArrowLeft size={16} /> Kembali</>)}
        </button>
        {last ? (
          <button className="btn-gold" onClick={onStart}>
            Mulai Permainan <Dice5 size={18} />
          </button>
        ) : (
          <button className="btn-green" onClick={() => setI(i + 1)}>
            Lanjut <ArrowRight size={16} />
          </button>
        )}
      </div>
    </Modal>
  );
}
