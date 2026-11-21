"use client";
import { BookOpen, Coins as CoinsIcon, KeyRound, Layers, LogOut, Pencil, Plus, RotateCcw, Tag, Trash2, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Logo from "@/components/art/Logo";
import { LeaderTable } from "@/components/leaderboard/LeaderboardPage";
import ConfirmButton from "@/components/ui/ConfirmButton";
import Modal from "@/components/ui/Modal";
import { BOARD, GROUPS } from "@/data/board";
import { CATEGORY_STYLE, CHANCE_CARDS, COUNT_VALUE_EFFECTS, FUND_CARDS, cardText } from "@/data/cards";
import { rp } from "@/engine/utils";
import type { Difficulty, Question } from "@/engine/types";
import { useHydrated } from "@/hooks/useHydrated";
import { clearLocal, readLocal, sortRows, type LeaderRow } from "@/lib/leaderboard";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { DEFAULT_ECONOMY, DEFAULT_REWARDS, useContent } from "@/store/contentStore";

const LOCAL_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "pramuka2026";
const SESSION_KEY = "mn-admin";

type Tab = "soal" | "hadiah" | "kartu" | "harga" | "leaderboard";

function Login({ onOk }: { onOk: () => void }) {
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (isSupabaseConfigured) {
      setBusy(true);
      const { error } = await getSupabase()!.auth.signInWithPassword({ email, password: pin });
      setBusy(false);
      if (error) return setErr(error.message);
      onOk();
    } else if (pin === LOCAL_PIN) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onOk();
    } else setErr("PIN salah.");
  }

  return (
    <div className="topo grid min-h-dvh place-items-center bg-gradient-to-br from-deep to-forest p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-cream p-6 shadow-card">
        <Logo />
        <h1 className="mt-6 flex items-center gap-2 font-display text-2xl font-extrabold text-forest">
          <KeyRound /> Panel Admin
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          {isSupabaseConfigured ? "Masuk dengan akun admin Supabase." : "Masukkan PIN admin pengelola stan."}
        </p>
        {isSupabaseConfigured && (
          <>
            <label className="label mt-4" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </>
        )}
        <label className="label mt-4" htmlFor="pin">{isSupabaseConfigured ? "Kata sandi" : "PIN"}</label>
        <input id="pin" type="password" className="input" value={pin} onChange={(e) => setPin(e.target.value)} required />
        {err && <p className="mt-3 text-sm font-semibold text-red-700">{err}</p>}
        <button className="btn-green mt-5 w-full" disabled={busy}>
          {busy ? "Memeriksa…" : "Masuk"}
        </button>
        {!isSupabaseConfigured && (
          <p className="mt-4 text-[11px] leading-relaxed text-ink/50">
            Tanpa backend, PIN hanya mengunci tampilan di perangkat ini dan perubahan tersimpan di browser ini saja. Atur
            NEXT_PUBLIC_ADMIN_PIN untuk mengganti PIN bawaan.
          </p>
        )}
        <Link href="/" className="mt-4 block text-center text-sm font-semibold text-forest underline">
          Kembali ke beranda
        </Link>
      </form>
    </div>
  );
}

function NumField({ id, label, value, onChange, step, max }: { id: string; label: string; value: number; onChange: (v: number) => void; step: number; max?: number }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={0}
        max={max}
        step={step}
        className="input"
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max ?? Infinity, Number(e.target.value) || 0)))}
      />
      {step >= 1000 && <span className="mt-1 block text-[11px] text-ink/50">{rp(value)}</span>}
    </div>
  );
}

const EMPTY_Q: Question = {
  id: "",
  topic: "",
  difficulty: "mudah",
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  explanation: "",
};

