import type { Player } from "@/engine/types";

/** Penanda pemain yang harus memegang perangkat. */
export default function ActorBadge({ player, label = "Giliran" }: { player: Player; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 py-1 pl-1 pr-3 text-xs font-bold text-forest shadow-soft">
      <span className="grid h-6 w-6 place-items-center rounded-full text-sm" style={{ background: player.color }}>
        {player.avatar}
      </span>
      {label}: {player.name}
    </span>
  );
}
