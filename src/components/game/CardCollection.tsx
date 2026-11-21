"use client";
import { Layers } from "lucide-react";
import type { GameState } from "@/engine/types";
import { CardFace } from "./ChanceCard";

const HINT: Record<string, string> = {
  benteng: "Otomatis ditawarkan saat kamu diserang.",
  kodeRahasia: "Otomatis ditawarkan saat kamu diserang.",
  strategiBertahan: "Ditawarkan saat diserang; penyerang membayar denda kepadamu.",
  jalurAlternatif: "Ditawarkan saat kamu harus membayar sewa.",
  evakuasi: "Pakai di awal giliran saat terkena hukuman atau di Pos Perkemahan.",
};

export default function CardCollection({ game, playerId }: { game: GameState; playerId: string }) {
  const p = game.players.find((x) => x.id === playerId)!;
  if (p.hand.length === 0)
    return (
      <div className="rounded-2xl border-2 border-dashed border-wood/20 p-6 text-center text-sm text-ink/60">
        <Layers className="mx-auto mb-2 text-wood/50" />
        Belum ada kartu pertahanan yang disimpan.
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-3">
      {p.hand.map((id, i) => {
        const c = game.cards[id];
        return (
          <div key={id + i}>
            <div className="h-[200px] shadow-soft" style={{ borderRadius: "1.4rem" }}>
              <CardFace card={c} small />
            </div>
            <p className="mt-1.5 text-[11px] leading-tight text-ink/60">{HINT[c.effect]}</p>
          </div>
        );
      })}
    </div>
  );
}
