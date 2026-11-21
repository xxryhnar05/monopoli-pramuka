// API publik game engine. Setiap aksi menerima state lama dan mengembalikan state baru.
import { BLOCK_EFFECTS } from "@/data/cards";
import { applyAttack, getPlayer, runCard } from "./cards";
import {
  addLog,
  bankrupt,
  charge,
  credit,
  drawQuestion,
  endGame,
  front,
  hasBlockCard,
  push,
  settle,
} from "./core";
import { moveBy, payRent, resolveTile } from "./movement";
import {
  activePlayers,
  buildCost,
  buildRuleCheck,
  canBuild,
  currentPlayer,
  managerId,
  mortgageValue,
  playerById,
  unmortgageCost,
} from "./selectors";
import type {
  CardDef,
  DurationKey,
  GameConfig,
  GameState,
  Pending,
  PlayerSetupInput,
  Question,
  TileDef,
} from "./types";
import { clone, rollDie, rp, shuffle, uid } from "./utils";

export type Result = { state: GameState; error?: string };

const ok = (state: GameState): Result => ({ state });
const fail = (state: GameState, error: string): Result => ({ state, error });

export const DURATION_MS: Record<DurationKey, number | null> = {
  cepat: 10 * 60_000,
  normal: 20 * 60_000,
  bebas: null,
};

export interface GameContent {
  tiles: TileDef[];
  chanceCards: CardDef[];
  fundCards: CardDef[];
  questions: Question[];
}

// ---------------------------------------------------------------- setup
export function createGame(
  inputs: PlayerSetupInput[],
  config: GameConfig,
  content: GameContent,
  now = Date.now(),
): GameState {
  if (inputs.length < 2 || inputs.length > 4) throw new Error("Jumlah pemain harus 2–4.");
  const cards: Record<string, CardDef> = {};
  for (const c of [...content.chanceCards, ...content.fundCards]) cards[c.id] = c;
  const questions: Record<string, Question> = {};
  for (const q of content.questions) questions[q.id] = q;
  const props: GameState["props"] = {};
  for (const t of content.tiles)
    if (t.type === "property" || t.type === "transport") props[t.id] = { ownerId: null, level: 0, mortgaged: false };

  const players = inputs.map((inp, i) => ({
    id: `p${i + 1}`,
    name: inp.name.trim() || `Pemain ${i + 1}`,
    team: inp.team?.trim() || undefined,
    avatar: inp.avatar,
    color: inp.color,
    coins: config.startingCoins,
    position: 0,
    bankrupt: false,
    hand: [],
    skipTurns: 0,
    diceLimit: false,
    inCamp: false,
    campTries: 0,
    theftShield: 0,
    assetShield: 0,
    investBonus: 0,
    investAmount: 0,
    stats: { cardsUsed: 0, quizCorrect: 0, quizAnswered: 0, rentPaid: 0, rentEarned: 0, attacksLaunched: 0 },
  }));
  const dur = DURATION_MS[config.duration];
  const s: GameState = {
    version: 1,
    id: uid("game"),
    config,
    tiles: content.tiles,
    cards,
    questions,
    players,
    props,
    current: Math.floor(Math.random() * players.length),
    round: 1,
    turn: 1,
    phase: "roll",
    dice: [1, 1],
    move: null,
    pending: [],
    chanceDeck: shuffle(content.chanceCards.filter((c) => c.enabled !== false).map((c) => c.id)),
    fundDeck: shuffle(content.fundCards.filter((c) => c.enabled !== false).map((c) => c.id)),
    quizDecks: { mudah: [], sedang: [], sulit: [] },
    log: [],
    startedAt: now,
    endsAt: dur ? now + dur : null,
    endedAt: null,
    endReason: null,
    results: null,
    nextLogId: 1,
  };
  addLog(s, `Petualangan dimulai! Undian menentukan ${s.players[s.current].name} jalan pertama.`, "good");
  return s;
}

