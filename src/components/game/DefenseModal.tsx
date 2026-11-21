"use client";
import { motion } from "framer-motion";
import { ShieldAlert, Swords } from "lucide-react";
import { useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { BLOCK_EFFECTS, cardText } from "@/data/cards";
import type { CardDef, GameState, Player } from "@/engine/types";
import { play } from "@/lib/sound";
import ActorBadge from "./ActorBadge";
import { CardFace } from "./ChanceCard";

export default function DefenseModal({ game, card, attacker, target, onDefend }: { game: GameState; card: CardDef; attacker: Player; target: Player; onDefend: (cardId: string | null) => void }) {
  useEffect(() => play("attack"), []);
  const blocks = target.hand.map((id) => game.cards[id]).filter((c) => c && BLOCK_EFFECTS.has(c.effect));
  return (
    <Modal open label="Tangkis serangan" dismissable={false} className="max-w-2xl">
      <div className="p-5">
        <motion.div initial={{ x: -20 }} animate={{ x: [0, -8, 8, -4, 0] }} transition={{ duration: 0.5 }} className="flex flex-wrap items-center gap-2">
          <ActorBadge player={target} label="Diserang" />
          <span className="text-sm text-ink/60">oleh {attacker.avatar} {attacker.name}</span>
        </motion.div>
        <h3 className="mt-3 flex items-center gap-2 font-display text-2xl font-extrabold text-red-700">
          <Swords /> Serangan datang: {card.title}
        </h3>
        <p className="text-sm text-ink/70">{cardText(card)} Gunakan kartu pertahanan untuk menangkisnya?</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {blocks.map((c) => (
            <motion.button
              key={c.id}
              whileHover={{ y: -6, rotate: -1 }}
              onClick={() => {
                play("shield");
                onDefend(c.id);
              }}
              className="h-[220px] text-left shadow-card"
              style={{ borderRadius: "1.4rem" }}
              aria-label={`Gunakan ${c.title}`}
            >
              <CardFace card={c as CardDef} small />
            </motion.button>
          ))}
        </div>
        <button className="btn-ghost mt-5 w-full" onClick={() => onDefend(null)}>
          <ShieldAlert size={18} /> Terima serangan
        </button>
      </div>
    </Modal>
  );
}
