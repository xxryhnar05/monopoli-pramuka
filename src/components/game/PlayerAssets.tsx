"use client";
import { rp } from "@/engine/utils";
import { BadgeCheck, Hammer, HandCoins, Landmark, Lock, LockOpen } from "lucide-react";
import ConfirmButton from "@/components/ui/ConfirmButton";
import { Coins } from "@/components/ui/Coin";
import { BUILDING_NAMES, GROUPS } from "@/data/board";
import {
  buildCost,
  canBuild,
  completedGroups,
  managerId,
  mortgageValue,
  ownedTiles,
  rentFor,
  unmortgageCost,
} from "@/engine/selectors";
import type { GameState, GroupId } from "@/engine/types";
import { play } from "@/lib/sound";
import * as E from "@/engine";
import { useGame } from "@/store/gameStore";

const smallBtn =
  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40";

/** Koleksi & manajemen properti seorang pemain. */
export default function PlayerAssets({ game, playerId, onSelectTile }: { game: GameState; playerId: string; onSelectTile?: (id: number) => void }) {
  const act = useGame((s) => s.act);
  const owned = ownedTiles(game, playerId);
  const full = new Set(completedGroups(game, playerId));
  const canManage = managerId(game) === playerId;
  const debt = game.pending[0]?.kind === "debt";

  if (owned.length === 0)
    return (
      <div className="rounded-2xl border-2 border-dashed border-wood/20 p-6 text-center text-sm text-ink/60">
        <Landmark className="mx-auto mb-2 text-wood/50" />
        Belum memiliki wilayah. Berhenti di destinasi kosong untuk membelinya!
      </div>
    );

  const groups = new Map<string, typeof owned>();
  for (const t of owned) {
    const k = t.group ?? "transport";
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }

  return (
    <div className="space-y-4">
      {!canManage && (
        <p className="rounded-xl bg-cream-dark/60 px-3 py-2 text-xs text-ink/60">
          Properti hanya bisa dikelola oleh pemain yang sedang mendapat giliran (atau yang sedang melunasi utang).
        </p>
      )}
      {[...groups.entries()].map(([g, tiles]) => {
        const group = g === "transport" ? null : GROUPS[g as GroupId];
        return (
          <div key={g} className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-wood/10">
            <div className="flex items-center justify-between px-3 py-2 text-white" style={{ background: group?.color ?? "#5C9BC7" }}>
              <span className="text-xs font-extrabold uppercase tracking-wider">{group ? `${group.region}` : "Transportasi"}</span>
              {group && full.has(group.id) && (
                <span className="chip bg-white/25 !py-0.5 text-[10px]">
                  <BadgeCheck size={12} /> Satu warna lengkap
                </span>
              )}
            </div>
            <ul className="divide-y divide-wood/10">
              {tiles.map((t) => {
                const ps = game.props[t.id];
                const build = canBuild(game, playerId, t.id);
                return (
                  <li key={t.id} className="space-y-2 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <button className="text-left" onClick={() => onSelectTile?.(t.id)}>
                        <span className="block font-bold leading-tight text-forest hover:underline">{t.name}</span>
                        <span className="text-[11px] text-ink/60">
                          Beli {rp(t.price ?? 0)} · Sewa sekarang {rp(ps.mortgaged ? 0 : rentFor(game, t.id))}
                        </span>
                      </button>
                      <span className="flex flex-col items-end gap-1">
                        {t.type === "property" && (
                          <span className={`chip !py-0.5 text-[10px] ${ps.level ? "bg-forest text-gold-light" : "bg-cream-dark text-ink/60"}`}>
                            {BUILDING_NAMES[ps.level]}
                          </span>
                        )}
                        {ps.mortgaged && <span className="chip bg-red-100 !py-0.5 text-[10px] text-red-700">Digadai</span>}
                      </span>
                    </div>
                    {canManage && (
                      <div className="flex flex-wrap gap-1.5">
                        {t.type === "property" && ps.level < 3 && !debt && (
                          <ConfirmButton
                            confirmText={`Bangun (${rp(buildCost(t))})`}
                            disabled={!build.ok}
                            title={build.reason}
                            className={`${smallBtn} bg-gold/25 text-wood hover:bg-gold/40`}
                            onConfirm={() => act((s) => E.buildOn(s, playerId, t.id)) && play("buy")}
                          >
                            <Hammer size={13} /> Bangun {BUILDING_NAMES[ps.level + 1]}
                          </ConfirmButton>
                        )}
                        {ps.level > 0 && (
                          <ConfirmButton
                            confirmText={`Jual (+${rp(Math.floor(buildCost(t) / 2))})`}
                            className={`${smallBtn} bg-cream-dark text-ink/80 hover:bg-cream-dark/70`}
                            onConfirm={() => act((s) => E.sellBuilding(s, playerId, t.id)) && play("coin")}
                          >
                            <HandCoins size={13} /> Jual bangunan
                          </ConfirmButton>
                        )}
                        {ps.level === 0 && !ps.mortgaged && (
                          <ConfirmButton
                            confirmText={`Gadai (+${rp(mortgageValue(t))})`}
                            className={`${smallBtn} bg-cream-dark text-ink/80 hover:bg-cream-dark/70`}
                            onConfirm={() => act((s) => E.mortgage(s, playerId, t.id)) && play("coin")}
                          >
                            <Lock size={13} /> Gadai
                          </ConfirmButton>
                        )}
                        {ps.mortgaged && !debt && (
                          <ConfirmButton
                            confirmText={`Tebus (${rp(unmortgageCost(t))})`}
                            disabled={(game.players.find((p) => p.id === playerId)?.coins ?? 0) < unmortgageCost(t)}
                            className={`${smallBtn} bg-sky/20 text-[#1E4E7A] hover:bg-sky/30`}
                            onConfirm={() => act((s) => E.unmortgage(s, playerId, t.id)) && play("coin")}
                          >
                            <LockOpen size={13} /> Tebus
                          </ConfirmButton>
                        )}
                        {ps.level === 0 && (
                          <ConfirmButton
                            confirmText={`Jual ke bank (+${rp(ps.mortgaged ? 0 : mortgageValue(t))})`}
                            className={`${smallBtn} bg-red-50 text-red-700 hover:bg-red-100`}
                            onConfirm={() => act((s) => E.sellProperty(s, playerId, t.id)) && play("coin")}
                          >
                            <Coins value={ps.mortgaged ? 0 : mortgageValue(t)} size={12} /> Jual wilayah
                          </ConfirmButton>
                        )}
                      </div>
                    )}
                    {canManage && !debt && t.type === "property" && ps.level < 3 && !build.ok && (
                      <p className="text-[11px] leading-snug text-ink/55">⛺ {build.reason}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
