export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function rollDie(rng: () => number = Math.random): number {
  return 1 + Math.floor(rng() * 6);
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

/** Format rupiah lengkap: Rp1.250.000 */
export function rp(n: number): string {
  return "Rp" + new Intl.NumberFormat("id-ID").format(Math.round(n));
}

/** Format rupiah ringkas untuk ruang sempit: Rp60rb, Rp1,2jt */
export function rpShort(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `Rp${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`;
  if (a >= 1_000) return `Rp${Math.round(n / 1_000)}rb`;
  return `Rp${n}`;
}

/** @deprecated gunakan rp() */
export const formatCoins = rp;
