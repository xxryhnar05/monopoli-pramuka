"use client";
// Efek suara disintesis dengan Web Audio API — tanpa file audio eksternal.

export type SoundName =
  | "click"
  | "dice"
  | "step"
  | "card"
  | "correct"
  | "wrong"
  | "buy"
  | "rent"
  | "coin"
  | "attack"
  | "shield"
  | "victory";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let volume = 0.6;

function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  master!.gain.value = volume;
  return { ctx, out: master! };
}

export function configureSound(on: boolean, vol: number) {
  enabled = on;
  volume = Math.max(0, Math.min(1, vol));
  if (master) master.gain.value = volume;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.25, slideTo?: number) {
  const a = audio();
  if (!a) return;
  const t0 = a.ctx.currentTime + start;
  const osc = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(start: number, dur: number, gain = 0.15) {
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.ctx.sampleRate * dur);
  const buf = a.ctx.createBuffer(1, len, a.ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.ctx.createBufferSource();
  src.buffer = buf;
  const g = a.ctx.createGain();
  g.gain.value = gain;
  const f = a.ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1800;
  src.connect(f).connect(g).connect(a.out);
  src.start(a.ctx.currentTime + start);
}

export function play(name: SoundName) {
  if (!enabled || volume <= 0) return;
  try {
    switch (name) {
      case "click":
        tone(660, 0, 0.06, "triangle", 0.12);
        break;
      case "dice":
        for (let i = 0; i < 7; i++) noise(i * 0.08, 0.05, 0.22);
        break;
      case "step":
        tone(520, 0, 0.05, "square", 0.05);
        break;
      case "card":
        noise(0, 0.12, 0.18);
        tone(880, 0.08, 0.18, "triangle", 0.12, 1320);
        break;
      case "correct":
        tone(523, 0, 0.12, "triangle", 0.2);
        tone(659, 0.1, 0.12, "triangle", 0.2);
        tone(784, 0.2, 0.25, "triangle", 0.22);
        break;
      case "wrong":
        tone(220, 0, 0.18, "sawtooth", 0.12, 180);
        tone(165, 0.16, 0.3, "sawtooth", 0.12, 120);
        break;
      case "buy":
      case "coin":
        tone(988, 0, 0.08, "square", 0.08);
        tone(1319, 0.07, 0.22, "square", 0.08);
        break;
      case "rent":
        tone(784, 0, 0.1, "triangle", 0.15);
        tone(523, 0.09, 0.2, "triangle", 0.15);
        break;
      case "attack":
        noise(0, 0.25, 0.25);
        tone(300, 0, 0.3, "sawtooth", 0.12, 90);
        break;
      case "shield":
        tone(440, 0, 0.35, "sine", 0.18, 880);
        tone(660, 0.05, 0.35, "sine", 0.1, 1320);
        break;
      case "victory":
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.3, "triangle", 0.2));
        break;
    }
  } catch {
    // audio tidak tersedia — abaikan
  }
}
