// Helper mutasi. Semua fungsi di sini MEMODIFIKASI draft hasil clone().
import { CAMP_INDEX, GROUPS } from "@/data/board";
import { BLOCK_EFFECTS } from "@/data/cards";
import {
  activePlayers,
  buildingCount,
  liquidationValue,
  netWorth,
  ownedTiles,
  playerById,
} from "./selectors";
import type { Difficulty, GameState, LogEntry, Pending, Player, PlayerResult } from "./types";
import { rp, shuffle } from "./utils";

export function addLog(s: GameState, text: string, tone: LogEntry["tone"] = "info") {
  s.log.unshift({ id: s.nextLogId++, t: Date.now(), round: s.round, text, tone });
  if (s.log.length > 150) s.log.length = 150;
}

export function push(s: GameState, p: Pending) {
  s.pending.push(p);
}

export function credit(s: GameState, playerId: string, amount: number, reason: string) {
  const p = playerById(s, playerId);
  if (!p || p.bankrupt || amount <= 0) return;
  p.coins += amount;
  addLog(s, `${p.name} menerima ${rp(amount)} — ${reason}.`, "good");
}

/**
 * Tagih pembayaran. Jika saldo kurang, munculkan kewajiban utang (jual/gadai)
 * atau langsung bangkrut bila seluruh aset tidak mencukupi. Saldo tidak pernah negatif.
 */
export function charge(
  s: GameState,
  payerId: string,
  amount: number,
  creditorId: string | null,
  reason: string,
  /** bagian (0..1) dari pembayaran yang masuk kas negara sebagai pajak, sisanya ke kreditor */
  taxRate = 0,
) {
  const payer = playerById(s, payerId);
  if (!payer || payer.bankrupt || amount <= 0) return;
  const creditor = creditorId ? playerById(s, creditorId) : undefined;
  if (creditor && creditor.bankrupt) creditorId = null;
  if (payer.coins >= amount) {
    payer.coins -= amount;
    const tax = creditor && creditorId ? Math.round(amount * taxRate) : 0;
    if (creditor && creditorId) creditor.coins += amount - tax;
    addLog(
      s,
      `${payer.name} membayar ${rp(amount)}${creditor && creditorId ? ` kepada ${creditor.name}` : ""} — ${reason}${
        tax > 0 ? ` (pajak ${rp(tax)} ke kas negara)` : ""
      }.`,
      "bad",
    );
    return;
  }
  if (payer.coins + liquidationValue(s, payerId) >= amount) {
    push(s, { kind: "debt", playerId: payerId, amount, creditorId, reason, taxRate });
    addLog(s, `${payer.name} kekurangan uang untuk ${reason}. Jual atau gadaikan aset!`, "bad");
    return;
  }
  bankrupt(s, payerId, creditorId);
}

export function bankrupt(s: GameState, playerId: string, creditorId: string | null) {
  const p = playerById(s, playerId);
  if (!p || p.bankrupt) return;
  const creditor = creditorId ? playerById(s, creditorId) : undefined;
  const validCreditor = creditor && !creditor.bankrupt ? creditor : undefined;
  // cairkan bangunan
  let cash = p.coins;
  for (const t of ownedTiles(s, playerId)) {
    const ps = s.props[t.id];
    if (ps.level > 0 && t.group) {
      cash += ps.level * Math.floor(GROUPS[t.group].buildCost / 2);
      ps.level = 0;
    }
    if (validCreditor) {
      ps.ownerId = validCreditor.id;
    } else {
      ps.ownerId = null;
      ps.mortgaged = false;
    }
  }
  if (validCreditor) validCreditor.coins += cash;
  p.coins = 0;
  p.bankrupt = true;
  p.bankruptAt = s.turn;
  p.hand = [];
  p.inCamp = false;
  addLog(
    s,
    `${p.name} BANGKRUT!${validCreditor ? ` Seluruh asetnya diambil alih ${validCreditor.name}.` : " Asetnya kembali ke kas Nusantara."}`,
    "bad",
  );
  // hapus antrean yang melibatkan pemain ini
  s.pending = s.pending.filter((x) => !pendingInvolves(x, playerId));
  if (activePlayers(s).length <= 1) endGame(s, "lastStanding");
}

