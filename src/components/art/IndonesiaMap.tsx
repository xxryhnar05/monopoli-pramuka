"use client";
import { motion } from "framer-motion";

/** Peta kepulauan Indonesia yang disederhanakan (ilustrasi, bukan peta presisi). */
export const ISLANDS: { name: string; d: string }[] = [
  { name: "Sumatra", d: "M38 72 C60 52 92 58 118 84 C150 112 186 140 214 166 C240 190 270 214 284 246 C276 262 254 266 236 252 C206 230 178 206 146 182 C110 156 74 128 50 104 C38 94 32 82 38 72 Z" },
  { name: "Jawa", d: "M276 286 C300 276 340 280 380 284 C420 288 470 292 520 300 C528 306 524 316 512 318 C470 316 420 312 372 308 C330 304 298 302 280 298 C268 296 268 290 276 286 Z" },
  { name: "Bali", d: "M532 304 C540 300 550 302 552 308 C550 314 540 316 534 312 Z" },
  { name: "Lombok", d: "M560 306 C568 302 576 306 576 312 C572 318 562 316 560 312 Z" },
  { name: "Sumbawa", d: "M586 306 C604 300 628 302 646 308 C644 316 628 318 606 316 C592 316 584 312 586 306 Z" },
  { name: "Flores", d: "M660 314 C690 306 730 308 766 316 C764 324 740 326 708 324 C684 324 662 322 660 314 Z" },
  { name: "Sumba", d: "M630 340 C646 334 664 336 672 344 C664 352 644 352 632 348 Z" },
  { name: "Timor", d: "M778 344 C808 330 842 326 868 330 C866 340 840 350 810 356 C792 360 776 354 778 344 Z" },
  { name: "Kalimantan", d: "M330 132 C344 104 372 88 402 82 C430 74 452 66 478 46 C500 34 528 40 540 64 C548 90 532 118 524 150 C516 182 498 212 466 228 C430 240 392 236 362 216 C334 196 318 164 330 132 Z" },
  { name: "Sulawesi", d: "M596 124 C616 108 660 104 704 104 C712 108 710 118 702 120 C668 122 638 126 620 140 C612 152 614 166 626 168 C646 164 668 158 684 168 C680 178 660 180 640 186 C628 192 624 206 636 220 C648 234 660 246 652 258 C640 262 626 248 614 232 C604 216 602 196 596 180 C588 160 584 140 596 124 Z" },
  { name: "Halmahera", d: "M768 118 C780 108 794 114 792 128 C788 140 798 150 806 160 C800 170 788 164 782 154 C776 166 770 178 762 174 C760 160 770 148 768 136 Z" },
  { name: "Seram", d: "M760 222 C786 214 818 214 846 220 C848 228 826 232 798 232 C778 232 762 230 760 222 Z" },
  { name: "Buru", d: "M712 218 C724 210 740 212 744 222 C740 232 724 234 714 228 Z" },
  { name: "Papua", d: "M842 186 C858 170 882 164 904 174 C910 184 900 194 908 200 C930 204 960 208 984 216 C996 222 998 238 996 262 C996 290 996 316 992 334 C976 334 960 324 944 312 C924 296 908 276 896 260 C884 246 868 236 856 224 C846 214 838 198 842 186 Z" },
];

export const MAP_PINS: { name: string; x: number; y: number }[] = [
  { name: "Danau Toba", x: 108, y: 104 },
  { name: "Borobudur", x: 400, y: 298 },
  { name: "Bromo", x: 480, y: 304 },
  { name: "Bali", x: 542, y: 308 },
  { name: "Labuan Bajo", x: 664, y: 318 },
  { name: "IKN", x: 492, y: 168 },
  { name: "Toraja", x: 616, y: 200 },
  { name: "Banda Neira", x: 820, y: 262 },
  { name: "Raja Ampat", x: 862, y: 192 },
  { name: "Monas", x: 300, y: 290 },
];

interface Props {
  className?: string;
  showPins?: boolean;
  land?: string;
  sea?: string;
  animated?: boolean;
}

export default function IndonesiaMap({ className, showPins = true, land = "#3E8E5E", sea = "transparent", animated = true }: Props) {
  return (
    <svg viewBox="0 0 1000 400" className={className} role="img" aria-label="Peta kepulauan Indonesia">
      <rect width="1000" height="400" fill={sea} />
      <g stroke="#F4EBD8" strokeOpacity="0.25" strokeWidth="1" fill="none">
        {[90, 170, 250, 330].map((y) => (
          <line key={y} x1="0" x2="1000" y1={y} y2={y} strokeDasharray="4 8" />
        ))}
      </g>
      <g>
        {ISLANDS.map((isl, i) =>
          animated ? (
            <motion.path
              key={isl.name}
              d={isl.d}
              fill={land}
              stroke="#F4EBD8"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i, duration: 0.5 }}
              style={{ transformOrigin: "center", transformBox: "fill-box" }}
            />
          ) : (
            <path key={isl.name} d={isl.d} fill={land} stroke="#F4EBD8" strokeWidth="2" />
          ),
        )}
      </g>
      {showPins &&
        MAP_PINS.map((p, i) => (
          <g key={p.name} transform={`translate(${p.x} ${p.y})`}>
            <circle r="9" fill="#D6A64F" opacity="0.35">
              <animate attributeName="r" values="6;13;6" dur="2.4s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
            </circle>
            <circle r="5" fill="#D6A64F" stroke="#103629" strokeWidth="1.5" />
          </g>
        ))}
    </svg>
  );
}
