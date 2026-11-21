import { addLog, charge, credit, drawFromDeck, push, sendToCamp } from "./core";
import { netWorth, ownedTiles, rentFor } from "./selectors";
import type { GameState, Player } from "./types";

/** Pindahkan pion. Maju melewati/berhenti di START memberi bonus. */
export function moveBy(s: GameState, p: Player, steps: number) {
  const from = p.position;
  const raw = from + steps;
  p.position = ((raw % 40) + 40) % 40;
  if (steps > 0 && raw >= 40) {
    credit(s, p.id, s.config.startBonus, p.position === 0 ? "uang saku di Gerbang Nusantara" : "uang saku melewati Gerbang Nusantara");
    landTax(s, p);
  }
}

/** Pajak Bumi & Bangunan (PBB): dibayar setiap melewati START, sesuai jumlah wilayah & bangunan. */
export function landTax(s: GameState, p: Player) {
  const tax = s.config.tax;
  if (!tax) return;
  const owned = ownedTiles(s, p.id);
  const buildings = owned.reduce((n, t) => n + s.props[t.id].level, 0);
  const amount = owned.length * tax.landPerTile + buildings * tax.landPerBuilding;
  if (amount > 0) charge(s, p.id, amount, null, `PBB (${owned.length} wilayah, ${buildings} bangunan)`);
}

/** Jalankan efek kotak tempat pion berhenti. */
export function resolveTile(s: GameState, p: Player) {
  const tile = s.tiles[p.position];
  switch (tile.type) {
    case "start":
    case "palace":
      if (tile.type === "palace") addLog(s, `${p.name} beristirahat di ${tile.name}.`, "info");
      return;
    case "camp":
      addLog(s, `${p.name} singgah di Pos Perkemahan.`, "info");
      return;
    case "goToCamp":
      addLog(s, `${p.name} tersesat di Hutan Tantangan!`, "bad");
      sendToCamp(s, p);
      return;
    case "tax": {
      let amount = tile.amount ?? 0;
      if (tile.taxPercent) {
        amount = Math.max(amount, Math.round((netWorth(s, p.id) * tile.taxPercent) / 100 / 1000) * 1000);
      }
      charge(s, p.id, amount, null, tile.taxPercent ? `${tile.name} ${tile.taxPercent}% dari kekayaan` : tile.name);
      return;
    }
    case "chance":
    case "fund": {
      const id = drawFromDeck(s, tile.type === "chance" ? "chanceDeck" : "fundDeck");
      if (id) push(s, { kind: "card", cardId: id, playerId: p.id });
      return;
    }
    case "property":
    case "transport": {
      const ps = s.props[tile.id];
      if (!ps.ownerId) {
        push(s, { kind: "buy", tileId: tile.id, playerId: p.id });
        return;
      }
      if (ps.ownerId === p.id) {
        addLog(s, `${p.name} berkunjung ke wilayahnya sendiri, ${tile.name}.`, "info");
        if (tile.type === "property" && ps.level < 3) push(s, { kind: "develop", tileId: tile.id, playerId: p.id });
        return;
      }
      if (ps.mortgaged) {
        addLog(s, `${tile.name} sedang digadai — tidak ada sewa.`, "info");
        return;
      }
      const amount = rentFor(s, tile.id);
      const hasAlt = p.hand.some((id) => s.cards[id]?.effect === "jalurAlternatif");
      if (hasAlt) {
        push(s, { kind: "rentChoice", tileId: tile.id, playerId: p.id, ownerId: ps.ownerId, amount });
        return;
      }
      payRent(s, p, ps.ownerId, amount, tile.name);
      return;
    }
  }
}

export function payRent(s: GameState, p: Player, ownerId: string, amount: number, tileName: string) {
  const owner = s.players.find((x) => x.id === ownerId);
  const before = p.coins;
  charge(s, p.id, amount, ownerId, `sewa ${tileName}`, (s.config.tax?.rentPct ?? 0) / 100);
  if (p.coins < before && owner) {
    p.stats.rentPaid += amount;
    owner.stats.rentEarned += amount;
  }
}
