"use client";
import { History, Info, Landmark, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { GROUPS } from "@/data/board";
import { rp } from "@/engine/utils";
import { managerId } from "@/engine/selectors";
import type { GameState } from "@/engine/types";
import ActivityLog from "./ActivityLog";
import CardCollection from "./CardCollection";
import PlayerAssets from "./PlayerAssets";

export type SideTab = "properti" | "kartu" | "riwayat" | "info";

const TABS: { key: SideTab; label: string; Icon: typeof Info }[] = [
  { key: "properti", label: "Properti", Icon: Landmark },
  { key: "kartu", label: "Kartu", Icon: Layers },
  { key: "riwayat", label: "Riwayat", Icon: History },
  { key: "info", label: "Info", Icon: Info },
];

export default function SidePanel({
  game,
  tab,
  onTab,
  onSelectTile,
}: {
  game: GameState;
  tab: SideTab;
  onTab: (t: SideTab) => void;
  onSelectTile: (id: number) => void;
}) {
  const focusId = managerId(game) ?? game.players[game.current].id;
  const [viewId, setViewId] = useState(focusId);
  useEffect(() => setViewId(focusId), [focusId]);
  const viewing = game.players.find((p) => p.id === viewId) ?? game.players[game.current];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-forest/10 p-1">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => onTab(key)}
            aria-pressed={tab === key}
            className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-bold transition ${
              tab === key ? "bg-forest text-gold-light shadow-soft" : "text-forest hover:bg-white/60"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {(tab === "properti" || tab === "kartu") && (
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {game.players.map((p) => (
            <button
              key={p.id}
              onClick={() => setViewId(p.id)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition ${
                viewing.id === p.id ? "text-white shadow-soft" : "bg-white/70 text-ink/70"
              }`}
              style={viewing.id === p.id ? { background: p.color } : undefined}
            >
              {p.avatar} <span className="max-w-[80px] truncate">{p.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin">
        {tab === "properti" && <PlayerAssets game={game} playerId={viewing.id} onSelectTile={onSelectTile} />}
        {tab === "kartu" && <CardCollection game={game} playerId={viewing.id} />}
        {tab === "riwayat" && <ActivityLog game={game} />}
        {tab === "info" && (
          <div className="space-y-4 text-sm text-ink/75">
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft">
              <h4 className="font-display font-extrabold text-forest">Aturan cepat</h4>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                <li>Lewati START: uang saku +{rp(game.config.startBonus)}, lalu bayar PBB {rp(game.config.tax.landPerTile)}/wilayah & {rp(game.config.tax.landPerBuilding)}/bangunan.</li>
                <li>PPN pembelian wilayah {game.config.tax.purchasePct}%. Pajak sewa {game.config.tax.rentPct}% (dipotong dari pemilik).</li>
                <li>{game.config.requireFullGroup !== false ? "Aturan bangun Klasik: kuasai satu warna lengkap dulu." : "Aturan bangun Cepat: boleh bangun di wilayah mana pun."} Bangun lewat tab Properti atau saat berhenti di wilayah sendiri.</li>
                <li>Satu warna lengkap: sewa tanah 2×.</li>
                <li>Bangunan: Pos Wisata → Penginapan → Resort Nusantara.</li>
                <li>Transportasi: sewa Rp40rb / 80rb / 150rb / 250rb sesuai jumlah dimiliki.</li>
                <li>Pos Perkemahan: keluar dengan dadu kembar, bayar {rp(game.config.campFee)}, atau Evakuasi. Gagal 3× wajib bayar.</li>
                <li>Kuis: mudah {rp(game.config.rewards.mudah)}, sedang {rp(game.config.rewards.sedang)}, sulit {rp(game.config.rewards.sulit)}. Salah −{rp(game.config.rewards.wrongPenalty)}.</li>
                <li>Gadai = setengah harga. Tebus = 55% harga.</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-soft">
              <h4 className="font-display font-extrabold text-forest">Kelompok wilayah</h4>
              <ul className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
                {Object.values(GROUPS).map((g) => (
                  <li key={g.id} className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded" style={{ background: g.color }} />
                    {g.region}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
