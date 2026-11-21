import { HELD_EFFECTS, THEFT_EFFECTS } from "@/data/cards";
import { addLog, charge, credit, drawQuestion, push, sendToCamp } from "./core";
import { activePlayers, ownedTiles, playerById } from "./selectors";
import type { CardDef, GameState, Player } from "./types";
import { rollDie, rp } from "./utils";
import { moveBy, resolveTile } from "./movement";

/** Jalankan kartu yang baru dibuka oleh pemain. Mendorong antrean lanjutan bila perlu. */
export function runCard(s: GameState, card: CardDef, p: Player) {
  const v = card.value ?? 0;
  const others = activePlayers(s).filter((o) => o.id !== p.id);

  switch (card.category) {
    case "serangan": {
      if (others.length === 0) {
        addLog(s, `${card.title}: tidak ada target tersedia.`, "info");
        return;
      }
      if (card.effect === "penyerbuan") {
        p.stats.cardsUsed++;
        p.stats.attacksLaunched++;
        addLog(s, `${p.name} melancarkan ${card.title}!`, "card");
        for (const o of others) {
          if (o.theftShield > 0) addLog(s, `Penjagaan Ketat ${o.name} menangkis penyerbuan.`, "info");
          else charge(s, o.id, v, p.id, card.title);
        }
        return;
      }
      push(s, { kind: "target", cardId: card.id, playerId: p.id });
      return;
    }
    case "pertahanan": {
      if (HELD_EFFECTS.has(card.effect)) {
        p.hand.push(card.id);
        addLog(s, `${p.name} menyimpan kartu ${card.title}.`, "card");
        return;
      }
      p.stats.cardsUsed++;
      if (card.effect === "penjagaan") {
        p.theftShield = Math.max(p.theftShield, v || 2);
        addLog(s, `${p.name} mengaktifkan Penjagaan Ketat.`, "card");
      } else if (card.effect === "perlindunganAset") {
        p.assetShield = Math.max(p.assetShield, v || 2);
        addLog(s, `${p.name} mengaktifkan Perlindungan Aset.`, "card");
      } else if (card.effect === "p3k") {
        credit(s, p.id, v, card.title);
      }
      return;
    }
    case "ekonomi": {
      p.stats.cardsUsed++;
      switch (card.effect) {
        case "bantuanDana":
        case "sponsor":
          credit(s, p.id, v, card.title);
          return;
        case "pajakWilayah": {
          if (p.assetShield > 0) {
            addLog(s, `Perlindungan Aset membebaskan ${p.name} dari Pajak Wilayah.`, "good");
            return;
          }
          const n = ownedTiles(s, p.id).length;
          if (n === 0) addLog(s, `${p.name} belum punya wilayah, bebas Pajak Wilayah.`, "info");
          else charge(s, p.id, v * n, null, `${card.title} (${n} wilayah)`);
          return;
        }
        case "kerusakan":
        case "biayaTransport":
          charge(s, p.id, v, null, card.title);
          return;
        case "hadiahPrestasi": {
          const qid = drawQuestion(s, "sedang");
          if (!qid) return;
          push(s, {
            kind: "quiz",
            quiz: { questionId: qid, playerId: p.id, startedAt: Date.now() },
            context: { kind: "prestasi", reward: v || 250_000, penalty: s.config.rewards.wrongPenalty },
          });
          return;
        }
        case "investasi":
          p.investBonus = Math.max(p.investBonus, 2);
          p.investAmount = v || 50_000;
          addLog(s, `${p.name} berinvestasi: sewa +${rp(p.investAmount)} selama dua putaran.`, "card");
          return;
        case "hartaKarun": {
          const d = rollDie();
          const gain = d * (v || 50_000);
          credit(s, p.id, gain, `Harta Karun (dadu ${d})`);
          push(s, {
            kind: "notice",
            playerId: p.id,
            tone: "good",
            title: "Harta Karun Nusantara",
            message: `Dadu menunjukkan ${d}. Kamu mendapat ${rp(gain)}!`,
          });
          return;
        }
      }
      return;
    }
    case "pramuka": {
      const diff = card.difficulty ?? "mudah";
      const qid = drawQuestion(s, diff);
      if (!qid) return;
      p.stats.cardsUsed++;
      push(s, {
        kind: "quiz",
        quiz: { questionId: qid, playerId: p.id, startedAt: Date.now() },
        context: { kind: "pramuka", reward: s.config.rewards[diff], penalty: s.config.rewards.wrongPenalty },
      });
      return;
    }
    case "dana": {
      switch (card.effect) {
        case "danaTerima":
          credit(s, p.id, v, card.title);
          return;
        case "danaBayar":
          charge(s, p.id, v, null, card.title);
          return;
        case "danaKolekte":
          for (const o of others) charge(s, o.id, v, p.id, card.title);
          return;
        case "danaKeStart": {
          const steps = (40 - p.position) % 40 || 40;
          moveBy(s, p, steps);
          resolveTile(s, p);
          return;
        }
        case "danaKeKemah":
          sendToCamp(s, p);
          return;
        case "danaMaju":
          moveBy(s, p, v || 3);
          resolveTile(s, p);
          return;
      }
    }
  }
}