// ---------------------------------------------------------------- giliran
export function rollDice(state: GameState): Result {
  if (state.phase !== "roll") return fail(state, "Belum saatnya melempar dadu.");
  const s = clone(state);
  const p = currentPlayer(s);
  if (p.skipTurns > 0) return fail(state, "Kamu harus melewatkan giliran ini.");
  const one = p.diceLimit;
  const dice = one ? [rollDie()] : [rollDie(), rollDie()];
  p.diceLimit = false;
  s.dice = dice;
  const total = dice.reduce((a, b) => a + b, 0);
  const doubles = dice.length === 2 && dice[0] === dice[1];

  if (p.inCamp) {
    if (doubles) {
      p.inCamp = false;
      p.campTries = 0;
      addLog(s, `${p.name} mendapat dadu kembar dan bebas dari Pos Perkemahan!`, "good");
    } else {
      p.campTries++;
      if (p.campTries < 3) {
        addLog(s, `${p.name} gagal mendapat dadu kembar. Tetap di Pos Perkemahan.`, "bad");
        s.phase = "end";
        return ok(s);
      }
      p.inCamp = false;
      p.campTries = 0;
      addLog(s, `${p.name} sudah 3 kali gagal, wajib membayar ${rp(s.config.campFee)} untuk keluar.`, "bad");
      charge(s, p.id, s.config.campFee, null, "biaya keluar Pos Perkemahan");
      if (p.bankrupt) {
        settle(s);
        return ok(s);
      }
    }
  }
  s.move = { playerId: p.id, from: p.position, steps: total, dice };
  s.phase = "moving";
  return ok(s);
}

/** Dipanggil UI setelah animasi pion selesai. */
export function finishMove(state: GameState): Result {
  if (state.phase !== "moving" || !state.move) return fail(state, "Tidak ada perpindahan.");
  const s = clone(state);
  const mv = s.move!;
  const p = getPlayer(s, mv.playerId);
  s.move = null;
  s.phase = "action";
  front(s, [], () => {
    moveBy(s, p, mv.steps);
    addLog(s, `${p.name} tiba di ${s.tiles[p.position].name}.`, "info");
    resolveTile(s, p);
  });
  return ok(s);
}

export function payCampFee(state: GameState): Result {
  const p0 = currentPlayer(state);
  if (state.phase !== "roll" || !p0.inCamp) return fail(state, "Kamu tidak sedang di Pos Perkemahan.");
  if (p0.coins < state.config.campFee) return fail(state, "Uang tidak cukup untuk membayar.");
  const s = clone(state);
  const p = currentPlayer(s);
  p.coins -= s.config.campFee;
  p.inCamp = false;
  p.campTries = 0;
  addLog(s, `${p.name} membayar ${rp(s.config.campFee)} dan keluar dari Pos Perkemahan.`, "info");
  return ok(s);
}

export function useEvacuation(state: GameState): Result {
  const p0 = currentPlayer(state);
  if (state.phase !== "roll") return fail(state, "Belum bisa digunakan.");
  const idx = p0.hand.findIndex((id) => state.cards[id]?.effect === "evakuasi");
  if (idx < 0) return fail(state, "Kamu tidak memiliki kartu Evakuasi Darurat.");
  if (p0.skipTurns === 0 && !p0.inCamp) return fail(state, "Tidak ada hukuman yang perlu dibatalkan.");
  const s = clone(state);
  const p = currentPlayer(s);
  p.hand.splice(idx, 1);
  p.stats.cardsUsed++;
  if (p.skipTurns > 0) p.skipTurns = 0;
  else {
    p.inCamp = false;
    p.campTries = 0;
  }
  addLog(s, `${p.name} memakai Evakuasi Darurat dan terbebas dari hukuman!`, "good");
  return ok(s);
}

export function skipTurn(state: GameState): Result {
  const p0 = currentPlayer(state);
  if (state.phase !== "roll" || p0.skipTurns <= 0) return fail(state, "Tidak ada giliran yang harus dilewati.");
  const s = clone(state);
  const p = currentPlayer(s);
  p.skipTurns--;
  addLog(s, `${p.name} kehilangan giliran.`, "bad");
  s.phase = "end";
  return ok(s);
}

