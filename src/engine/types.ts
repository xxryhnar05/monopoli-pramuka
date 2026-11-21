// ===== Tipe inti Monopoli Nusantara =====

export type GroupId =
  | "sumatra"
  | "jawa"
  | "balinusra"
  | "kalimantan"
  | "sulawesi"
  | "maluku"
  | "papua"
  | "nasional";

export type SceneKind =
  | "lake"
  | "tower"
  | "street"
  | "temple"
  | "volcano"
  | "beach"
  | "harbor"
  | "dragon"
  | "forest"
  | "river"
  | "city"
  | "reef"
  | "village"
  | "island"
  | "valley"
  | "monument"
  | "park";

export type TileType =
  | "start"
  | "property"
  | "transport"
  | "chance"
  | "fund"
  | "tax"
  | "camp"
  | "palace"
  | "goToCamp";

export interface TileDef {
  id: number;
  type: TileType;
  name: string;
  short?: string;
  group?: GroupId;
  price?: number;
  location?: string;
  info?: string;
  scene?: SceneKind;
  image?: string; // opsional: /images/destinasi/xxx.jpg
  amount?: number; // pajak / biaya (nominal tetap, atau minimum bila taxPercent diisi)
  taxPercent?: number; // pajak persentase dari kekayaan bersih
}

export interface GroupDef {
  id: GroupId;
  name: string;
  region: string;
  color: string;
  buildCost: number;
}

export type Difficulty = "mudah" | "sedang" | "sulit";

export interface Question {
  id: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export type CardCategory = "serangan" | "pertahanan" | "ekonomi" | "pramuka";

export type CardEffect =
  // serangan
  | "razia"
  | "pencurian"
  | "blokade"
  | "seranganHutan"
  | "pengambilalihan"
  | "perangkapTali"
  | "penyerbuan"
  | "duel"
  | "perebutan"
  | "sabotase"
  // pertahanan
  | "benteng"
  | "penjagaan"
  | "evakuasi"
  | "perlindunganAset"
  | "p3k"
  | "strategiBertahan"
  | "jalurAlternatif"
  | "kodeRahasia"
  // ekonomi
  | "bantuanDana"
  | "pajakWilayah"
  | "sponsor"
  | "kerusakan"
  | "hadiahPrestasi"
  | "biayaTransport"
  | "investasi"
  | "hartaKarun"
  // pramuka
  | "kuis"
  // dana nusantara
  | "danaTerima"
  | "danaBayar"
  | "danaMaju"
  | "danaKeStart"
  | "danaKeKemah"
  | "danaKolekte";

export interface CardDef {
  id: string;
  category: CardCategory | "dana";
  effect: CardEffect;
  title: string;
  description: string;
  value?: number;
  difficulty?: Difficulty; // untuk kartu pramuka
  enabled?: boolean;
}

export interface PlayerStats {
  cardsUsed: number;
  quizCorrect: number;
  quizAnswered: number;
  rentPaid: number;
  rentEarned: number;
  attacksLaunched: number;
}

export interface Player {
  id: string;
  name: string;
  team?: string;
  avatar: string;
  color: string;
  coins: number;
  position: number;
  bankrupt: boolean;
  bankruptAt?: number;
  hand: string[]; // id kartu pertahanan yang disimpan
  skipTurns: number;
  diceLimit: boolean; // blokade: hanya 1 dadu
  inCamp: boolean;
  campTries: number;
  theftShield: number; // giliran tersisa
  assetShield: number; // giliran tersisa
  investBonus: number; // giliran tersisa
  investAmount: number; // tambahan sewa selama investasi aktif
  stats: PlayerStats;
}

export interface PropertyState {
  ownerId: string | null;
  level: number; // 0..3
  mortgaged: boolean;
}

export interface QuizState {
  questionId: string;
  playerId: string; // yang menjawab
  startedAt: number;
  chosen?: number; // -1 = waktu habis
  correct?: boolean;
  outcome?: string;
}

export type QuizContext =
  | { kind: "pramuka"; reward: number; penalty: number }
  | { kind: "prestasi"; reward: number; penalty: number }
  | { kind: "pengambilalihan"; attackerId: string; amount: number }
  | { kind: "duelAttacker"; attackerId: string; targetId: string; amount: number }
  | { kind: "duelTarget"; attackerId: string; targetId: string; amount: number; attackerCorrect: boolean };

export type Pending =
  | { kind: "buy"; tileId: number; playerId: string }
  | { kind: "card"; cardId: string; playerId: string; revealed?: string }
  | { kind: "target"; cardId: string; playerId: string }
  | { kind: "defend"; cardId: string; attackerId: string; targetId: string }
  | { kind: "quiz"; quiz: QuizState; context: QuizContext }
  | { kind: "rentChoice"; tileId: number; playerId: string; ownerId: string; amount: number }
  | { kind: "debt"; playerId: string; amount: number; creditorId: string | null; reason: string; taxRate?: number }
  | { kind: "develop"; tileId: number; playerId: string }
  | { kind: "notice"; title: string; message: string; tone: "good" | "bad" | "info"; playerId: string };

export type Phase = "roll" | "moving" | "action" | "end" | "gameover";

export interface LogEntry {
  id: number;
  t: number;
  round: number;
  text: string;
  tone: "good" | "bad" | "info" | "card";
}

export interface MoveInfo {
  playerId: string;
  from: number;
  steps: number; // boleh negatif
  dice: number[];
}

export type GameMode = "lokal" | "tim";
export type DurationKey = "cepat" | "normal" | "bebas";

export interface Rewards {
  mudah: number;
  sedang: number;
  sulit: number;
  wrongPenalty: number;
}

export interface TaxConfig {
  /** PPN atas pembelian wilayah (persen dari harga) */
  purchasePct: number;
  /** Pajak sewa: persen dari sewa yang dipotong untuk kas negara */
  rentPct: number;
  /** PBB saat melewati START, per wilayah */
  landPerTile: number;
  /** PBB saat melewati START, per bangunan */
  landPerBuilding: number;
}

export interface GameConfig {
  mode: GameMode;
  duration: DurationKey;
  startingCoins: number;
  startBonus: number;
  campFee: number;
  rewards: Rewards;
  tax: TaxConfig;
  /** true = klasik (harus kuasai satu warna lengkap sebelum membangun) */
  requireFullGroup: boolean;
}

export interface GameState {
  version: 1;
  id: string;
  config: GameConfig;
  tiles: TileDef[];
  cards: Record<string, CardDef>;
  questions: Record<string, Question>;
  players: Player[];
  props: Record<number, PropertyState>;
  current: number;
  round: number;
  turn: number;
  phase: Phase;
  dice: number[];
  move: MoveInfo | null;
  pending: Pending[];
  chanceDeck: string[];
  fundDeck: string[];
  quizDecks: Record<Difficulty, string[]>;
  log: LogEntry[];
  startedAt: number;
  endsAt: number | null;
  endedAt: number | null;
  endReason: "lastStanding" | "timeUp" | "manual" | null;
  results: PlayerResult[] | null;
  nextLogId: number;
}

export interface PlayerResult {
  playerId: string;
  name: string;
  avatar: string;
  color: string;
  team?: string;
  rank: number;
  netWorth: number;
  coins: number;
  properties: number;
  buildings: number;
  cardsUsed: number;
  quizCorrect: number;
  bankrupt: boolean;
}

export interface PlayerSetupInput {
  name: string;
  team?: string;
  avatar: string;
  color: string;
}
