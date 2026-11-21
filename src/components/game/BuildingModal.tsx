"use client";
import { Hammer, Hotel, House, Info, Star } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Coins } from "@/components/ui/Coin";
import { BUILDING_NAMES, GROUPS, rentTable } from "@/data/board";
import { buildCost, buildRuleCheck, groupTiles } from "@/engine/selectors";
import type { GameState, Player } from "@/engine/types";
import { rp } from "@/engine/utils";
import ActorBadge from "./ActorBadge";

const ICONS = [House, House, Hotel, Star];

/** Muncul saat pemain berhenti di wilayahnya sendiri: tawaran membangun. */
export default function BuildingModal({
  game,
  tileId,
  player,
  onChoose,
}: {
  game: GameState;
  tileId: number;
  player: Player;
  onChoose: (build: boolean) => void;
}) {
  const tile = game.tiles[tileId];
  const ps = game.props[tileId];
  const group = GROUPS[tile.group!];
  const next = ps.level + 1;
  const cost = buildCost(tile);
  const check = buildRuleCheck(game, player.id, tileId);
  const rents = rentTable(tile.price ?? 0);
  const Icon = ICONS[next] ?? House;
  const members = groupTiles(game, tile.group!);

  return (
    <Modal open label={`Bangun di ${tile.name}`} dismissable={false} className="max-w-md">
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <ActorBadge player={player} />
          <Coins value={player.coins} className="text-sm text-wood" />
        </div>
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-soft" style={{ background: group.color }}>
            <Icon size={28} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-wood">Wilayahmu sendiri</p>
            <h3 className="font-display text-2xl font-extrabold text-forest">{tile.name}</h3>
            <p className="text-sm text-ink/60">Sekarang: {BUILDING_NAMES[ps.level]}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 text-sm shadow-soft">
          <div className="flex justify-between">
            <span className="text-ink/70">Bangun {BUILDING_NAMES[next]}</span>
            <b className="tabular-nums text-forest">{rp(cost)}</b>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/70">Sewa naik menjadi</span>
            <b className="tabular-nums text-forest">{rp(rents[next])}</b>
          </div>
        </div>

        {game.config.requireFullGroup !== false && (
          <div className="rounded-2xl bg-cream-dark/60 p-3 text-xs text-ink/70">
            <p className="mb-1.5 font-bold text-forest">Syarat: kuasai semua wilayah {group.region}</p>
            <ul className="space-y-1">
              {members.map((t) => {
                const mine = game.props[t.id].ownerId === player.id;
                return (
                  <li key={t.id} className="flex items-center gap-2">
                    <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] text-white ${mine ? "bg-forest" : "bg-ink/25"}`}>
                      {mine ? "✓" : ""}
                    </span>
                    {t.name}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!check.ok && (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
            <Info size={16} className="mt-0.5 shrink-0" /> {check.reason}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button className="btn-ghost" onClick={() => onChoose(false)}>
            {check.ok ? "Nanti saja" : "Oke"}
          </button>
          <button className="btn-gold" disabled={!check.ok} onClick={() => onChoose(true)}>
            <Hammer size={18} /> Bangun
          </button>
        </div>
      </div>
    </Modal>
  );
}
