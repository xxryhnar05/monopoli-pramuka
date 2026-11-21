"use client";
import { motion } from "framer-motion";
import { BookOpen, Coins as CoinsIcon, PiggyBank, Shield, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { CompassMark } from "@/components/art/Logo";
import Modal from "@/components/ui/Modal";
import { CATEGORY_STYLE, HELD_EFFECTS, cardText } from "@/data/cards";
import type { CardDef, Player } from "@/engine/types";
import { play } from "@/lib/sound";
import ActorBadge from "./ActorBadge";

const ICONS = { serangan: Swords, pertahanan: Shield, ekonomi: CoinsIcon, pramuka: BookOpen, dana: PiggyBank };

export function CardFace({ card, small = false }: { card: CardDef; small?: boolean }) {
  const st = CATEGORY_STYLE[card.category];
  const Icon = ICONS[card.category];
  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-[1.4rem] border-4 text-white ${small ? "p-3" : "p-5"}`}
      style={{ background: `linear-gradient(150deg, ${st.from}, ${st.to})`, borderColor: `${st.accent}55` }}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-15" style={{ background: st.accent }} />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: st.accent }}>
          {st.label}
        </span>
        <span className="text-[10px] font-bold opacity-60">{card.id}</span>
      </div>
      <div className={`mx-auto grid place-items-center rounded-full border-2 ${small ? "my-2 h-12 w-12" : "my-5 h-20 w-20"}`} style={{ borderColor: st.accent, color: st.accent }}>
        <Icon size={small ? 22 : 38} />
      </div>
      <h3 className={`text-center font-display font-extrabold leading-tight ${small ? "text-base" : "text-2xl"}`}>{card.title}</h3>
      <p className={`mt-2 text-center leading-snug text-white/85 ${small ? "text-[11px]" : "text-sm"}`}>{cardText(card)}</p>
      {card.difficulty && (
        <span className="mx-auto mt-auto rounded-full px-3 py-1 text-[10px] font-extrabold uppercase" style={{ background: st.accent, color: st.from }}>
          Tingkat {card.difficulty}
        </span>
      )}
    </div>
  );
}

function CardBack() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-[1.4rem] border-4 border-gold/60 bg-gradient-to-br from-deep to-forest">
      <CompassMark size={84} />
      <div className="mt-3 font-display text-sm font-extrabold uppercase tracking-[0.25em] text-gold-light">Kesempatan</div>
      <div className="font-display text-lg font-extrabold text-cream">NUSANTARA</div>
    </div>
  );
}

export default function ChanceCardModal({ card, player, onResolve }: { card: CardDef; player: Player; onResolve: () => void }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    play("card");
    const t = setTimeout(() => setFlipped(true), 650);
    return () => clearTimeout(t);
  }, [card.id]);
  const held = card.category === "pertahanan" && HELD_EFFECTS.has(card.effect);
  const label =
    card.category === "serangan"
      ? card.effect === "penyerbuan"
        ? "Serbu!"
        : "Pilih Target"
      : card.category === "pramuka" || card.effect === "hadiahPrestasi"
        ? "Jawab Soal"
        : held
          ? "Simpan Kartu"
          : "Jalankan Efek";

  return (
    <Modal open label={`Kartu ${card.title}`} dismissable={false} bare className="max-w-sm">
      <div className="flex flex-col items-center gap-5 p-4">
        <ActorBadge player={player} label="Menarik kartu" />
        <div className="h-[380px] w-[260px]" style={{ perspective: 1200 }}>
          <motion.div
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
            initial={{ rotateY: 0, y: -40, scale: 0.7, opacity: 0 }}
            animate={{ rotateY: flipped ? 180 : 0, y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <div className="absolute inset-0 shadow-card" style={{ backfaceVisibility: "hidden", borderRadius: "1.4rem" }}>
              <CardBack />
            </div>
            <div className="absolute inset-0 shadow-card" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: "1.4rem" }}>
              <CardFace card={card} />
            </div>
          </motion.div>
        </div>
        <button className="btn-gold w-[260px]" disabled={!flipped} onClick={onResolve}>
          {label}
        </button>
      </div>
    </Modal>
  );
}
