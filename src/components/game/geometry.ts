/** Geometri papan 11×11 (40 kotak). Ukuran dalam piksel papan dasar. */
export const BOARD_PX = 780;
export const CORNER_RATIO = 1.5;
export const UNIT = BOARD_PX / (9 + 2 * CORNER_RATIO);
export const CORNER = UNIT * CORNER_RATIO;

export type Side = "bottom" | "left" | "top" | "right" | "corner";

export function sideOf(i: number): Side {
  if (i % 10 === 0) return "corner";
  if (i < 10) return "bottom";
  if (i < 20) return "left";
  if (i < 30) return "top";
  return "right";
}

/** Posisi grid CSS (baris, kolom) 1-based. START di pojok kanan bawah. */
export function gridPos(i: number): { row: number; col: number } {
  if (i <= 10) return { row: 11, col: 11 - i };
  if (i <= 20) return { row: 11 - (i - 10), col: 1 };
  if (i <= 30) return { row: 1, col: i - 19 };
  return { row: i - 29, col: 11 };
}

function axis(n: number): number {
  // pusat kolom/baris ke-n (1..11)
  if (n === 1) return CORNER / 2;
  if (n === 11) return BOARD_PX - CORNER / 2;
  return CORNER + (n - 1.5) * UNIT;
}

export function tileCenter(i: number): { x: number; y: number } {
  const { row, col } = gridPos(i);
  return { x: axis(col), y: axis(row) };
}

const OFFSETS = [
  [-11, -9],
  [11, -9],
  [-11, 11],
  [11, 11],
];

export function pawnPoint(i: number, slot: number, total: number): { x: number; y: number } {
  const c = tileCenter(i);
  if (total <= 1) return { x: c.x, y: c.y + 4 };
  const [dx, dy] = OFFSETS[slot % 4];
  return { x: c.x + dx, y: c.y + dy + 4 };
}
