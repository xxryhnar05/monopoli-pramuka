"use client";
import { useId, useState } from "react";
import type { SceneKind } from "@/engine/types";

/**
 * Ilustrasi vektor destinasi. Jika `image` diberikan (mis. foto di /public/images/destinasi),
 * foto ditampilkan dan otomatis kembali ke ilustrasi bila gagal dimuat.
 */
export default function DestinationArt({
  scene = "park",
  accent = "#174D36",
  image,
  alt,
  className,
}: {
  scene?: SceneKind;
  accent?: string;
  image?: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={alt ?? ""} className={`${className ?? ""} object-cover`} onError={() => setFailed(true)} />
    );
  }
  return <Scene scene={scene} accent={accent} className={className} label={alt} />;
}

function Scene({ scene, accent, className, label }: { scene: SceneKind; accent: string; className?: string; label?: string }) {
  const id = useId().replace(/:/g, "");
  const sea = ["beach", "harbor", "reef", "island", "dragon"].includes(scene);
  const dusk = ["volcano", "tower", "monument"].includes(scene);
  return (
    <svg viewBox="0 0 160 100" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label ?? scene}>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={dusk ? "#F2B66B" : "#8EC5E6"} />
          <stop offset="1" stopColor={dusk ? "#F7DDB0" : "#E5F2F8"} />
        </linearGradient>
        <linearGradient id={`sea${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3FA7C9" />
          <stop offset="1" stopColor="#1F6E8C" />
        </linearGradient>
      </defs>
      <rect width="160" height="100" fill={`url(#sky${id})`} />
      <circle cx={dusk ? 120 : 128} cy={dusk ? 46 : 22} r={dusk ? 14 : 9} fill={dusk ? "#FCE3A2" : "#FFF6D5"} opacity="0.95" />
      <path d="M18 24 q6-6 12 0 q6-5 10 1 h-22z M96 16 q5-5 10 0 q5-4 8 1 h-18z" fill="#fff" opacity="0.8" />
      {renderScene(scene, accent, id)}
      {sea && <path d="M0 84 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" strokeOpacity="0.5" fill="none" />}
    </svg>
  );
}

function hills(fill: string, y = 70) {
  return <path d={`M0 ${y} Q30 ${y - 18} 60 ${y - 4} T120 ${y - 6} T160 ${y - 10} V100 H0Z`} fill={fill} />;
}

function renderScene(scene: SceneKind, accent: string, id: string) {
  const green = "#3E8E5E";
  const dark = "#1F5C42";
  switch (scene) {
    case "lake":
      return (
        <>
          <path d="M0 62 L40 30 L70 56 L100 26 L160 60 V100 H0Z" fill="#5F8F6E" />
          <path d="M100 26 L112 36 L92 38Z" fill="#fff" opacity="0.6" />
          <rect y="66" width="160" height="34" fill={`url(#sea${id})`} />
          <ellipse cx="80" cy="74" rx="26" ry="5" fill={green} />
          <path d="M70 72 l6 -8 l6 8z" fill="#8B5A3C" />
        </>
      );
    case "tower":
      return (
        <>
          {hills(green, 82)}
          <rect x="70" y="30" width="20" height="56" fill="#F4EBD8" stroke="#805536" />
          <circle cx="80" cy="44" r="6" fill="#fff" stroke="#103629" />
          <path d="M80 44 v-4 M80 44 h3" stroke="#103629" />
          <path d="M64 30 Q72 22 80 12 Q88 22 96 30Z" fill={accent} />
          <path d="M64 30 L60 22 M96 30 L100 22" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "street":
      return (
        <>
          <rect y="70" width="160" height="30" fill="#A98C6B" />
          {[8, 46, 98, 132].map((x, i) => (
            <g key={x}>
              <rect x={x} y={40 + (i % 2) * 6} width="28" height={36 - (i % 2) * 6} fill={i % 2 ? "#F4EBD8" : "#E7C9A2"} />
              <path d={`M${x - 3} ${40 + (i % 2) * 6} l17 -10 l17 10z`} fill={accent} />
              <rect x={x + 10} y={60} width="8" height="16" fill="#805536" />
            </g>
          ))}
          <path d="M0 86 H160" stroke="#fff" strokeDasharray="8 6" />
        </>
      );
    case "temple":
      return (
        <>
          {hills(green, 84)}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={40 + i * 8} y={76 - i * 9} width={80 - i * 16} height="10" fill="#9C8A72" stroke="#6E5D49" />
          ))}
          <path d="M72 31 Q80 18 88 31Z" fill="#9C8A72" stroke="#6E5D49" />
          <rect x="79" y="12" width="2" height="8" fill="#6E5D49" />
        </>
      );
    case "volcano":
      return (
        <>
          <path d="M0 80 L50 34 L62 40 L74 34 L130 80Z" fill="#7A6A5C" />
          <path d="M60 30 q-6 -10 2 -16 q4 8 10 4 q2 8 -6 12z" fill="#fff" opacity="0.7" />
          <path d="M90 82 L130 46 L160 74 V100 H90Z" fill="#5E7B5F" />
          <rect y="80" width="160" height="20" fill="#C9B79A" />
        </>
      );
    case "beach":
      return (
        <>
          <rect y="58" width="160" height="42" fill={`url(#sea${id})`} />
          <path d="M0 78 Q60 66 160 88 V100 H0Z" fill="#F3DFB3" />
          <path d="M28 82 Q30 60 34 44" stroke="#805536" strokeWidth="3" fill="none" />
          <path d="M34 44 q-14 -2 -20 6 M34 44 q12 -6 20 2 M34 44 q-4 -12 -14 -12 M34 44 q8 -12 18 -8" stroke={green} strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      );
    case "harbor":
      return (
        <>
          <path d="M0 60 L30 40 L60 58 L100 36 L160 58 V100 H0Z" fill="#5F8F6E" />
          <rect y="64" width="160" height="36" fill={`url(#sea${id})`} />
          <path d="M70 76 h40 l-6 8 h-28z" fill="#fff" />
          <path d="M88 76 V52 L104 72Z" fill={accent} />
          <path d="M88 52 V76" stroke="#805536" strokeWidth="2" />
        </>
      );
    case "dragon":
      return (
        <>
          <path d="M0 58 L40 30 L80 50 L120 28 L160 54 V100 H0Z" fill="#A8946B" />
          <rect y="80" width="160" height="20" fill={`url(#sea${id})`} />
          <path d="M40 76 q16 -10 40 -6 q14 2 22 8 q-10 4 -24 2 q-20 -2 -38 -4z" fill="#6B6B4E" />
          <path d="M100 76 q8 -2 14 2" stroke="#6B6B4E" strokeWidth="3" />
          <circle cx="104" cy="74" r="1.2" fill="#000" />
        </>
      );
    case "forest":
      return (
        <>
          {hills("#4C9A68", 76)}
          {[10, 34, 58, 90, 118, 142].map((x, i) => (
            <g key={x}>
              <rect x={x + 6} y={58 + (i % 2) * 6} width="4" height="20" fill="#805536" />
              <circle cx={x + 8} cy={50 + (i % 2) * 6} r="14" fill={i % 2 ? dark : green} />
            </g>
          ))}
          <circle cx="72" cy="80" r="5" fill="#C0652B" />
          <circle cx="72" cy="73" r="3.5" fill="#C0652B" />
        </>
      );
    case "river":
      return (
        <>
          {hills(green, 64)}
          <path d="M60 100 Q70 80 92 74 Q120 66 160 66 V78 Q120 78 100 84 Q84 90 90 100Z" fill={`url(#sea${id})`} />
          <path d="M104 80 h22 l-4 4 h-16z" fill="#805536" />
          {[10, 30, 140].map((x) => (
            <circle key={x} cx={x} cy="58" r="10" fill={dark} />
          ))}
        </>
      );
    case "city":
      return (
        <>
          {hills(green, 88)}
          {[14, 36, 58, 84, 108, 130].map((x, i) => (
            <rect key={x} x={x} y={40 + ((i * 13) % 26)} width="18" height={60} fill={i % 2 ? "#E5F2F8" : "#BBD9EA"} stroke="#5C9BC7" />
          ))}
          <path d="M60 40 q20 -26 40 0" fill={accent} opacity="0.9" />
          <rect y="88" width="160" height="12" fill={dark} />
        </>
      );
    case "reef":
      return (
        <>
          <rect y="36" width="160" height="64" fill={`url(#sea${id})`} />
          <path d="M10 100 q4 -20 10 -10 q4 -16 10 0 q4 -12 8 10z" fill="#E8735A" />
          <path d="M110 100 q6 -24 12 -8 q6 -18 12 2 q4 -10 8 6z" fill="#D9679B" />
          <path d="M60 60 q8 -6 16 0 q-8 6 -16 0z M76 60 l6 -4 v8z" fill="#E3BC2D" />
          <path d="M96 76 q6 -4 12 0 q-6 4 -12 0z M108 76 l4 -3 v6z" fill="#fff" />
        </>
      );
    case "village":
      return (
        <>
          {hills(green, 80)}
          {[24, 92].map((x) => (
            <g key={x}>
              <path d={`M${x - 10} 46 Q${x + 22} 30 ${x + 54} 46 L${x + 44} 54 H${x}Z`} fill="#5A3A26" />
              <rect x={x + 4} y="54" width="36" height="16" fill="#9C4A2E" />
              <path d={`M${x + 8} 62 h28`} stroke="#E3BC2D" strokeWidth="2" />
              <rect x={x + 8} y="70" width="4" height="12" fill="#5A3A26" />
              <rect x={x + 32} y="70" width="4" height="12" fill="#5A3A26" />
            </g>
          ))}
        </>
      );
    case "island":
      return (
        <>
          <rect y="50" width="160" height="50" fill={`url(#sea${id})`} />
          {[
            [24, 58, 14],
            [62, 52, 20],
            [104, 60, 12],
            [134, 56, 16],
          ].map(([x, y, r]) => (
            <path key={x} d={`M${x - r} 80 Q${x - r} ${y - r / 2} ${x} ${y - r / 2} Q${x + r} ${y - r / 2} ${x + r} 80Z`} fill={x % 2 ? dark : green} />
          ))}
        </>
      );
    case "valley":
      return (
        <>
          <path d="M0 60 L36 24 L70 54 L104 20 L160 58 V100 H0Z" fill="#5F8F6E" />
          <path d="M0 76 Q80 60 160 76 V100 H0Z" fill="#8CC07A" />
          {[50, 70, 96].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="80" rx="8" ry="5" fill="#805536" />
              <path d={`M${x - 9} 80 Q${x} 64 ${x + 9} 80`} fill="#C9B79A" />
            </g>
          ))}
        </>
      );
    case "monument":
      return (
        <>
          {hills(green, 86)}
          <rect x="44" y="70" width="72" height="12" fill="#F4EBD8" stroke="#9C8A72" />
          <path d="M76 70 L78 26 H82 L84 70Z" fill="#F4EBD8" stroke="#9C8A72" />
          <path d="M80 26 q-6 -6 0 -14 q6 8 0 14z" fill="#D6A64F" />
        </>
      );
    case "park":
    default:
      return (
        <>
          {hills(green, 74)}
          <path d="M20 82 Q80 66 140 82" stroke={accent} strokeWidth="4" fill="none" />
          <path d="M56 58 l12 -14 l12 14z M84 60 l10 -12 l10 12z" fill={accent} />
          <rect x="58" y="58" width="20" height="12" fill="#F4EBD8" />
          <rect x="86" y="60" width="16" height="10" fill="#F4EBD8" />
          <circle cx="30" cy="62" r="9" fill={dark} />
          <circle cx="130" cy="62" r="9" fill={dark} />
        </>
      );
  }
}
