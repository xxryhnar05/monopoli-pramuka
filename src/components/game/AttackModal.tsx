"use client";
import { motion } from "framer-motion";
import { Crosshair, ShieldCheck } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Coins } from "@/components/ui/Coin";
import { THEFT_EFFECTS } from "@/data/cards";
import type { CardDef, GameState, Player } from "@/engine/types";
import ActorBadge from "./ActorBadge";
import { CardFace } from "./ChanceCard";

export default function AttackModal({ game, card, attacker, onTarget }: { game: GameState; card: CardDef; attacker: Player; onTarget: (id: string) => void }) {
  const targets = game.players.filter((p) => !p.bankrupt && p.id !== attacker.id);
  return (
    <Modal open label="Pilih target serangan" dismissable={false} className="max-w-xl">
      <div className="grid gap-5 p-5 sm:grid-cols-[180px_1fr]">
        <div className="mx-auto h-[250px] w-[180px] shadow-card" style={{ borderRadius: "1.4rem" }}>
          <CardFace card={card} small />
        </div>
        <div>
          <ActorBadge player={attacker} label="Penyerang" />
          <h3 className="mt-3 font-display text-2xl font-extrabold text-forest">Pilih target</h3>
          <p className="text-sm text-ink/70">Siapa yang akan menerima {card.title}?</p>
          <ul className="mt-4 space-y-2">
            {targets.map((t) => {
              const shielded = THEFT_EFFECTS.has(card.effect) && t.theftShield > 0;
              const hasHand = t.hand.length > 0;
              return (
                <li key={t.id}>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onTarget(t.id)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-soft ring-2 ring-transparent transition hover:ring-red-400"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl text-2xl" style={{ background: `${t.color}30` }}>
                      {t.avatar}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-forest">{t.name}</span>
                      <span className="flex flex-wrap items-center gap-2 text-xs text-ink/60">
                        <Coins value={t.coins} size={12} />
                        {shielded && (
                          <span className="chip bg-sky/20 !py-0 text-[#1E4E7A]">
                            <ShieldCheck size={11} /> Penjagaan Ketat
                          </span>
                        )}
                        {hasHand && <span className="chip bg-wood/10 !py-0 text-wood">{t.hand.length} kartu disimpan</span>}
                      </span>
                    </span>
                    <Crosshair className="text-red-500" size={20} />
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
