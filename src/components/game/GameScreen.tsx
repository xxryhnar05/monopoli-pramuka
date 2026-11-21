"use client";
import { rpShort } from "@/engine/utils";
import { PanelBottomOpen, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Toasts from "@/components/ui/Toasts";
import { Coins } from "@/components/ui/Coin";
import * as E from "@/engine";
import { useHydrated } from "@/hooks/useHydrated";
import { play } from "@/lib/sound";
import { useGame } from "@/store/gameStore";
import { useSettings } from "@/store/settingsStore";
import CenterStage, { TurnControls, type TurnHandlers } from "./CenterStage";
import GameBoard from "./GameBoard";
import GameSettings from "./GameSettings";
import PendingLayer from "./PendingLayer";
import PlayerAssets from "./PlayerAssets";
import PlayerDashboard, { StatusBadges } from "./PlayerDashboard";
import SidePanel, { type SideTab } from "./SidePanel";
import TileInfoModal from "./TileInfoModal";
import TopBar from "./TopBar";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function GameScreen() {
  const hydrated = useHydrated();
  const router = useRouter();
  const game = useGame((s) => s.game);
  const act = useGame((s) => s.act);
  const toast = useGame((s) => s.toast);
  const fast = useSettings((s) => s.fastAnimations);

  const [now, setNow] = useState(() => Date.now());
  const [rolling, setRolling] = useState(false);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [highlight, setHighlight] = useState<number | null>(null);
  const [tileInfo, setTileInfo] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [playerView, setPlayerView] = useState<string | null>(null);
  const [tab, setTab] = useState<SideTab>("properti");
  const [drawer, setDrawer] = useState<null | "pemain" | "panel">(null);
  const animating = useRef(false);
  const lastLog = useRef<number | null>(null);

  // ---- jam & batas waktu
  useEffect(() => {
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      const g = useGame.getState().game;
      if (g && g.endsAt && n >= g.endsAt && g.phase !== "gameover" && g.phase !== "moving") {
        useGame.getState().act((s) => E.checkTime(s, n));
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ---- animasi dadu & pion
  const phase = game?.phase;
  const move = game?.move;
  useEffect(() => {
    if (phase !== "moving" || !move || animating.current) return;
    animating.current = true;
    let cancelled = false;
    (async () => {
      setRolling(true);
      play("dice");
      await wait(fast ? 350 : 900);
      if (cancelled) return;
      setRolling(false);
      const dir = move.steps >= 0 ? 1 : -1;
      for (let k = 1; k <= Math.abs(move.steps); k++) {
        if (cancelled) return;
        setPositions({ [move.playerId]: (((move.from + dir * k) % 40) + 40) % 40 });
        play("step");
        await wait(fast ? 70 : 190);
      }
      await wait(fast ? 60 : 220);
      if (cancelled) return;
      const ok = useGame.getState().act(E.finishMove);
      const g = useGame.getState().game;
      setPositions({});
      animating.current = false;
      if (ok && g) {
        const p = g.players.find((x) => x.id === move.playerId);
        if (p) {
          setHighlight(p.position);
          setTimeout(() => setHighlight(null), 1600);
        }
      }
    })();
    return () => {
      cancelled = true;
      animating.current = false;
      setRolling(false);
    };
  }, [phase, move, fast]);

  // ---- notifikasi transaksi dari log
  useEffect(() => {
    if (!game) return;
    const top = game.log[0]?.id ?? 0;
    if (lastLog.current === null) {
      lastLog.current = top;
      return;
    }
    if (top <= lastLog.current) return;
    const fresh = game.log.filter((l) => l.id > lastLog.current!).reverse();
    lastLog.current = top;
    let rentSound = false;
    for (const l of fresh.slice(-3)) {
      if (l.text.includes("sewa") && l.tone === "bad") rentSound = true;
      if ((l.tone === "good" || l.tone === "bad") && (l.text.includes("Rp") || l.text.includes("BANGKRUT"))) toast(l.text, l.tone);
    }
    if (rentSound) play("rent");
  }, [game, toast]);

  // ---- akhir permainan
  const routerRef = useRef(router);
  routerRef.current = router;
  useEffect(() => {
    if (phase !== "gameover") return;
    const t = setTimeout(() => routerRef.current.push("/hasil"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  const handlers: TurnHandlers = {
    onRoll: useCallback(() => {
      play("click");
      act(E.rollDice);
    }, [act]),
    onEndTurn: useCallback(() => {
      play("click");
      act((s) => E.endTurn(s, Date.now()));
    }, [act]),
    onPayCamp: useCallback(() => act(E.payCampFee) && play("coin"), [act]),
    onEvacuate: useCallback(() => act(E.useEvacuation) && play("shield"), [act]),
    onSkip: useCallback(() => act(E.skipTurn), [act]),
  };

  if (!hydrated) return <div className="paper grid min-h-dvh place-items-center text-forest">Memuat permainan…</div>;

  if (!game)
    return (
      <div className="paper grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-forest">Belum ada permainan</h1>
          <p className="mt-2 text-ink/70">Siapkan pemain terlebih dahulu.</p>
          <Link href="/setup" className="btn-gold mt-6">
            Mulai Petualangan
          </Link>
        </div>
      </div>
    );

  const current = game.players[game.current];
  const busy = rolling || game.phase === "moving";
  const viewPlayer = playerView ? game.players.find((p) => p.id === playerView) : null;

  return (
    <div className="paper min-h-dvh overflow-x-clip pb-28 lg:pb-6">
      <TopBar game={game} now={now} onSettings={() => setSettingsOpen(true)} />
      <Toasts />

      <main className="mx-auto max-w-[1600px] gap-4 p-2 sm:p-4 lg:grid lg:grid-cols-[260px_minmax(0,1fr)_320px] xl:grid-cols-[290px_minmax(0,1fr)_360px]">
        <aside className="hidden lg:block">
          <h2 className="mb-2 px-1 font-display text-sm font-extrabold uppercase tracking-widest text-wood">Pemain</h2>
          <PlayerDashboard game={game} onOpenPlayer={setPlayerView} />
        </aside>

        <section aria-label="Papan permainan" className="min-w-0">
          <GameBoard game={game} positions={positions} highlight={highlight} fast={fast} onSelectTile={setTileInfo}>
            <CenterStage game={game} rolling={rolling} busy={busy} h={handlers} />
          </GameBoard>
          {/* strip pemain untuk layar kecil */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin lg:hidden">
            {game.players.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setPlayerView(p.id)}
                className={`min-w-[150px] shrink-0 rounded-2xl p-2.5 text-left ${p.bankrupt ? "bg-white/40 opacity-60" : i === game.current ? "bg-white shadow-glow" : "bg-white/75 shadow-soft"}`}
              >
                <span className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg text-lg" style={{ background: `${p.color}33` }}>
                    {p.avatar}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold text-forest">{p.name}</span>
                    <Coins value={p.coins} size={12} className="text-xs text-wood" />
                  </span>
                </span>
                <StatusBadges p={p} />
              </button>
            ))}
          </div>
        </section>

        <aside className="sticky top-[68px] hidden h-[calc(100dvh-84px)] lg:block">
          <SidePanel game={game} tab={tab} onTab={setTab} onSelectTile={setTileInfo} />
        </aside>
      </main>

      {/* bilah aksi bawah (mobile/tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-wood/15 bg-cream/95 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 shadow-card backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl" style={{ background: `${current.color}33` }} title={current.name}>
            {current.avatar}
          </span>
          <div className="hidden min-w-0 flex-1 sm:block">
            <div className="truncate text-xs font-bold text-forest">{current.name}</div>
            <div className="text-[10px] text-ink/60">
              Putaran {game.round}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 justify-center sm:flex-none">
            <TurnControls game={game} busy={busy} h={handlers} compact />
          </div>
          <button aria-label="Pemain" className="rounded-xl bg-white p-2.5 text-forest shadow-soft" onClick={() => setDrawer("pemain")}>
            <Users size={18} />
          </button>
          <button aria-label="Panel properti, kartu, riwayat" className="rounded-xl bg-white p-2.5 text-forest shadow-soft" onClick={() => setDrawer("panel")}>
            <PanelBottomOpen size={18} />
          </button>
        </div>
      </div>

      <Modal open={drawer !== null} onClose={() => setDrawer(null)} label="Panel permainan" className="max-w-xl">
        <div className="h-[80dvh] p-4 pt-12">
          {drawer === "pemain" ? (
            <div className="h-full overflow-y-auto scrollbar-thin">
              <PlayerDashboard
                game={game}
                onOpenPlayer={(id) => {
                  setDrawer(null);
                  setPlayerView(id);
                }}
              />
            </div>
          ) : (
            <SidePanel
              game={game}
              tab={tab}
              onTab={setTab}
              onSelectTile={(id) => {
                setDrawer(null);
                setTileInfo(id);
              }}
            />
          )}
        </div>
      </Modal>

      <PendingLayer game={game} onManage={() => setManageOpen(true)} />

      <Modal open={manageOpen} onClose={() => setManageOpen(false)} label="Kelola properti">
        <div className="p-5 pt-12">
          <h3 className="mb-3 font-display text-xl font-extrabold text-forest">Kelola properti</h3>
          <PlayerAssets game={game} playerId={E.managerId(game) ?? current.id} />
        </div>
      </Modal>

      <Modal open={!!viewPlayer} onClose={() => setPlayerView(null)} label="Informasi pemain">
        {viewPlayer && (
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ background: `${viewPlayer.color}33` }}>
                {viewPlayer.avatar}
              </span>
              <div>
                <h3 className="font-display text-2xl font-extrabold text-forest">{viewPlayer.name}</h3>
                {viewPlayer.team && <p className="text-sm text-ink/60">{viewPlayer.team}</p>}
                <Coins value={viewPlayer.coins} className="text-wood" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-white p-2 shadow-soft">
                <div className="font-display text-lg font-extrabold text-forest">{rpShort(E.netWorth(game, viewPlayer.id))}</div>
                Kekayaan
              </div>
              <div className="rounded-xl bg-white p-2 shadow-soft">
                <div className="font-display text-lg font-extrabold text-forest">
                  {viewPlayer.stats.quizCorrect}/{viewPlayer.stats.quizAnswered}
                </div>
                Kuis benar
              </div>
              <div className="rounded-xl bg-white p-2 shadow-soft">
                <div className="font-display text-lg font-extrabold text-forest">{viewPlayer.stats.cardsUsed}</div>
                Kartu dipakai
              </div>
            </div>
            <StatusBadges p={viewPlayer} />
            <PlayerAssets game={game} playerId={viewPlayer.id} onSelectTile={setTileInfo} />
          </div>
        )}
      </Modal>

      <TileInfoModal game={game} tileId={tileInfo} onClose={() => setTileInfo(null)} />
      <GameSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onEndGame={() => {
          setSettingsOpen(false);
          act(E.forceEnd);
        }}
      />
    </div>
  );
}
