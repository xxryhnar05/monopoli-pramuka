import { rp, rpShort } from "@/engine/utils";

/** Ikon uang kertas kecil. */
export function CoinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <rect x="1.5" y="5" width="21" height="14" rx="2.5" fill="#3E9B57" stroke="#1F5C42" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.6" fill="#D9F0DD" stroke="#1F5C42" strokeWidth="1.2" />
      <path d="M5 8.5h2M17 15.5h2" stroke="#D9F0DD" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Nominal rupiah. `short` untuk ruang sempit (Rp60rb). */
export function Coins({ value, size = 16, className = "", short = false }: { value: number; size?: number; className?: string; short?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 font-bold tabular-nums ${className}`}>
      <CoinIcon size={size} />
      {short ? rpShort(value) : rp(value)}
    </span>
  );
}