export function endTurn(state: GameState, now = Date.now()): Result {
  if (state.phase !== "end" || state.pending.length > 0) return fail(state, "Selesaikan semua aksi terlebih dahulu.");
  const s = clone(state);
  if (s.endsAt && now >= s.endsAt) {
    endGame(s, "timeUp");
    return ok(s);
  }
  if (activePlayers(s).length <= 1) {
    endGame(s, "lastStanding");
    return ok(s);
  }
  let i = s.current;
  for (let k = 0; k < s.players.length; k++) {
    const next = (i + 1) % s.players.length;
    if (next <= i) s.round++;
    i = next;
    if (!s.players[i].bankrupt) break;
  }
  s.current = i;
  s.turn++;
  const p = s.players[i];
  if (p.theftShield > 0) p.theftShield--;
  if (p.assetShield > 0) p.assetShield--;
  if (p.investBonus > 0) p.investBonus--;
  s.phase = "roll";
  s.dice = s.dice.length ? s.dice : [1, 1];
  addLog(s, `Giliran ${p.name}.`, "info");
  return ok(s);
}

export function checkTime(state: GameState, now = Date.now()): Result {
  if (state.phase === "gameover" || !state.endsAt || now < state.endsAt) return ok(state);
  // tunggu animasi selesai
  if (state.phase === "moving") return ok(state);
  const s = clone(state);
  endGame(s, "timeUp");
  return ok(s);
}

export function forceEnd(state: GameState): Result {
  if (state.phase === "gameover") return ok(state);
  const s = clone(state);
  endGame(s, "manual");
  return ok(s);
}

// ---------------------------------------------------------------- antrean aksi
function withTop<K extends Pending["kind"]>(
  state: GameState,
  kind: K,
): { s: GameState; top: Extract<Pending, { kind: K }> } | null {
  const top = state.pending[0];
  if (!top || top.kind !== kind) return null;
  const s = clone(state);
  return { s, top: s.pending[0] as Extract<Pending, { kind: K }> };
}

export function buyProperty(state: GameState): Result {
  const w = withTop(state, "buy");
  if (!w) return fail(state, "Tidak ada wilayah untuk dibeli.");
  const { s, top } = w;
  const tile = s.tiles[top.tileId];
  const p = getPlayer(s, top.playerId);
  const ps = s.props[tile.id];
  if (ps.ownerId) return fail(state, "Wilayah ini sudah dimiliki.");
  const total = purchaseTotal(state, tile.price ?? 0);
  if (p.coins < total) return fail(state, "Uang tidak cukup untuk membeli (termasuk PPN).");
  p.coins -= total;
  ps.ownerId = p.id;
  const ppn = total - (tile.price ?? 0);
  addLog(s, `${p.name} membeli ${tile.name} seharga ${rp(tile.price ?? 0)}${ppn ? ` + PPN ${rp(ppn)}` : ""}.`, "good");
  s.pending.shift();
  settle(s);
  return ok(s);
}

/** Harga beli wilayah + PPN. */
export function purchaseTotal(state: GameState, price: number): number {
  const pct = state.config.tax?.purchasePct ?? 0;
  return price + Math.round((price * pct) / 100);
}

export function skipBuy(state: GameState): Result {
  const w = withTop(state, "buy");
  if (!w) return fail(state, "Tidak ada wilayah untuk dilewati.");
  const { s, top } = w;
  addLog(s, `${getPlayer(s, top.playerId).name} melewatkan ${s.tiles[top.tileId].name}.`, "info");
  s.pending.shift();
  settle(s);
  return ok(s);
}

export function resolveCard(state: GameState): Result {
  const w = withTop(state, "card");
  if (!w) return fail(state, "Tidak ada kartu.");
  const { s, top } = w;
  const card = s.cards[top.cardId];
  const p = getPlayer(s, top.playerId);
  s.pending.shift();
  front(s, [], () => runCard(s, card, p));
  settle(s);
  return ok(s);
}

export function chooseTarget(state: GameState, targetId: string): Result {
  const w = withTop(state, "target");
  if (!w) return fail(state, "Tidak ada serangan yang menunggu target.");
  const { s, top } = w;
  const target = playerById(s, targetId);
  if (!target || target.bankrupt || targetId === top.playerId) return fail(state, "Target tidak valid.");
  const card = s.cards[top.cardId];
  const attacker = getPlayer(s, top.playerId);
  s.pending.shift();
  front(s, [], () => {
    if (hasBlockCard(s, target)) {
      push(s, { kind: "defend", cardId: card.id, attackerId: attacker.id, targetId });
    } else {
      applyAttack(s, card, attacker, target);
    }
  });
  settle(s);
  return ok(s);
}

