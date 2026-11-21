"use client";
import { rpShort } from "@/engine/utils";
import { CircleArrowRight, Ban, Dice5, Footprints, LifeBuoy, LoaderCircle, Tent } from "lucide-react";
import IndonesiaMap from "@/components/art/IndonesiaMap";
import { CompassMark } from "@/components/art/Logo";
import type { GameState } from "@/engine/types";
import Dice from "./Dice";
import TurnIndicator from "./TurnIndicator";

export interface TurnHandlers {
  onRoll: () => void;
  onEndTurn: () => void;
  onPayCamp: () => void;
  onEvacuate: () => void;
  onSkip: () => void;
}

export function TurnControls({ game, busy, h, compact = false }: { game: GameState; busy: boolean; h: TurnHandlers; compact?: boolean }) {
  const p = game.players[game.current];
  const hasEvac = p.hand.some((id) => game.cards[id]?.effect === "evakuasi");
  const size = compact ? "!py-2.5 !px-3 text-xs sm:text-sm" : "text-base";

  if (game.phase === "moving" || busy)
    return (
      <button disabled className={`btn-green ${size}`}>
        <LoaderCircle className="animate-spin" size={18} /> Pion bergerak…
      </button>
    );
  if (game.phase === "action")
    return (
      <p className="rounded-xl bg-white/85 px-3 py-2 text-center text-xs font-semibold text-forest shadow-soft">
        Selesaikan aksi pada jendela yang terbuka.
      </p>
    );
  if (game.phase === "end")
    return (
      <button className={`btn-gold ${size} animate-pulse-ring`} onClick={h.onEndTurn}>
        <CircleArrowRight size={18} /> GILIRAN BERIKUTNYA
      </button>
    );
  if (game.phase !== "roll") return null;

  if (p.skipTurns > 0)
    return (
      <div className="flex flex-wrap justify-center gap-2">
        <button className={`btn-green ${size}`} onClick={h.onSkip}>
          <Ban size={18} /> Lewati Giliran
        </button>
        {hasEvac && (
          <button className={`btn-gold ${size}`} onClick={h.onEvacuate}>
            <LifeBuoy size={18} /> Evakuasi Darurat
          </button>
        )}
      </div>
    );
  if (p.inCamp)
    return (
      <div className="flex flex-wrap justify-center gap-2">
        <button className={`btn-gold ${size}`} onClick={h.onRoll}>
          <Dice5 size={18} /> Lempar (cari kembar)
        </button>
        <button className={`btn-green ${size}`} onClick={h.onPayCamp} disabled={p.coins < game.config.campFee}>
          <Tent size={18} /> Bayar {rpShort(game.config.campFee)}
        </button>
        {hasEvac && (
          <button className={`btn-ghost ${size}`} onClick={h.onEvacuate}>
            <LifeBuoy size={18} /> Evakuasi
          </button>
        )}
      </div>
    );
  return (
    <button className={`btn-gold ${compact ? "!py-3 !px-4 text-sm" : "!px-7 !py-4 text-lg"} animate-pulse-ring`} onClick={h.onRoll}>
      <Dice5 size={22} /> LEMPAR DADU
    </button>
  );
}

export default function CenterStage({ game, rolling, busy, h }: { game: GameState; rolling: boolean; busy: boolean; h: TurnHandlers }) {
  const p = game.players[game.current];
  const last = game.log[0];
  const status =
    p.skipTurns > 0
      ? `${p.name} terkena hukuman: kehilangan ${p.skipTurns} giliran.`
      : p.inCamp && game.phase === "roll"
        ? `${p.name} berada di Pos Perkemahan (percobaan ${p.campTries + 1}/3).`
        : p.diceLimit && game.phase === "roll"
          ? `${p.name} terkena Blokade Jalur: hanya satu dadu.`
          : last?.text;
  return (
    <div className="topo relative flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#2E8AA8] via-[#25708E] to-[#1C5876] p-6">
      <IndonesiaMap className="pointer-events-none absolute inset-x-6 top-[30%] w-[calc(100%-3rem)] opacity-35" showPins={false} land="#9FD3A8" animated={false} />
      <div className="relative flex items-center gap-3">
        <CompassMark size={50} className="animate-spin-slow" />
        <div className="leading-none">
          <div className="font-display text-xs font-bold uppercase tracking-[0.35em] text-gold-light">Monopoli</div>
          <div className="font-display text-4xl font-extrabold tracking-tight text-cream drop-shadow">NUSANTARA</div>
        </div>
      </div>
      <div className="relative">
        <TurnIndicator player={p} round={game.round} />
      </div>
      <div className="relative">
        <Dice values={game.dice} rolling={rolling} size={58} />
      </div>
      <div className="relative">
        <TurnControls game={game} busy={busy} h={h} />
      </div>
      {status && (
        <p className="relative flex max-w-[80%] items-center gap-1.5 rounded-full bg-deep/60 px-4 py-1.5 text-center text-xs font-medium text-cream backdrop-blur">
          <Footprints size={13} className="shrink-0 text-gold-light" />
          <span className="line-clamp-1">{status}</span>
        </p>
      )}
    </div>
  );
}