function pendingInvolves(x: Pending, pid: string): boolean {
  switch (x.kind) {
    case "defend":
      return x.targetId === pid || x.attackerId === pid;
    case "quiz":
      return x.quiz.playerId === pid;
    default:
      return x.playerId === pid;
  }
}

export function sendToCamp(s: GameState, p: Player) {
  p.position = CAMP_INDEX;
  p.inCamp = true;
  p.campTries = 0;
  addLog(s, `${p.name} masuk Pos Perkemahan.`, "bad");
}

export function drawFromDeck(s: GameState, deck: "chanceDeck" | "fundDeck"): string | null {
  if (s[deck].length === 0) {
    const held = new Set(s.players.flatMap((p) => p.hand));
    const pool = Object.values(s.cards).filter(
      (c) => c.enabled !== false && (deck === "chanceDeck" ? c.category !== "dana" : c.category === "dana"),
    );
    s[deck] = shuffle(pool.filter((c) => !held.has(c.id)).map((c) => c.id));
  }
  return s[deck].shift() ?? null;
}

export function drawQuestion(s: GameState, difficulty: Difficulty): string | null {
  const all = Object.values(s.questions);
  if (all.length === 0) return null;
  let diff: Difficulty = difficulty;
  if (!all.some((q) => q.difficulty === diff)) diff = all[0].difficulty;
  if (s.quizDecks[diff].length === 0) {
    s.quizDecks[diff] = shuffle(all.filter((q) => q.difficulty === diff).map((q) => q.id));
  }
  return s.quizDecks[diff].shift() ?? null;
}

export function hasBlockCard(s: GameState, p: Player): boolean {
  return p.hand.some((id) => BLOCK_EFFECTS.has(s.cards[id]?.effect));
}

/** Setelah aksi selesai: tentukan fase berikutnya. */
export function settle(s: GameState) {
  if (s.phase === "gameover" || s.phase === "moving") return;
  if (s.pending.length > 0) s.phase = "action";
  else if (s.phase === "action") s.phase = "end";
  if (s.players[s.current].bankrupt && s.pending.length === 0) s.phase = "end";
}

/** Jalankan fn sehingga antrean baru diletakkan di depan antrean lama. */
export function front(s: GameState, keep: Pending[], fn: () => void) {
  const rest = s.pending;
  s.pending = [];
  fn();
  if (s.phase === "gameover") {
    s.pending = [];
    return;
  }
  const merged = [...keep, ...s.pending, ...rest];
  const gone = new Set(s.players.filter((p) => p.bankrupt).map((p) => p.id));
  s.pending = merged.filter((x) => ![...gone].some((id) => pendingInvolves(x, id)));
  settle(s);
}

export function endGame(s: GameState, reason: NonNullable<GameState["endReason"]>) {
  if (s.phase === "gameover") return;
  s.phase = "gameover";
  s.endReason = reason;
  s.endedAt = Date.now();
  s.pending = [];
  const rows = s.players.map((p) => ({
    p,
    worth: netWorth(s, p.id),
  }));
  rows.sort((a, b) => {
    if (a.p.bankrupt !== b.p.bankrupt) return a.p.bankrupt ? 1 : -1;
    if (a.p.bankrupt && b.p.bankrupt) return (b.p.bankruptAt ?? 0) - (a.p.bankruptAt ?? 0);
    return b.worth - a.worth;
  });
  s.results = rows.map(
    ({ p, worth }, i): PlayerResult => ({
      playerId: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      team: p.team,
      rank: i + 1,
      netWorth: worth,
      coins: p.coins,
      properties: ownedTiles(s, p.id).length,
      buildings: buildingCount(s, p.id),
      cardsUsed: p.stats.cardsUsed,
      quizCorrect: p.stats.quizCorrect,
      bankrupt: p.bankrupt,
    }),
  );
  const winner = s.results[0];
  addLog(
    s,
    reason === "timeUp"
      ? `Waktu habis! ${winner.name} menang dengan kekayaan ${rp(winner.netWorth)}.`
      : reason === "manual"
        ? `Permainan diakhiri. ${winner.name} menjadi penguasa Nusantara!`
        : `${winner.name} adalah pemain terakhir yang bertahan dan menjadi penguasa Nusantara!`,
    "good",
  );
}
