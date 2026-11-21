"use client";
import { rp } from "@/engine/utils";
import { Route, Wallet } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { GameState, Player } from "@/engine/types";
import ActorBadge from "./ActorBadge";

export default function RentChoiceModal({ game, player, tileId, amount, ownerId, onChoose }: { game: GameState; player: Player; tileId: number; amount: number; ownerId: string; onChoose: (useCard: boolean) => void }) {
  const owner = game.players.find((p) => p.id === ownerId);
  return (
    <Modal open label="Bayar sewa" dismissable={false} className="max-w-md">
      <div className="space-y-4 p-6">
        <ActorBadge player={player} />
        <h3 className="font-display text-2xl font-extrabold text-forest">Sewa {game.tiles[tileId].name}</h3>
        <p className="text-ink/75">
          Wilayah ini milik <b>{owner?.name}</b>. Sewa yang harus dibayar <b>{rp(amount)}</b>. Kamu memegang kartu{" "}
          <b>Jalur Alternatif</b> — pakai sekarang untuk bebas sewa?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-ghost" onClick={() => onChoose(false)}>
            <Wallet size={18} /> Bayar {rp(amount)}
          </button>
          <button className="btn-gold" onClick={() => onChoose(true)}>
            <Route size={18} /> Pakai Kartu
          </button>
        </div>
      </div>
    </Modal>
  );
}
