"use client";
import * as E from "@/engine";
import type { GameState } from "@/engine/types";
import { play } from "@/lib/sound";
import { useGame } from "@/store/gameStore";
import AttackModal from "./AttackModal";
import BuildingModal from "./BuildingModal";
import ChanceCardModal from "./ChanceCard";
import DebtModal from "./DebtModal";
import DefenseModal from "./DefenseModal";
import NoticeModal from "./NoticeModal";
import PropertyModal from "./PropertyModal";
import QuizModal from "./QuizModal";
import RentChoiceModal from "./RentChoiceModal";

/** Menampilkan jendela aksi sesuai antrean teratas permainan. */
export default function PendingLayer({ game, onManage }: { game: GameState; onManage: () => void }) {
  const act = useGame((s) => s.act);
  const top = game.pending[0];
  if (!top || game.phase === "gameover") return null;
  const player = (id: string) => game.players.find((p) => p.id === id)!;

  switch (top.kind) {
    case "buy":
      return (
        <PropertyModal
          game={game}
          tileId={top.tileId}
          player={player(top.playerId)}
          onBuy={() => act(E.buyProperty) && play("buy")}
          onSkip={() => {
            play("click");
            act(E.skipBuy);
          }}
          onManage={onManage}
        />
      );
    case "card":
      return (
        <ChanceCardModal
          key={top.cardId + game.turn}
          card={game.cards[top.cardId]}
          player={player(top.playerId)}
          onResolve={() => {
            const card = game.cards[top.cardId];
            if (act(E.resolveCard)) {
              if (card.category === "pertahanan") play("shield");
              else if (card.category === "serangan" && card.effect === "penyerbuan") play("attack");
              else if (card.category === "ekonomi" || card.category === "dana") play("coin");
            }
          }}
        />
      );
    case "target":
      return (
        <AttackModal
          game={game}
          card={game.cards[top.cardId]}
          attacker={player(top.playerId)}
          onTarget={(id) => act((s) => E.chooseTarget(s, id)) && play("attack")}
        />
      );
    case "defend":
      return (
        <DefenseModal
          game={game}
          card={game.cards[top.cardId]}
          attacker={player(top.attackerId)}
          target={player(top.targetId)}
          onDefend={(cid) => act((s) => E.defend(s, cid))}
        />
      );
    case "quiz":
      return (
        <QuizModal
          key={`${top.quiz.questionId}-${top.quiz.playerId}-${top.context.kind}-${game.turn}`}
          game={game}
          pending={top}
          onAnswer={(c) => act((s) => E.answerQuiz(s, c))}
          onClose={() => act(E.closeQuiz)}
        />
      );
    case "rentChoice":
      return (
        <RentChoiceModal
          game={game}
          player={player(top.playerId)}
          tileId={top.tileId}
          amount={top.amount}
          ownerId={top.ownerId}
          onChoose={(use) => act((s) => E.rentChoice(s, use)) && play(use ? "shield" : "rent")}
        />
      );
    case "debt":
      return (
        <DebtModal
          game={game}
          player={player(top.playerId)}
          amount={top.amount}
          creditorId={top.creditorId}
          reason={top.reason}
          onPay={() => act(E.settleDebt) && play("rent")}
          onBankrupt={() => act(E.declareBankruptcy) && play("wrong")}
        />
      );
    case "develop":
      return (
        <BuildingModal
          game={game}
          tileId={top.tileId}
          player={player(top.playerId)}
          onChoose={(build) => act((s) => E.developChoice(s, build)) && build && play("buy")}
        />
      );
    case "notice":
      return <NoticeModal title={top.title} message={top.message} tone={top.tone} onClose={() => act(E.dismissNotice)} />;
  }
}
