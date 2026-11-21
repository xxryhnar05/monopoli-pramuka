"use client";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { GameState } from "@/engine/types";
import BoardTile from "./BoardTile";
import { BOARD_PX, CORNER, UNIT, pawnPoint } from "./geometry";
import PlayerToken from "./PlayerToken";

interface Props {
  game: GameState;
  positions: Record<string, number>;
  highlight: number | null;
  fast: boolean;
  onSelectTile: (id: number) => void;
  children: React.ReactNode; // isi tengah papan
}

export default function GameBoard({ game, positions, highlight, fast, onSelectTile, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      setFit(Math.min(1.15, w / BOARD_PX));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = fit * zoom;
  const ownerColor = (id: number) => {
    const o = game.props[id]?.ownerId;
    return o ? game.players.find((p) => p.id === o)?.color : undefined;
  };

  // kelompokkan pion per kotak untuk offset
  const alive = game.players.filter((p) => !p.bankrupt);
  const byTile: Record<number, string[]> = {};
  for (const p of alive) {
    const pos = positions[p.id] ?? p.position;
    (byTile[pos] ??= []).push(p.id);
  }
  const current = game.players[game.current];

  return (
    <div className="relative w-full">
      <div ref={wrapRef} className="w-full overflow-auto scrollbar-thin" style={{ maxHeight: zoom > 1 ? "78dvh" : undefined }}>
        <div style={{ width: BOARD_PX * scale, height: BOARD_PX * scale }} className="mx-auto">
          <div
            className="relative origin-top-left rounded-[18px] bg-gradient-to-br from-wood to-[#5E3B23] p-0 shadow-card"
            style={{ width: BOARD_PX, height: BOARD_PX, transform: `scale(${scale})` }}
          >
            <div
              className="grid h-full w-full overflow-hidden rounded-[16px] bg-cream-dark"
              style={{
                gridTemplateColumns: `${CORNER}px repeat(9, ${UNIT}px) ${CORNER}px`,
                gridTemplateRows: `${CORNER}px repeat(9, ${UNIT}px) ${CORNER}px`,
              }}
            >
              {game.tiles.map((t) => (
                <BoardTile
                  key={t.id}
                  tile={t}
                  state={game.props[t.id]}
                  ownerColor={ownerColor(t.id)}
                  highlight={highlight === t.id}
                  onSelect={onSelectTile}
                />
              ))}
              <div className="relative overflow-hidden" style={{ gridRow: "2 / 11", gridColumn: "2 / 11" }}>
                {children}
              </div>
            </div>
            {alive.map((p) => {
              const pos = positions[p.id] ?? p.position;
              const group = byTile[pos];
              const pt = pawnPoint(pos, group.indexOf(p.id), group.length);
              return <PlayerToken key={p.id} player={p} x={pt.x} y={pt.y} active={p.id === current.id} fast={fast} />;
            })}
          </div>
        </div>
      </div>
      <div className="absolute right-2 top-2 z-30 flex flex-col gap-1 lg:hidden">
        <button aria-label="Perbesar papan" className="rounded-xl bg-white/90 p-2 text-forest shadow-soft" onClick={() => setZoom((z) => Math.min(2.2, z + 0.3))}>
          <ZoomIn size={18} />
        </button>
        <button aria-label="Perkecil papan" className="rounded-xl bg-white/90 p-2 text-forest shadow-soft" onClick={() => setZoom((z) => Math.max(1, z - 0.3))}>
          <ZoomOut size={18} />
        </button>
        {zoom > 1 && (
          <button aria-label="Pas layar" className="rounded-xl bg-white/90 p-2 text-forest shadow-soft" onClick={() => setZoom(1)}>
            <Maximize2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
