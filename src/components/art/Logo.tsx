export function CompassMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#103629" stroke="#D6A64F" strokeWidth="3" />
      <circle cx="24" cy="24" r="15" fill="none" stroke="#F4EBD8" strokeOpacity="0.35" strokeDasharray="2 3" />
      <path d="M24 6 L29 24 L24 42 L19 24Z" fill="#F4EBD8" />
      <path d="M24 6 L29 24 L19 24Z" fill="#D6A64F" />
      <path d="M6 24 L24 20 L42 24 L24 28Z" fill="#F4EBD8" opacity="0.6" />
      <circle cx="24" cy="24" r="3" fill="#103629" stroke="#D6A64F" strokeWidth="1.5" />
    </svg>
  );
}

export default function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <CompassMark size={compact ? 34 : 42} />
      <span className="leading-none">
        <span className={`block font-display text-[0.62rem] font-bold uppercase tracking-[0.28em] ${light ? "text-gold-light" : "text-wood"}`}>
          Monopoli
        </span>
        <span className={`block font-display text-xl font-extrabold tracking-tight ${light ? "text-cream" : "text-forest"} ${compact ? "text-lg" : ""}`}>
          NUSANTARA
        </span>
      </span>
    </span>
  );
}