/** Target memilih kartu pertahanan (atau null = terima serangan). */
export function defend(state: GameState, defenseCardId: string | null): Result {
  const w = withTop(state, "defend");
  if (!w) return fail(state, "Tidak ada serangan yang perlu ditangkis.");
  const { s, top } = w;
  const target = getPlayer(s, top.targetId);
  const attacker = getPlayer(s, top.attackerId);
  const card = s.cards[top.cardId];
  if (defenseCardId) {
    const idx = target.hand.indexOf(defenseCardId);
    const dc = s.cards[defenseCardId];
    if (idx < 0 || !dc || !BLOCK_EFFECTS.has(dc.effect)) return fail(state, "Kartu pertahanan tidak valid.");
    target.hand.splice(idx, 1);
  }
  s.pending.shift();
  front(s, [], () => {
    if (defenseCardId) {
      const dc = s.cards[defenseCardId];
      target.stats.cardsUsed++;
      attacker.stats.attacksLaunched++;
      addLog(s, `${target.name} menangkis ${card.title} dengan ${dc.title}!`, "good");
      if (dc.effect === "strategiBertahan") charge(s, attacker.id, dc.value ?? 100_000, target.id, dc.title);
    } else {
      applyAttack(s, card, attacker, target);
    }
  });
  settle(s);
  return ok(s);
}

export function answerQuiz(state: GameState, choice: number): Result {
  const top0 = state.pending[0];
  if (!top0 || top0.kind !== "quiz" || top0.quiz.chosen !== undefined) return fail(state, "Tidak ada soal aktif.");
  const s = clone(state);
  const top = s.pending[0] as Extract<Pending, { kind: "quiz" }>;
  const q = s.questions[top.quiz.questionId];
  const p = getPlayer(s, top.quiz.playerId);
  const correct = choice === q.answer;
  top.quiz.chosen = choice;
  top.quiz.correct = correct;
  p.stats.quizAnswered++;
  if (correct) p.stats.quizCorrect++;
  const ctx = top.context;
  const rest = s.pending.slice(1);
  s.pending = [];
  let outcome = "";
  switch (ctx.kind) {
    case "pramuka":
    case "prestasi":
      if (correct) {
        credit(s, p.id, ctx.reward, "jawaban Pramuka benar");
        outcome = `+${rp(ctx.reward)}`;
      } else {
        const pen = Math.min(ctx.penalty, p.coins);
        if (pen > 0) {
          p.coins -= pen;
          addLog(s, `${p.name} salah menjawab, penalti ${rp(pen)}.`, "bad");
        } else addLog(s, `${p.name} salah menjawab.`, "bad");
        outcome = pen > 0 ? `-${rp(pen)}` : "Tidak mendapat hadiah";
      }
      break;
    case "pengambilalihan": {
      const attacker = getPlayer(s, ctx.attackerId);
      if (correct) {
        addLog(s, `${p.name} menjawab benar dan mempertahankan wilayahnya!`, "good");
        outcome = "Wilayah aman!";
      } else {
        charge(s, p.id, ctx.amount, attacker.id, "Pengambilalihan Wilayah");
        outcome = `Bayar ${rp(ctx.amount)} ke ${attacker.name}`;
      }
      break;
    }
    case "duelAttacker": {
      const target = getPlayer(s, ctx.targetId);
      outcome = correct ? "Benar! Sekarang giliran lawan." : "Salah! Semoga lawan juga salah.";
      const qid = drawQuestion(s, "sedang");
      if (qid)
        push(s, {
          kind: "quiz",
          quiz: { questionId: qid, playerId: target.id, startedAt: Date.now() },
          context: { kind: "duelTarget", attackerId: ctx.attackerId, targetId: ctx.targetId, amount: ctx.amount, attackerCorrect: correct },
        });
      break;
    }
    case "duelTarget": {
      const attacker = getPlayer(s, ctx.attackerId);
      if (ctx.attackerCorrect && !correct) {
        charge(s, p.id, ctx.amount, attacker.id, "kalah duel");
        outcome = `${attacker.name} menang duel! Kamu membayar ${rp(ctx.amount)}.`;
      } else if (!ctx.attackerCorrect && correct) {
        charge(s, attacker.id, ctx.amount, p.id, "kalah duel");
        outcome = `Kamu menang duel! ${attacker.name} membayar ${rp(ctx.amount)}.`;
      } else {
        addLog(s, `Duel ${attacker.name} vs ${p.name} berakhir seri.`, "info");
        outcome = "Duel berakhir seri.";
      }
      break;
    }
  }
  top.quiz.outcome = outcome;
  if (s.phase === "gameover") {
    s.pending = [];
    return ok(s);
  }
  const gone = new Set(s.players.filter((x) => x.bankrupt).map((x) => x.id));
  s.pending = [top, ...s.pending, ...rest].filter((x) => {
    if (x === top) return true;
    if (x.kind === "quiz") return !gone.has(x.quiz.playerId);
    if (x.kind === "defend") return !gone.has(x.targetId) && !gone.has(x.attackerId);
    return !gone.has(x.playerId);
  });
  settle(s);
  return ok(s);
}

