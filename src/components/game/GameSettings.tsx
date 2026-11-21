"use client";
import { Flag, Gauge, Volume2, VolumeX } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmButton from "@/components/ui/ConfirmButton";
import { useSettings } from "@/store/settingsStore";

export default function GameSettings({ open, onClose, onEndGame }: { open: boolean; onClose: () => void; onEndGame: () => void }) {
  const s = useSettings();
  return (
    <Modal open={open} onClose={onClose} label="Pengaturan" className="max-w-md">
      <div className="space-y-5 p-6">
        <h3 className="font-display text-2xl font-extrabold text-forest">Pengaturan</h3>
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft">
          <span className="flex items-center gap-2 font-bold text-forest">
            {s.soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />} Efek suara
          </span>
          <button
            role="switch"
            aria-checked={s.soundOn}
            onClick={() => s.setSound(!s.soundOn)}
            className={`relative h-7 w-12 rounded-full transition ${s.soundOn ? "bg-forest" : "bg-ink/20"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${s.soundOn ? "left-6" : "left-1"}`} />
          </button>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-soft">
          <label htmlFor="vol" className="flex items-center justify-between font-bold text-forest">
            Volume <span className="text-sm text-ink/60">{Math.round(s.volume * 100)}%</span>
          </label>
          <input id="vol" type="range" min={0} max={1} step={0.05} value={s.volume} onChange={(e) => s.setVolume(Number(e.target.value))} className="mt-2 w-full accent-[#174D36]" />
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft">
          <span className="flex items-center gap-2 font-bold text-forest">
            <Gauge size={18} /> Animasi cepat
            <span className="text-xs font-normal text-ink/50">(perangkat lambat)</span>
          </span>
          <button
            role="switch"
            aria-checked={s.fastAnimations}
            onClick={() => s.setFastAnimations(!s.fastAnimations)}
            className={`relative h-7 w-12 rounded-full transition ${s.fastAnimations ? "bg-forest" : "bg-ink/20"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${s.fastAnimations ? "left-6" : "left-1"}`} />
          </button>
        </div>
        <div className="border-t border-wood/15 pt-4">
          <p className="mb-2 text-xs text-ink/60">Akhiri permainan sekarang. Pemenang ditentukan dari kekayaan tertinggi.</p>
          <ConfirmButton confirmText="Ya, akhiri sekarang" className="btn-ghost w-full !text-red-700" onConfirm={onEndGame}>
            <Flag size={18} /> Akhiri Permainan
          </ConfirmButton>
        </div>
      </div>
    </Modal>
  );
}
