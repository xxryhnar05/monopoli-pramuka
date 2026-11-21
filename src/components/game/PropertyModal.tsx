"use client";
import { ShoppingCart, SkipForward } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Coins } from "@/components/ui/Coin";
import { purchaseTotal } from "@/engine/actions";
import type { GameState, Player } from "@/engine/types";
import { rp, rpShort } from "@/engine/utils";
import ActorBadge from "./ActorBadge";
import PropertyCard from "./PropertyCard";

export default function PropertyModal({
  game,
  tileId,
  player,
  onBuy,
  onSkip,
  onManage,
}: {
  game: GameState;
  tileId: number;
  player: Player;
  onBuy: () => void;
  onSkip: () => void;
  onManage: () => void;
}) {
  const tile = game.tiles[tileId];
  const price = tile.price ?? 0;
  const total = purchaseTotal(game, price);
  const ppn = total - price;
  const enough = player.coins >= total;
  return (
    <Modal open label={`Beli ${tile.name}`} dismissable={false}>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <ActorBadge player={player} />
          <Coins value={player.coins} className="text-sm text-wood" />
        </div>
        <PropertyCard tile={tile} state={game.props[tileId]} />
        {ppn > 0 && (
          <div className="rounded-2xl bg-white px-4 py-2.5 text-sm shadow-soft">
            <div className="flex justify-between text-ink/70">
              <span>Harga</span>
              <span className="tabular-nums">{rp(price)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>PPN {game.config.tax.purchasePct}%</span>
              <span className="tabular-nums">{rp(ppn)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-wood/10 pt-1 font-bold text-forest">
              <span>Total bayar</span>
              <span className="tabular-nums">{rp(total)}</span>
            </div>
          </div>
        )}
        {!enough && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
            Uangmu kurang {rp(total - player.coins)}.{" "}
            <button className="font-bold underline" onClick={onManage}>
              Jual/gadai aset
            </button>{" "}
            untuk menambah uang, atau lewati.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-ghost" onClick={onSkip}>
            <SkipForward size={18} /> LEWATI
          </button>
          <button className="btn-gold" onClick={onBuy} disabled={!enough}>
            <ShoppingCart size={18} /> BELI {rpShort(total)}
          </button>
        </div>
      </div>
    </Modal>
  );
}