export function closeQuiz(state: GameState): Result {
  const top = state.pending[0];
  if (!top || top.kind !== "quiz" || top.quiz.chosen === undefined) return fail(state, "Jawab soal terlebih dahulu.");
  const s = clone(state);
  s.pending.shift();
  settle(s);
  return ok(s);
}

export function dismissNotice(state: GameState): Result {
  const w = withTop(state, "notice");
  if (!w) return fail(state, "Tidak ada pemberitahuan.");
  w.s.pending.shift();
  settle(w.s);
  return ok(w.s);
}

export function rentChoice(state: GameState, useCard: boolean): Result {
  const w = withTop(state, "rentChoice");
  if (!w) return fail(state, "Tidak ada sewa yang menunggu.");
  const { s, top } = w;
  const p = getPlayer(s, top.playerId);
  s.pending.shift();
  front(s, [], () => {
    if (useCard) {
      const idx = p.hand.findIndex((id) => s.cards[id]?.effect === "jalurAlternatif");
      if (idx >= 0) {
        p.hand.splice(idx, 1);
        p.stats.cardsUsed++;
        addLog(s, `${p.name} memakai Jalur Alternatif dan bebas sewa ${s.tiles[top.tileId].name}!`, "good");
        return;
      }
    }
    const owner = playerById(s, top.ownerId);
    if (owner && !owner.bankrupt) payRent(s, p, top.ownerId, top.amount, s.tiles[top.tileId].name);
  });
  settle(s);
  return ok(s);
}

/** Mendarat di wilayah sendiri: bangun sekarang atau nanti. */
export function developChoice(state: GameState, build: boolean): Result {
  const w = withTop(state, "develop");
  if (!w) return fail(state, "Tidak ada tawaran pembangunan.");
  const { s, top } = w;
  if (build) {
    const check = buildRuleCheck(state, top.playerId, top.tileId);
    if (!check.ok) return fail(state, check.reason!);
    const tile = s.tiles[top.tileId];
    const p = getPlayer(s, top.playerId);
    const cost = buildCost(tile);
    p.coins -= cost;
    s.props[top.tileId].level++;
    const names = ["", "Pos Wisata", "Penginapan", "Resort Nusantara"];
    addLog(s, `${p.name} membangun ${names[s.props[top.tileId].level]} di ${tile.name} (${rp(cost)}).`, "good");
  }
  s.pending.shift();
  settle(s);
  return ok(s);
}

export function settleDebt(state: GameState): Result {
  const w = withTop(state, "debt");
  if (!w) return fail(state, "Tidak ada utang.");
  const { s, top } = w;
  const p = getPlayer(s, top.playerId);
  if (p.coins < top.amount) return fail(state, `Uang masih kurang ${rp(top.amount - p.coins)}.`);
  s.pending.shift();
  front(s, [], () => charge(s, p.id, top.amount, top.creditorId, top.reason, top.taxRate ?? 0));
  settle(s);
  return ok(s);
}

