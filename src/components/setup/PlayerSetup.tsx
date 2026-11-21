"use client";
import { Check } from "lucide-react";
import { AVATARS, PAWN_COLORS } from "@/data/players";
import type { PlayerSetupInput } from "@/engine/types";

interface Props {
  index: number;
  value: PlayerSetupInput;
  showTeam: boolean;
  takenColors: string[];
  onChange: (v: PlayerSetupInput) => void;
}

export default function PlayerSetup({ index, value, showTeam, takenColors, onChange }: Props) {
  return (
    <div className="card-paper relative overflow-hidden p-5">
      <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: value.color }} />
      <div className="flex items-center gap-3">
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl shadow-soft ring-4"
          style={{ background: `${value.color}22`, ["--tw-ring-color" as string]: value.color }}
        >
          {value.avatar}
        </span>
        <div className="flex-1">
          <label className="label" htmlFor={`name-${index}`}>
            Pemain {index + 1}
          </label>
          <input
            id={`name-${index}`}
            className="input font-semibold"
            maxLength={18}
            value={value.name}
            placeholder={`Nama pemain ${index + 1}`}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
        </div>
      </div>

      {showTeam && (
        <div className="mt-4">
          <label className="label" htmlFor={`team-${index}`}>
            Nama regu / sangga
          </label>
          <input
            id={`team-${index}`}
            className="input"
            maxLength={20}
            value={value.team ?? ""}
            placeholder="mis. Gudep 07-123"
            onChange={(e) => onChange({ ...value, team: e.target.value })}
          />
        </div>
      )}

      <div className="mt-4">
        <span className="label">Avatar</span>
        <div className="flex flex-wrap gap-1.5">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              aria-label={`Avatar ${a}`}
              aria-pressed={value.avatar === a}
              onClick={() => onChange({ ...value, avatar: a })}
              className={`grid h-10 w-10 place-items-center rounded-xl text-xl transition hover:scale-110 ${
                value.avatar === a ? "bg-forest shadow-soft ring-2 ring-gold" : "bg-white ring-1 ring-forest/10"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <span className="label">Warna pion</span>
        <div className="flex flex-wrap gap-2">
          {PAWN_COLORS.map((c) => {
            const taken = takenColors.includes(c.value) && value.color !== c.value;
            return (
              <button
                key={c.value}
                type="button"
                disabled={taken}
                title={taken ? `${c.name} (dipakai pemain lain)` : c.name}
                aria-label={c.name}
                aria-pressed={value.color === c.value}
                onClick={() => onChange({ ...value, color: c.value })}
                className="grid h-9 w-9 place-items-center rounded-full shadow-soft transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-25"
                style={{ background: c.value }}
              >
                {value.color === c.value && <Check size={18} className="text-white" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
