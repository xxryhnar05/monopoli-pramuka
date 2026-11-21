import { GROUPS, TRANSPORT_RENT, rentTable } from "@/data/board";
import type { GameState, GroupId, Pending, Player, TileDef } from "./types";
import { rp } from "./utils";

export const tileOf = (s: GameState, id: number): TileDef => s.tiles[id];

export const playerById = (s: GameState, id: string): Player | undefined =>
  s.players.find((p) => p.id === id);

export const currentPlayer = (s: GameState): Player => s.players[s.current];

export const activePlayers = (s: GameState): Player[] => s.players.filter((p) => !p.bankrupt);

export const topPending = (s: GameState): Pending | undefined => s.pending[0];

export function ownedTiles(s: GameState, playerId: string): TileDef[] {
  return s.tiles.filter((t) => s.props[t.id]?.ownerId === playerId);
}

export function groupTiles(s: GameState, group: GroupId): TileDef[] {
  return s.tiles.filter((t) => t.type === "property" && t.group === group);
}

export function ownsFullGroup(s: GameState, playerId: string, group: GroupId): boolean {
  const tiles = groupTiles(s, group);
  return tiles.length > 0 && tiles.every((t) => s.props[t.id]?.ownerId === playerId);
}

export function completedGroups(s: GameState, playerId: string): GroupId[] {
  return (Object.keys(GROUPS) as GroupId[]).filter((g) => ownsFullGroup(s, playerId, g));
}

export function buildCost(tile: TileDef): number {
  return tile.group ? GROUPS[tile.group].buildCost : 0;
}

export function rentLevels(tile: TileDef): number[] {
  if (tile.type === "transport") return TRANSPORT_RENT.slice(1);
  return rentTable(tile.price ?? 0);
}

/** Sewa yang harus dibayar saat mendarat di kotak ini. */
export function rentFor(s: GameState, tileId: number): number {
  const tile = s.tiles[tileId];
  const ps = s.props[tileId];
  if (!ps || !ps.ownerId || ps.mortgaged) return 0;
  const owner = playerById(s, ps.ownerId);
  let rent = 0;
  if (tile.type === "transport") {
    const count = s.tiles.filter(
      (t) => t.type === "transport" && s.props[t.id]?.ownerId === ps.ownerId && !s.props[t.id]?.mortgaged,
    ).length;
    rent = TRANSPORT_RENT[Math.min(count, 4)];
  } else if (tile.type === "property") {
    const table = rentTable(tile.price ?? 0);
    if (ps.level > 0) rent = table[ps.level];
    else rent = table[0] * (tile.group && ownsFullGroup(s, ps.ownerId, tile.group) ? 2 : 1);
  }
  if (owner && owner.investBonus > 0) rent += owner.investAmount || 50_000;
  return rent;
}

export function mortgageValue(tile: TileDef): number {
  return Math.floor((tile.price ?? 0) / 2);
}

export function unmortgageCost(tile: TileDef): number {
  return Math.ceil((tile.price ?? 0) * 0.55);
}

/** Uang yang bisa dicairkan pemain dengan menjual bangunan & menggadaikan semua wilayah. */
export function liquidationValue(s: GameState, playerId: string): number {
  return ownedTiles(s, playerId).reduce((sum, t) => {
    const ps = s.props[t.id];
    const buildings = ps.level * Math.floor(buildCost(t) / 2);
    return sum + buildings + (ps.mortgaged ? 0 : mortgageValue(t));
  }, 0);
}

export function netWorth(s: GameState, playerId: string): number {
  const p = playerById(s, playerId);
  if (!p || p.bankrupt) return 0;
  const assets = ownedTiles(s, playerId).reduce((sum, t) => {
    const ps = s.props[t.id];
    const value = ps.mortgaged ? mortgageValue(t) : t.price ?? 0;
    return sum + value + ps.level * buildCost(t);
  }, 0);
  return p.coins + assets;
}

export function buildingCount(s: GameState, playerId: string): number {
  return ownedTiles(s, playerId).reduce((n, t) => n + s.props[t.id].level, 0);
}

/** Siapa yang boleh mengelola properti saat ini (bangun/jual/gadai). */
export function managerId(s: GameState): string | null {
  if (s.phase === "gameover" || s.phase === "moving") return null;
  const top = s.pending[0];
  if (top) {
    if (top.kind === "debt") return top.playerId;
    if (top.kind === "buy") return top.playerId;
    return null;
  }
  return currentPlayer(s).id;
}

/** Syarat bangunan tanpa memeriksa giliran. */
export function buildRuleCheck(s: GameState, playerId: string, tileId: number): { ok: boolean; reason?: string } {
  const tile = s.tiles[tileId];
  const ps = s.props[tileId];
  if (!ps || ps.ownerId !== playerId || tile.type !== "property" || !tile.group)
    return { ok: false, reason: "Bangunan hanya untuk destinasi wisata milikmu (bukan transportasi)." };
  if (ps.level >= 3) return { ok: false, reason: "Sudah menjadi Resort Nusantara (level tertinggi)." };
  if (ps.mortgaged) return { ok: false, reason: "Wilayah sedang digadai. Tebus dulu." };
  if (s.config.requireFullGroup !== false) {
    if (!ownsFullGroup(s, playerId, tile.group)) {
      const missing = groupTiles(s, tile.group).filter((t) => s.props[t.id].ownerId !== playerId).map((t) => t.name);
      return { ok: false, reason: `Kuasai dulu semua wilayah ${GROUPS[tile.group].region}. Kurang: ${missing.join(", ")}.` };
    }
    if (groupTiles(s, tile.group).some((t) => s.props[t.id].mortgaged))
      return { ok: false, reason: "Ada wilayah satu warna yang sedang digadai." };
  }
  const p = playerById(s, playerId)!;
  if (p.coins < buildCost(tile)) return { ok: false, reason: `Uang tidak cukup (butuh ${rp(buildCost(tile))}).` };
  return { ok: true };
}

export function canBuild(s: GameState, playerId: string, tileId: number): { ok: boolean; reason?: string } {
  if (managerId(s) !== playerId) return { ok: false, reason: "Hanya bisa membangun saat giliranmu." };
  if (s.pending[0]?.kind === "debt") return { ok: false, reason: "Lunasi utang terlebih dahulu." };
  return buildRuleCheck(s, playerId, tileId);
}