export function declareBankruptcy(state: GameState): Result {
  const w = withTop(state, "debt");
  if (!w) return fail(state, "Tidak ada utang.");
  const { s, top } = w;
  s.pending.shift();
  front(s, [], () => bankrupt(s, top.playerId, top.creditorId));
  settle(s);
  return ok(s);
}

// ---------------------------------------------------------------- properti
export function buildOn(state: GameState, playerId: string, tileId: number): Result {
  const check = canBuild(state, playerId, tileId);
  if (!check.ok) return fail(state, check.reason!);
  const s = clone(state);
  const tile = s.tiles[tileId];
  const p = getPlayer(s, playerId);
  const cost = buildCost(tile);
  p.coins -= cost;
  s.props[tileId].level++;
  const names = ["", "Pos Wisata", "Penginapan", "Resort Nusantara"];
  addLog(s, `${p.name} membangun ${names[s.props[tileId].level]} di ${tile.name} (${rp(cost)}).`, "good");
  return ok(s);
}

function ownerGuard(state: GameState, playerId: string, tileId: number): string | null {
  if (managerId(state) !== playerId) return "Bukan saatnya mengelola properti.";
  if (state.props[tileId]?.ownerId !== playerId) return "Bukan wilayah milikmu.";
  return null;
}

export function sellBuilding(state: GameState, playerId: string, tileId: number): Result {
  const err = ownerGuard(state, playerId, tileId);
  if (err) return fail(state, err);
  if (state.props[tileId].level <= 0) return fail(state, "Tidak ada bangunan untuk dijual.");
  const s = clone(state);
  const tile = s.tiles[tileId];
  const refund = Math.floor(buildCost(tile) / 2);
  s.props[tileId].level--;
  getPlayer(s, playerId).coins += refund;
  addLog(s, `${getPlayer(s, playerId).name} menjual satu bangunan di ${tile.name} (+${rp(refund)}).`, "info");
  return ok(s);
}

export function mortgage(state: GameState, playerId: string, tileId: number): Result {
  const err = ownerGuard(state, playerId, tileId);
  if (err) return fail(state, err);
  const ps = state.props[tileId];
  if (ps.mortgaged) return fail(state, "Wilayah sudah digadai.");
  if (ps.level > 0) return fail(state, "Jual bangunannya terlebih dahulu.");
  const s = clone(state);
  const tile = s.tiles[tileId];
  s.props[tileId].mortgaged = true;
  const v = mortgageValue(tile);
  getPlayer(s, playerId).coins += v;
  addLog(s, `${getPlayer(s, playerId).name} menggadaikan ${tile.name} (+${rp(v)}).`, "info");
  return ok(s);
}

export function unmortgage(state: GameState, playerId: string, tileId: number): Result {
  const err = ownerGuard(state, playerId, tileId);
  if (err) return fail(state, err);
  if (state.pending[0]?.kind === "debt") return fail(state, "Lunasi utang terlebih dahulu.");
  const ps = state.props[tileId];
  if (!ps.mortgaged) return fail(state, "Wilayah tidak sedang digadai.");
  const cost = unmortgageCost(state.tiles[tileId]);
  if (getPlayer(state, playerId).coins < cost) return fail(state, "Uang tidak cukup untuk menebus.");
  const s = clone(state);
  s.props[tileId].mortgaged = false;
  getPlayer(s, playerId).coins -= cost;
  addLog(s, `${getPlayer(s, playerId).name} menebus ${s.tiles[tileId].name} (${rp(cost)}).`, "info");
  return ok(s);
}

export function sellProperty(state: GameState, playerId: string, tileId: number): Result {
  const err = ownerGuard(state, playerId, tileId);
  if (err) return fail(state, err);
  const ps = state.props[tileId];
  if (ps.level > 0) return fail(state, "Jual semua bangunannya terlebih dahulu.");
  const s = clone(state);
  const tile = s.tiles[tileId];
  const v = ps.mortgaged ? 0 : mortgageValue(tile);
  s.props[tileId] = { ownerId: null, level: 0, mortgaged: false };
  getPlayer(s, playerId).coins += v;
  addLog(s, `${getPlayer(s, playerId).name} menjual ${tile.name} ke kas Nusantara (+${rp(v)}).`, "info");
  return ok(s);
}

