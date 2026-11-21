"use client";
import { rp } from "@/engine/utils";
import { TriangleAlert, Skull, Wallet } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmButton from "@/components/ui/ConfirmButton";
import { Coins } from "@/components/ui/Coin";
import type { GameState, Player } from "@/engine/types";
import ActorBadge from "./ActorBadge";
import PlayerAssets from "./PlayerAssets";

export default function DebtModal({
  game,
  player,
  amount,
  creditorId,
  reason,
  onPay,
  onBankrupt,
}: {
  game: GameState;
  player: Player;
  amount: number;
  creditorId: string | null;
  reason: string;
  onPay: () => void;
  onBankrupt: () => void;
}) {
  const creditor = creditorId ? game.players.find((p) => p.id === creditorId) : null;
  const short = Math.max(0, amount - player.coins);
  return (
    <Modal open label="Uang tidak cukup" dismissable={false} className="max-w-xl">
      <div className="space-y-4 p-5">
        <ActorBadge player={player} label="Harus membayar" />
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 ring-2 ring-red-200">
          <TriangleAlert className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <h3 className="font-display text-xl font-extrabold text-red-800">Uang tidak cukup!</h3>
            <p className="text-sm text-red-900/80">
              Tagihan <b>{reason}</b> sebesar <b>{rp(amount)}</b> {creditor ? `kepada ${creditor.name}` : "ke kas negara"}. Jual
              bangunan, gadaikan, atau jual wilayah untuk menutupinya.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-xl bg-white p-2 shadow-soft">
            <div className="text-[10px] font-bold uppercase text-ink/50">Saldo</div>
            <Coins value={player.coins} className="text-forest" />
          </div>
          <div className="rounded-xl bg-white p-2 shadow-soft">
            <div className="text-[10px] font-bold uppercase text-ink/50">Tagihan</div>
            <Coins value={amount} className="text-red-700" />
          </div>
          <div className="rounded-xl bg-white p-2 shadow-soft">
            <div className="text-[10px] font-bold uppercase text-ink/50">Kurang</div>
            <Coins value={short} className={short ? "text-red-700" : "text-forest"} />
          </div>
        </div>
        <div className="max-h-[38dvh] overflow-y-auto pr-1 scrollbar-thin">
          <PlayerAssets game={game} playerId={player.id} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ConfirmButton confirmText="Ya, nyatakan bangkrut" className="btn-ghost w-full !border-red-200 !text-red-700" onConfirm={onBankrupt}>
            <Skull size={18} /> Bangkrut
          </ConfirmButton>
          <button className="btn-gold" disabled={short > 0} onClick={onPay}>
            <Wallet size={18} /> Bayar {rp(amount)}
          </button>
        </div>
      </div>
    </Modal>
  );
}