function QuestionForm({ initial, onSave, onCancel }: { initial: Question; onSave: (q: Question) => void; onCancel: () => void }) {
  const [q, setQ] = useState<Question>(initial);
  const [err, setErr] = useState<string | null>(null);
  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!q.topic.trim() || !q.question.trim() || q.options.some((o) => !o.trim()) || !q.explanation.trim())
      return setErr("Semua kolom wajib diisi, termasuk keempat opsi dan penjelasan.");
    if (new Set(q.options.map((o) => o.trim().toLowerCase())).size < 4) return setErr("Opsi jawaban tidak boleh sama.");
    onSave({ ...q, id: q.id || `u${Date.now().toString(36)}` });
  }
  return (
    <form onSubmit={save} className="space-y-3 p-5 pt-12">
      <h3 className="font-display text-xl font-extrabold text-forest">{initial.id ? "Edit soal" : "Tambah soal"}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="topic">Topik</label>
          <input id="topic" className="input" value={q.topic} onChange={(e) => setQ({ ...q, topic: e.target.value })} placeholder="mis. Sandi Morse" />
        </div>
        <div>
          <label className="label" htmlFor="diff">Tingkat</label>
          <select id="diff" className="input" value={q.difficulty} onChange={(e) => setQ({ ...q, difficulty: e.target.value as Difficulty })}>
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="qq">Pertanyaan</label>
        <textarea id="qq" className="input min-h-20" value={q.question} onChange={(e) => setQ({ ...q, question: e.target.value })} />
      </div>
      <fieldset>
        <legend className="label">Opsi jawaban (pilih kunci)</legend>
        <div className="space-y-2">
          {q.options.map((o, i) => (
            <label key={i} className="flex items-center gap-2">
              <input type="radio" name="answer" checked={q.answer === i} onChange={() => setQ({ ...q, answer: i as Question["answer"] })} className="h-4 w-4 accent-[#174D36]" />
              <span className="w-5 font-bold text-forest">{"ABCD"[i]}</span>
              <input
                className="input !py-2"
                value={o}
                onChange={(e) => {
                  const opts = [...q.options] as Question["options"];
                  opts[i] = e.target.value;
                  setQ({ ...q, options: opts });
                }}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="exp">Penjelasan singkat</label>
        <textarea id="exp" className="input min-h-16" value={q.explanation} onChange={(e) => setQ({ ...q, explanation: e.target.value })} />
      </div>
      {err && <p className="text-sm font-semibold text-red-700">{err}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Batal
        </button>
        <button className="btn-green">Simpan</button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const hydrated = useHydrated();
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("soal");
  const c = useContent();
  const [editing, setEditing] = useState<Question | null>(null);
  const [filter, setFilter] = useState<"semua" | Difficulty>("semua");
  const [rows, setRows] = useState<LeaderRow[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (isSupabaseConfigured) {
      getSupabase()!.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    } else setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
    setRows(sortRows(readLocal()));
  }, [hydrated]);

  const shown = useMemo(() => c.questions.filter((q) => filter === "semua" || q.difficulty === filter), [c.questions, filter]);

  if (!hydrated) return <div className="paper min-h-dvh" />;
  if (!authed) return <Login onOk={() => setAuthed(true)} />;

  async function logout() {
    if (isSupabaseConfigured) await getSupabase()!.auth.signOut();
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }

  const TABS: { key: Tab; label: string; Icon: typeof BookOpen }[] = [
    { key: "soal", label: "Soal Pramuka", Icon: BookOpen },
    { key: "hadiah", label: "Ekonomi & Pajak", Icon: CoinsIcon },
    { key: "kartu", label: "Kartu", Icon: Layers },
    { key: "harga", label: "Harga Properti", Icon: Tag },
    { key: "leaderboard", label: "Leaderboard", Icon: Trophy },
  ];
  const counts = { mudah: 0, sedang: 0, sulit: 0 };
  for (const q of c.questions) counts[q.difficulty]++;

  return (
    <div className="paper min-h-dvh">
      <header className="topo bg-gradient-to-r from-deep to-forest">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/">
            <Logo light compact />
          </Link>
          <div className="flex items-center gap-2">
            <span className="chip hidden bg-gold text-deep sm:inline-flex">Panel Admin</span>
            <button onClick={logout} className="rounded-xl p-2 text-cream hover:bg-cream/10" aria-label="Keluar">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                tab === key ? "bg-forest text-gold-light shadow-soft" : "bg-white text-forest ring-1 ring-forest/10 hover:ring-forest/30"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <p className="mt-2 text-xs text-ink/50">Perubahan berlaku untuk permainan baru berikutnya. Disimpan di browser perangkat ini.</p>

        {tab === "soal" && (
          <section className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {(["semua", "mudah", "sedang", "sulit"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`chip !py-1.5 capitalize ${filter === f ? "bg-forest text-cream" : "bg-white text-forest ring-1 ring-forest/10"}`}>
                    {f} {f !== "semua" && `(${counts[f]})`}
                    {f === "semua" && `(${c.questions.length})`}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <ConfirmButton confirmText="Kembalikan 50 soal bawaan" className="btn-ghost !py-2 text-sm" onConfirm={c.resetQuestions}>
                  <RotateCcw size={16} /> Reset
                </ConfirmButton>
                <button className="btn-green !py-2 text-sm" onClick={() => setEditing(EMPTY_Q)}>
                  <Plus size={16} /> Tambah Soal
                </button>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {shown.map((q) => (
                <li key={q.id} className="card-paper flex flex-wrap items-start gap-3 p-4">
                  <span className={`chip capitalize ${q.difficulty === "mudah" ? "bg-green-100 text-green-800" : q.difficulty === "sedang" ? "bg-gold/25 text-wood" : "bg-red-100 text-red-800"}`}>
                    {q.difficulty}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{q.question}</p>
                    <p className="mt-1 text-xs text-ink/60">
                      {q.topic} · Kunci: <b>{"ABCD"[q.answer]}. {q.options[q.answer]}</b>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button className="rounded-lg bg-white p-2 text-forest ring-1 ring-forest/10 hover:bg-cream" onClick={() => setEditing(q)} aria-label="Edit soal">
                      <Pencil size={15} />
                    </button>
                    <ConfirmButton confirmText="Hapus" className="rounded-lg bg-white p-2 text-red-700 ring-1 ring-red-200 hover:bg-red-50" onConfirm={() => c.deleteQuestion(q.id)}>
                      <Trash2 size={15} />
                    </ConfirmButton>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === "hadiah" && (
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="card-paper p-6">
              <h2 className="font-display text-xl font-extrabold text-forest">Ekonomi</h2>
              <p className="text-xs text-ink/55">Saldo lebih kecil = pemain lebih cepat bangkrut.</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {(
                  [
                    ["startingCoins", "Saldo awal (Rp)"],
                    ["startBonus", "Uang saku START (Rp)"],
                    ["campFee", "Biaya keluar Pos Kemah (Rp)"],
                  ] as const
                ).map(([k, label]) => (
                  <NumField key={k} id={k} label={label} step={10_000} value={c.economy[k]} onChange={(v) => c.setEconomy({ ...c.economy, [k]: v })} />
                ))}
              </div>
            </div>
            <div className="card-paper p-6">
              <h2 className="font-display text-xl font-extrabold text-forest">Pajak</h2>
              <p className="text-xs text-ink/55">Isi 0 untuk mematikan pajak tertentu.</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {(
                  [
                    ["purchasePct", "PPN pembelian (%)", 1],
                    ["rentPct", "Pajak sewa (%)", 1],
                    ["landPerTile", "PBB per wilayah (Rp)", 5_000],
                    ["landPerBuilding", "PBB per bangunan (Rp)", 5_000],
                  ] as const
                ).map(([k, label, step]) => (
                  <NumField
                    key={k}
                    id={k}
                    label={label}
                    step={step}
                    max={k.endsWith("Pct") ? 50 : undefined}
                    value={c.economy.tax[k]}
                    onChange={(v) => c.setEconomy({ ...c.economy, tax: { ...c.economy.tax, [k]: v } })}
                  />
                ))}
              </div>
            </div>
            <div className="card-paper p-6">
              <h2 className="font-display text-xl font-extrabold text-forest">Hadiah kuis</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {(["mudah", "sedang", "sulit", "wrongPenalty"] as const).map((k) => (
                  <NumField
                    key={k}
                    id={k}
                    label={k === "wrongPenalty" ? "Penalti salah (Rp)" : `Benar · ${k} (Rp)`}
                    step={10_000}
                    value={c.rewards[k]}
                    onChange={(v) => c.setRewards({ ...c.rewards, [k]: v })}
                  />
                ))}
              </div>
            </div>
            <div className="card-paper flex flex-col justify-center gap-3 p-6">
              <p className="text-sm text-ink/70">Kembalikan semua nilai ekonomi, pajak, dan hadiah ke bawaan.</p>
              <button
                className="btn-ghost !py-2 text-sm"
                onClick={() => {
                  c.setRewards(DEFAULT_REWARDS);
                  c.setEconomy(DEFAULT_ECONOMY);
                }}
              >
                <RotateCcw size={16} /> Kembalikan bawaan
              </button>
            </div>
          </section>
        )}

        {tab === "kartu" && (
          <section className="mt-6 grid gap-3 md:grid-cols-2">
            {[...CHANCE_CARDS, ...FUND_CARDS].map((card) => {
              const o = c.cardOverrides[card.id] ?? {};
              const enabled = o.enabled ?? card.enabled ?? true;
              const st = CATEGORY_STYLE[card.category];
              return (
                <div key={card.id} className={`card-paper flex items-center gap-3 p-3 ${enabled ? "" : "opacity-50"}`}>
                  <span className="h-10 w-1.5 rounded-full" style={{ background: st.to }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-forest">
                      {card.id} · {card.title}
                    </p>
                    <p className="text-[11px] text-ink/50">
                      {st.label} · {cardText({ ...card, value: o.value ?? card.value })}
                    </p>
                  </div>
                  {card.value !== undefined && (
                    <input
                      type="number"
                      aria-label={`Nilai ${card.title}${COUNT_VALUE_EFFECTS.has(card.effect) ? "" : " (Rp)"}`}
                      title={COUNT_VALUE_EFFECTS.has(card.effect) ? "Jumlah langkah/giliran" : "Nominal rupiah"}
                      className="input !w-28 !py-1.5 text-sm"
                      min={0}
                      step={COUNT_VALUE_EFFECTS.has(card.effect) ? 1 : 10_000}
                      value={o.value ?? card.value}
                      onChange={(e) => c.setCardOverride(card.id, { value: Math.max(0, Number(e.target.value) || 0) })}
                    />
                  )}
                  <button
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`Aktifkan ${card.title}`}
                    onClick={() => c.setCardOverride(card.id, { enabled: !enabled })}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-forest" : "bg-ink/20"}`}
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? "left-6" : "left-1"}`} />
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {tab === "harga" && (
          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BOARD.filter((t) => t.price !== undefined).map((t) => (
              <div key={t.id} className="card-paper flex items-center gap-3 p-3">
                <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: t.group ? GROUPS[t.group].color : "#5C9BC7" }} />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-forest">{t.name}</span>
                <input
                  type="number"
                  min={10_000}
                  max={5_000_000}
                  step={10_000}
                  aria-label={`Harga ${t.name} (Rp)`}
                  title={rp(c.priceOverrides[t.id] ?? t.price ?? 0)}
                  className="input !w-32 !py-1.5 text-sm"
                  value={c.priceOverrides[t.id] ?? t.price}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    c.setPrice(t.id, !v || v === t.price ? null : Math.max(10_000, v));
                  }}
                />
              </div>
            ))}
          </section>
        )}

        {tab === "leaderboard" && (
          <section className="mt-6">
            <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
              <LeaderTable rows={rows} />
            </div>
            <ConfirmButton
              confirmText="Hapus semua data lokal"
              className="btn-ghost mt-4 !py-2 text-sm !text-red-700"
              onConfirm={() => {
                clearLocal();
                setRows([]);
              }}
            >
              <Trash2 size={16} /> Reset leaderboard perangkat ini
            </ConfirmButton>
          </section>
        )}
      </main>

      <Modal open={editing !== null} onClose={() => setEditing(null)} label="Form soal" className="max-w-xl">
        {editing && (
          <QuestionForm
            key={editing.id || "new"}
            initial={editing}
            onCancel={() => setEditing(null)}
            onSave={(q) => {
              c.upsertQuestion(q);
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
