"use client";
import Modal from "@/components/ui/Modal";
import type { GameState } from "@/engine/types";
import PropertyCard from "./PropertyCard";

export default function TileInfoModal({ game, tileId, onClose }: { game: GameState; tileId: number | null; onClose: () => void }) {
  const tile = tileId !== null ? game.tiles[tileId] : null;
  const st = tileId !== null ? game.props[tileId] : undefined;
  const owner = st?.ownerId ? game.players.find((p) => p.id === st.ownerId) : undefined;
  const here = tile ? game.players.filter((p) => !p.bankrupt && p.position === tile.id) : [];
  return (
    <Modal open={tile !== null} onClose={onClose} label={tile?.name ?? "Info kotak"}>
      {tile && (
        <div className="space-y-3 p-4">
          {tile.type === "property" || tile.type === "transport" ? (
            <PropertyCard tile={tile} state={st} ownerName={owner?.name} />
          ) : (
            <div className="rounded-3xl bg-white p-6 text-center shadow-soft">
              <div className="text-xs font-bold uppercase tracking-widest text-wood">Kotak {tile.id}</div>
              <h3 className="mt-1 font-display text-2xl font-extrabold text-forest">{tile.name}</h3>
              <p className="mt-2 text-sm text-ink/70">
                {tile.info ??
                  (tile.type === "chance"
                    ? "Tarik kartu Kesempatan Nusantara: serangan, pertahanan, ekonomi, atau kuis Pramuka."
                    : tile.type === "fund"
                      ? "Tarik kartu Dana Nusantara: hadiah atau biaya kegiatan regu."
                      : "")}
              </p>
            </div>
          )}
          {here.length > 0 && (
            <p className="text-center text-xs text-ink/60">Di sini: {here.map((p) => `${p.avatar} ${p.name}`).join(", ")}</p>
          )}
        </div>
      )}
    </Modal>
  );
}
