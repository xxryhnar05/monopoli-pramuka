"use client";
import { rp } from "@/engine/utils";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Hourglass, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import type { GameState, Pending } from "@/engine/types";
import { play } from "@/lib/sound";
import ActorBadge from "./ActorBadge";

const LIMIT = 20;
const LETTERS = ["A", "B", "C", "D"];

type QuizPending = Extract<Pending, { kind: "quiz" }>;

function contextTitle(p: QuizPending, game: GameState): string {
  const name = (id: string) => game.players.find((x) => x.id === id)?.name ?? "";
  switch (p.context.kind) {
    case "pramuka":
      return `Kuis Pramuka · hadiah ${rp(p.context.reward)}`;
    case "prestasi":
      return `Hadiah Prestasi · benar +${rp(p.context.reward)}`;
    case "pengambilalihan":
      return `Pertahankan wilayahmu dari ${name(p.context.attackerId)}!`;
    case "duelAttacker":
      return `Duel melawan ${name(p.context.targetId)} · Ronde 1`;
    case "duelTarget":
      return `Duel melawan ${name(p.context.attackerId)} · Ronde 2`;
  }
}

export default function QuizModal({
  game,
  pending,
  onAnswer,
  onClose,
}: {
  game: GameState;
  pending: QuizPending;
  onAnswer: (choice: number) => void;
  onClose: () => void;
}) {
  const q = game.questions[pending.quiz.questionId];
  const player = game.players.find((p) => p.id === pending.quiz.playerId)!;
  const answered = pending.quiz.chosen !== undefined;
  const needsHandoff = player.id !== game.players[game.current].id;
  const [ready, setReady] = useState(!needsHandoff || answered);
  const [left, setLeft] = useState(LIMIT);
  const sent = useRef(false);
  const answerRef = useRef(onAnswer);
  answerRef.current = onAnswer;

  useEffect(() => {
    sent.current = false;
    setLeft(LIMIT);
    setReady(!needsHandoff || answered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.quiz.questionId]);

  useEffect(() => {
    if (!ready || answered) return;
    const start = Date.now();
    const t = setInterval(() => {
      const remain = Math.max(0, LIMIT - (Date.now() - start) / 1000);
      setLeft(remain);
      if (remain <= 0 && !sent.current) {
        sent.current = true;
        clearInterval(t);
        play("wrong");
        answerRef.current(-1);
      }
    }, 100);
    return () => clearInterval(t);
  }, [ready, answered, pending.quiz.questionId]);

  function choose(i: number) {
    if (answered || sent.current) return;
    sent.current = true;
    play(i === q.answer ? "correct" : "wrong");
    onAnswer(i);
  }

  const pct = (left / LIMIT) * 100;
  return (
    <Modal open label="Soal Pramuka" dismissable={false} className="max-w-xl">
      <div className="bg-gradient-to-br from-[#4A2A73] to-[#7B4CB0] px-5 pb-5 pt-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ActorBadge player={player} label="Penjawab" />
          <span className="chip bg-white/15 uppercase tracking-wider">
            <BookOpen size={12} /> {q.topic} · {q.difficulty}
          </span>
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#EBDDFB]">{contextTitle(pending, game)}</p>
        {ready && (
          <div className="mt-3 flex items-center gap-3">
            <Hourglass size={18} className={left < 6 && !answered ? "animate-pulse text-red-300" : ""} />
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full rounded-full"
                style={{ width: `${answered ? 100 : pct}%`, background: left < 6 ? "#F87171" : "#D6A64F" }}
              />
            </div>
            <span className="w-8 text-right font-display font-extrabold tabular-nums">{answered ? "—" : Math.ceil(left)}</span>
          </div>
        )}
      </div>

      {!ready ? (
        <div className="p-6 text-center">
          <p className="text-lg font-bold text-forest">Serahkan perangkat kepada</p>
          <p className="mt-1 font-display text-3xl font-extrabold" style={{ color: player.color }}>
            {player.avatar} {player.name}
          </p>
          <p className="mt-2 text-sm text-ink/60">Waktu 20 detik dimulai setelah tombol ditekan.</p>
          <button className="btn-gold mt-6" onClick={() => setReady(true)}>
            Saya siap!
          </button>
        </div>
      ) : (
        <div className="p-5">
          <h3 className="font-display text-xl font-extrabold leading-snug text-ink">{q.question}</h3>
          <div className="mt-4 grid gap-2.5">
            {q.options.map((opt, i) => {
              const isAnswer = answered && i === q.answer;
              const isWrongPick = answered && i === pending.quiz.chosen && i !== q.answer;
              return (
                <motion.button
                  key={i}
                  whileHover={!answered ? { scale: 1.015 } : undefined}
                  whileTap={!answered ? { scale: 0.98 } : undefined}
                  animate={isWrongPick ? { x: [0, -6, 6, -4, 0] } : undefined}
                  disabled={answered}
                  onClick={() => choose(i)}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition ${
                    isAnswer
                      ? "border-green-600 bg-green-100 text-green-900"
                      : isWrongPick
                        ? "border-red-500 bg-red-100 text-red-900"
                        : answered
                          ? "border-transparent bg-white/60 text-ink/50"
                          : "border-forest/10 bg-white text-ink hover:border-[#7B4CB0]"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-display font-extrabold ${
                      isAnswer ? "bg-green-600 text-white" : isWrongPick ? "bg-red-500 text-white" : "bg-[#EBDDFB] text-[#4A2A73]"
                    }`}
                  >
                    {isAnswer ? <Check size={18} /> : isWrongPick ? <X size={18} /> : LETTERS[i]}
                  </span>
                  {opt}
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                <div className={`rounded-2xl p-4 ${pending.quiz.correct ? "bg-green-50 ring-2 ring-green-500" : "bg-red-50 ring-2 ring-red-400"}`}>
                  <p className={`font-display text-lg font-extrabold ${pending.quiz.correct ? "text-green-800" : "text-red-800"}`}>
                    {pending.quiz.chosen === -1 ? "Waktu habis!" : pending.quiz.correct ? "Jawaban benar!" : "Jawaban salah!"}{" "}
                    <span className="text-base">{pending.quiz.outcome}</span>
                  </p>
                  <p className="mt-1 text-sm text-ink/75">{q.explanation}</p>
                </div>
                <button className="btn-gold w-full" onClick={onClose}>
                  Lanjutkan
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Modal>
  );
}
