"use client";
import { rp } from "@/engine/utils";
import { MapPin } from "lucide-react";
import DestinationArt from "@/components/art/DestinationArt";
import { Coins } from "@/components/ui/Coin";
import { BUILDING_NAMES, GROUPS, TRANSPORT_RENT, rentTable } from "@/data/board";
import { buildCost, mortgageValue } from "@/engine/selectors";
import type { PropertyState, TileDef } from "@/engine/types";

/** Kartu hak milik destinasi. */
export default function PropertyCard({ tile, state, ownerName }: { tile: TileDef; state?: PropertyState; ownerName?: string }) {
  const group = tile.group ? GROUPS[tile.group] : undefined;
  const color = group?.color ?? "#5C9BC7";
  const rows: [string, number][] =
    tile.type === "transport"
      ? TRANSPORT_RENT.slice(1).map((r, i) => [`Memiliki ${i + 1} transportasi`, r] as [string, number])
      : (() => {
          const t = rentTable(tile.price ?? 0);
          return [
            ["Sewa tanah", t[0]],
            ["Satu warna lengkap", t[0] * 2],
            [`+ ${BUILDING_NAMES[1]}`, t[1]],
            [`+ ${BUILDING_NAMES[2]}`, t[2]],
            [`+ ${BUILDING_NAMES[3]}`, t[3]],
          ];
        })();
  const activeRow = state && tile.type === "property" ? (state.level > 0 ? state.level + 1 : -1) : -1;

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-wood/15">
      <div className="relative h-36">
        <DestinationArt scene={tile.scene} accent={color} image={tile.image} alt={tile.name} className="h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">
            {group ? `${group.name} · ${group.region}` : "Transportasi Nusantara"}
          </div>
          <h3 className="font-display text-2xl font-extrabold text-white drop-shadow">{tile.name}</h3>
        </div>
        <span className="absolute inset-x-0 top-0 h-2" style={{ background: color }} />
      </div>
      <div className="space-y-3 p-4">
        {tile.location && (
          <p className="flex items-center gap-1 text-xs font-semibold text-wood">
            <MapPin size={13} /> {tile.location}
          </p>
        )}
        {tile.info && <p className="text-sm leading-relaxed text-ink/75">{tile.info}</p>}
        <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-2.5">
          <span className="text-sm font-bold text-forest">Harga beli</span>
          <Coins value={tile.price ?? 0} className="text-lg text-wood" />
        </div>
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, v], i) => (
              <tr key={label} className={i === activeRow ? "bg-gold/20 font-bold" : ""}>
                <td className="py-1 pl-2 text-ink/75">{label}</td>
                <td className="py-1 pr-2 text-right font-semibold tabular-nums text-forest">{rp(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-ink/60">
          {group && <span className="chip bg-forest/10 text-forest">Biaya bangun {rp(buildCost(tile))}</span>}
          <span className="chip bg-wood/10 text-wood">Nilai gadai {rp(mortgageValue(tile))}</span>
          {ownerName && <span className="chip bg-gold/20 text-wood">Pemilik: {ownerName}</span>}
          {state?.mortgaged && <span className="chip bg-red-100 text-red-700">Sedang digadai</span>}
          {state && state.level > 0 && <span className="chip bg-forest text-gold-light">{BUILDING_NAMES[state.level]}</span>}
        </div>
      </div>
    </div>
  );
}
