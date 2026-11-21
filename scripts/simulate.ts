// Simulasi otomatis: memainkan banyak permainan acak sampai selesai dan memeriksa aturan
// (saldo tidak negatif, kepemilikan tunggal, giliran valid). Jalankan: npm run simulate
import * as E from "@/engine";
import { BOARD } from "@/data/board";
import { CHANCE_CARDS, FUND_CARDS } from "@/data/cards";
import { DEFAULT_QUESTIONS } from "@/data/questions";

const content = { tiles: BOARD, chanceCards: CHANCE_CARDS, fundCards: FUND_CARDS, questions: DEFAULT_QUESTIONS };
const r = (n: number) => Math.floor(Math.random() * n);

function check(s: E.GameState, where: string) {
  for (const p of s.players) if (p.coins < 0 || !Number.isFinite(p.coins)) throw new Error(`negatif ${p.name} ${p.coins} @${where}`);
  for (const [id, ps] of Object.entries(s.props)) {
    if (ps.ownerId) {
      const o = s.players.find((p) => p.id === ps.ownerId);
      if (!o || o.bankrupt) throw new Error(`owner invalid tile ${id} @${where}`);
    } else if (ps.level || ps.mortgaged) throw new Error(`free tile w/ state ${id}`);
    if (ps.level < 0 || ps.level > 3) throw new Error("level");
  }
  for (const p of s.players) if (p.position < 0 || p.position > 39) throw new Error("pos");
  if (s.phase !== "gameover" && s.players[s.current].bankrupt && s.phase === "roll") throw new Error("bankrupt current rolls");
  if (s.phase === "action" && s.pending.length === 0) throw new Error("action w/o pending @" + where);
}

const stats = { games: 0, steps: 0, rounds: [] as number[], reasons: {} as Record<string, number>, kinds: {} as Record<string, number>, errors: {} as Record<string, number>, turns: 0 };

function step(s: E.GameState): E.GameState {
  const must = (res: E.Result, what: string) => {
    if (res.error) {
      stats.errors[`${what}: ${res.error}`] = (stats.errors[`${what}: ${res.error}`] ?? 0) + 1;
      throw new Error(`${what} gagal: ${res.error}`);
    }
    check(res.state, what);
    return res.state;
  };
  const cur = s.players[s.current];
  switch (s.phase) {
    case "roll":
      if (cur.skipTurns > 0) {
        if (cur.hand.some((id) => s.cards[id].effect === "evakuasi") && Math.random() < 0.5) return must(E.useEvacuation(s), "evak");
        return must(E.skipTurn(s), "skip");
      }
      if (cur.inCamp && cur.coins > s.config.campFee && Math.random() < 0.4) return must(E.payCampFee(s), "campfee");
      return must(E.rollDice(s), "roll");
    case "moving":
      return must(E.finishMove(s), "finish");
    case "action": {
      const t = s.pending[0];
      stats.kinds[t.kind] = (stats.kinds[t.kind] ?? 0) + 1;
      switch (t.kind) {
        case "buy": {
          const price = E.purchaseTotal(s, s.tiles[t.tileId].price!);
          const p = s.players.find((x) => x.id === t.playerId)!;
          return p.coins >= price && Math.random() < 0.8 ? must(E.buyProperty(s), "buy") : must(E.skipBuy(s), "skipbuy");
        }
        case "card": return must(E.resolveCard(s), "card");
        case "target": {
          const opts = s.players.filter((p) => !p.bankrupt && p.id !== t.playerId);
          return must(E.chooseTarget(s, opts[r(opts.length)].id), "target");
        }
        case "defend": {
          const tg = s.players.find((p) => p.id === t.targetId)!;
          const blocks = tg.hand.filter((id) => ["benteng", "strategiBertahan", "kodeRahasia"].includes(s.cards[id].effect));
          return must(E.defend(s, Math.random() < 0.7 ? blocks[0] : null), "defend");
        }
        case "quiz":
          if (t.quiz.chosen === undefined) {
            const q = s.questions[t.quiz.questionId];
            return must(E.answerQuiz(s, Math.random() < 0.5 ? q.answer : r(4)), "answer");
          }
          return must(E.closeQuiz(s), "closeQuiz");
        case "rentChoice": return must(E.rentChoice(s, Math.random() < 0.7), "rentChoice");
        case "notice": return must(E.dismissNotice(s), "notice");
        case "develop": {
          const ok = E.buildRuleCheck(s, t.playerId, t.tileId).ok;
          return must(E.developChoice(s, ok && Math.random() < 0.7), "develop");
        }
        case "debt": {
          let st = s;
          const pid = t.playerId;
          for (let guard = 0; guard < 100; guard++) {
            const p = st.players.find((x) => x.id === pid)!;
            if (p.coins >= t.amount) return must(E.settleDebt(st), "settleDebt");
            const owned = E.ownedTiles(st, pid);
            const withB = owned.find((x) => st.props[x.id].level > 0);
            if (withB) { st = must(E.sellBuilding(st, pid, withB.id), "sellB"); continue; }
            const free = owned.find((x) => !st.props[x.id].mortgaged);
            if (free) { st = must(Math.random() < 0.5 ? E.mortgage(st, pid, free.id) : E.sellProperty(st, pid, free.id), "mort"); continue; }
            break;
          }
          return must(E.declareBankruptcy(st), "bankrupt");
        }
      }
      throw new Error("unknown pending");
    }
    case "end": {
      let st = s;
      const mid = E.managerId(st);
      if (mid) {
        for (const tl of E.ownedTiles(st, mid)) {
          if (E.canBuild(st, mid, tl.id).ok && Math.random() < 0.5) st = must(E.buildOn(st, mid, tl.id), "build");
          if (st.props[tl.id].mortgaged && Math.random() < 0.2) {
            const res = E.unmortgage(st, mid, tl.id);
            if (!res.error) st = res.state;
          }
        }
      }
      stats.turns++;
      return must(E.endTurn(st, Date.now()), "endTurn");
    }
  }
  throw new Error("bad phase " + s.phase);
}

const N = Number(process.argv[2] ?? 50);
for (let g = 0; g < N; g++) {
  const n = 2 + (g % 3);
  const inputs = Array.from({ length: n }, (_, i) => ({ name: `P${i + 1}`, avatar: "🧭", color: "#f00" }));
  let s = E.createGame(inputs, {
    mode: "lokal", duration: "bebas", startingCoins: 3_000_000, startBonus: 150_000, campFee: 50_000,
    rewards: { mudah: 100_000, sedang: 150_000, sulit: 250_000, wrongPenalty: 50_000 },
    tax: { purchasePct: 10, rentPct: 10, landPerTile: 10_000, landPerBuilding: 25_000 },
    requireFullGroup: g % 2 === 0,
  }, content);
  let k = 0;
  while (s.phase !== "gameover" && k < 20000) {
    s = step(s);
    k++;
    // gelombang manual stop untuk game sangat panjang
    if (k === 19999) s = E.forceEnd(s).state;
  }
  if (s.phase !== "gameover" || !s.results) throw new Error("tidak selesai");
  stats.games++;
  stats.steps += k;
  stats.reasons[s.endReason!] = (stats.reasons[s.endReason!] ?? 0) + 1;
  stats.rounds.push(s.round);
}
console.log(JSON.stringify(stats, null, 1));
