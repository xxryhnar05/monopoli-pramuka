import { Compass, GraduationCap, Sparkles } from "lucide-react";
import { CATEGORY_STYLE } from "@/data/cards";

const CARD_INFO = [
  { key: "serangan", count: 10, text: "Razia, sabotase, duel soal, dan perangkap tali." },
  { key: "pertahanan", count: 8, text: "Benteng, kode rahasia, dan jalur alternatif." },
  { key: "ekonomi", count: 8, text: "Sponsor, pajak wilayah, dan harta karun." },
  { key: "pramuka", count: 14, text: "Soal kepramukaan tingkat mudah hingga sulit." },
] as const;

export default function AboutSection() {
  return (
    <section id="tentang" className="scroll-mt-16 bg-cream-dark/60 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="chip mb-3 bg-forest/10 uppercase tracking-widest text-forest">Tentang Game</span>
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-forest sm:text-5xl">
            Monopoli klasik bertemu semangat Pramuka
          </h2>
          <p className="mt-5 leading-relaxed text-ink/75">
            Monopoli Nusantara dibuat untuk UKM Fair UKM Pramuka. Pengunjung bisa langsung bermain bersama teman
            sambil mengenal destinasi wisata Indonesia dan menguji pengetahuan kepramukaan — dari sejarah Gerakan
            Pramuka, Tri Satya dan Dasa Darma, sandi Morse dan semaphore, tali-temali, P3K, hingga navigasi dan survival.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              [Compass, "Eksplorasi 8 kelompok wilayah dari Sumatra hingga Papua."],
              [GraduationCap, "50 soal Pramuka bawaan, bisa ditambah lewat panel admin."],
              [Sparkles, "Animasi dadu, kartu, dan efek suara yang ringan di perangkat apa pun."],
            ].map(([Icon, t], i) => {
              const I = Icon as typeof Compass;
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-forest text-gold-light">
                    <I size={16} />
                  </span>
                  <span className="pt-1.5 text-ink/80">{t as string}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {CARD_INFO.map((c, i) => {
            const st = CATEGORY_STYLE[c.key];
            return (
              <div
                key={c.key}
                className={`rounded-3xl p-5 text-white shadow-card transition hover:-translate-y-1 ${i % 2 ? "translate-y-6" : ""}`}
                style={{ background: `linear-gradient(145deg, ${st.from}, ${st.to})` }}
              >
                <div className="font-display text-4xl font-extrabold" style={{ color: st.accent }}>
                  {c.count}
                </div>
                <div className="mt-1 font-display text-lg font-extrabold">Kartu {st.label}</div>
                <p className="mt-2 text-xs leading-relaxed text-white/80">{c.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
