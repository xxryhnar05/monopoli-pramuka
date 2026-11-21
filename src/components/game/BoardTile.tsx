"use client";
import { rp, rpShort } from "@/engine/utils";
import {
  ArrowLeft,
  CircleHelp,
  Hotel,
  House,
  Landmark,
  PiggyBank,
  Plane,
  Receipt,
  Ship,
  Star,
  Tent,
  TrainFront,
  TramFront,
  TreePine,
} from "lucide-react";
import { memo } from "react";
import DestinationArt from "@/components/art/DestinationArt";
import { GROUPS } from "@/data/board";
import type { PropertyState, TileDef } from "@/engine/types";
import { gridPos, sideOf } from "./geometry";

function TileIcon({ tile, size = 22 }: { tile: TileDef; size?: number }) {
  switch (tile.type) {
    case "start":
      return <ArrowLeft size={size} />;
    case "chance":
      return <CircleHelp size={size} />;
    case "fund":
      return <PiggyBank size={size} />;
    case "tax":
      return <Receipt size={size} />;
    case "camp":
      return <Tent size={size} />;
    case "palace":
      return <Landmark size={size} />;
    case "goToCamp":
      return <TreePine size={size} />;
    case "transport":
      if (tile.id === 5) return <TrainFront size={size} />;
      if (tile.id === 15) return <Ship size={size} />;
      if (tile.id === 25) return <Plane size={size} />;
      return <TramFront size={size} />;
    default:
      return null;
  }
}

const CORNER_STYLE: Record<string, string> = {
  start: "from-gold-light to-gold text-deep",
  camp: "from-[#C9DDB9] to-[#9BBF86] text-deep",
  palace: "from-[#DCEFFC] to-sky text-deep",
  goToCamp: "from-forest to-deep text-cream",
};

interface Props {
  tile: TileDef;
  state?: PropertyState;
  ownerColor?: string;
  highlight?: boolean;
  onSelect: (id: number) => void;
}

function BoardTileImpl({ tile, state, ownerColor, highlight, onSelect }: Props) {
  const side = sideOf(tile.id);
  const { row, col } = gridPos(tile.id);
  const group = tile.group ? GROUPS[tile.group] : undefined;
  const band =
    side === "bottom" ? "top-0 inset-x-0 h-[22%]" : side === "top" ? "bottom-0 inset-x-0 h-[22%]" : side === "left" ? "right-0 inset-y-0 w-[18%]" : "left-0 inset-y-0 w-[18%]";
  const ownerEdge =
    side === "bottom" ? "bottom-0 inset-x-0 h-1.5" : side === "top" ? "top-0 inset-x-0 h-1.5" : side === "left" ? "left-0 inset-y-0 w-1.5" : "right-0 inset-y-0 w-1.5";
  const horizontal = side === "left" || side === "right";

  const base =
    "relative overflow-hidden border border-wood/25 text-center transition-[box-shadow,transform] duration-200 hover:z-10 hover:scale-[1.04] hover:shadow-card focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-gold";

  if (side === "corner") {
    return (
      <button
        style={{ gridRow: row, gridColumn: col }}
        onClick={() => onSelect(tile.id)}
        className={`${base} flex flex-col items-center justify-center gap-1 bg-gradient-to-br p-1.5 ${CORNER_STYLE[tile.type]} ${highlight ? "ring-4 ring-gold" : ""}`}
        aria-label={`${tile.id}. ${tile.name}`}
      >
        <TileIcon tile={tile} size={30} />
        <span className="font-display text-[11px] font-extrabold uppercase leading-tight">{tile.short ?? tile.name}</span>
        {tile.type === "start" && <span className="text-[9px] font-bold">Uang saku</span>}
        <span className="absolute left-1 top-0.5 text-[8px] font-bold opacity-50">{tile.id}</span>
      </button>
    );
  }

  return (
    <button
      style={{ gridRow: row, gridColumn: col }}
      onClick={() => onSelect(tile.id)}
      className={`${base} bg-[#FBF6EA] ${highlight ? "z-10 ring-4 ring-gold" : ""} ${state?.mortgaged ? "opacity-60 grayscale" : ""}`}
      aria-label={`${tile.id}. ${tile.name}${tile.price ? `, harga ${rp(tile.price)}` : ""}`}
    >
      {group && <span className={`absolute ${band}`} style={{ background: group.color }} />}
      {ownerColor && <span className={`absolute ${ownerEdge}`} style={{ background: ownerColor }} />}
      <span
        className={`absolute flex flex-col items-center justify-center gap-0.5 px-0.5 ${
          side === "bottom" ? "inset-x-0 bottom-0 top-[22%]" : side === "top" ? "inset-x-0 top-0 bottom-[22%]" : side === "left" ? "inset-y-0 left-0 right-[18%]" : "inset-y-0 right-0 left-[18%]"
        }`}
      >
        {tile.type === "property" ? (
          <DestinationArt scene={tile.scene} accent={group?.color} className={`${horizontal ? "h-6 w-14" : "h-5 w-11"} rounded`} />
        ) : (
          <span className={tile.type === "chance" ? "text-[#7B4CB0]" : tile.type === "fund" ? "text-wood" : "text-forest"}>
            <TileIcon tile={tile} size={horizontal ? 18 : 20} />
          </span>
        )}
        <span className="line-clamp-2 font-display text-[8.5px] font-bold leading-[1.05] text-ink">{tile.short ?? tile.name}</span>
        {tile.price !== undefined && <span className="text-[8.5px] font-bold text-wood">{rpShort(tile.price)}</span>}
        {tile.type === "tax" && <span className="text-[8.5px] font-bold text-red-700">{tile.taxPercent ? `−${tile.taxPercent}%` : `−${rpShort(tile.amount ?? 0)}`}</span>}
      </span>
      {state && state.level > 0 && (
        <span className="absolute right-0.5 top-0.5 flex gap-px rounded bg-white/90 px-0.5 py-px text-forest shadow">
          {state.level === 3 ? <Star size={10} className="fill-gold text-wood" /> : state.level === 2 ? <Hotel size={10} /> : <House size={10} />}
        </span>
      )}
      <span className="absolute bottom-0 left-0.5 text-[7px] font-bold text-ink/30">{tile.id}</span>
    </button>
  );
}

export default memo(BoardTileImpl);