/** Terapkan efek serangan ke target (setelah pertahanan diperiksa). */
export function applyAttack(s: GameState, card: CardDef, attacker: Player, target: Player) {
  const v = card.value ?? 0;
  attacker.stats.cardsUsed++;
  attacker.stats.attacksLaunched++;
  addLog(s, `${attacker.name} menyerang ${target.name} dengan ${card.title}!`, "card");

  if (THEFT_EFFECTS.has(card.effect) && target.theftShield > 0) {
    addLog(s, `Penjagaan Ketat ${target.name} menggagalkan ${card.title}.`, "good");
    return;
  }
  switch (card.effect) {
    case "razia":
    case "pencurian":
    case "perebutan":
      charge(s, target.id, v, attacker.id, card.title);
      return;
    case "seranganHutan":
      charge(s, target.id, v, null, card.title);
      return;
    case "blokade":
      target.diceLimit = true;
      addLog(s, `${target.name} hanya boleh melempar satu dadu di giliran berikutnya.`, "bad");
      return;
    case "perangkapTali":
      target.skipTurns += 1;
      addLog(s, `${target.name} terjerat Perangkap Tali dan kehilangan satu giliran.`, "bad");
      return;
    case "sabotase": {
      const from = target.position;
      target.position = (from - (v || 3) + 40) % 40;
      addLog(s, `${target.name} disabotase mundur ke ${s.tiles[target.position].name}.`, "bad");
      return;
    }
    case "pengambilalihan": {
      if (target.assetShield > 0) {
        addLog(s, `Perlindungan Aset ${target.name} menggagalkan pengambilalihan.`, "good");
        return;
      }
      const qid = drawQuestion(s, "sedang");
      if (!qid) return;
      push(s, {
        kind: "quiz",
        quiz: { questionId: qid, playerId: target.id, startedAt: Date.now() },
        context: { kind: "pengambilalihan", attackerId: attacker.id, amount: v || 200_000 },
      });
      return;
    }
    case "duel": {
      const qid = drawQuestion(s, "sedang");
      if (!qid) return;
      push(s, {
        kind: "quiz",
        quiz: { questionId: qid, playerId: attacker.id, startedAt: Date.now() },
        context: { kind: "duelAttacker", attackerId: attacker.id, targetId: target.id, amount: v || 150_000 },
      });
      return;
    }
  }
}

export function getPlayer(s: GameState, id: string): Player {
  const p = playerById(s, id);
  if (!p) throw new Error(`Pemain ${id} tidak ditemukan`);
  return p;
}
