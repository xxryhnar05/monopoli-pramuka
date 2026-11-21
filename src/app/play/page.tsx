import type { Metadata } from "next";
import GameScreen from "@/components/game/GameScreen";

export const metadata: Metadata = { title: "Bermain · Monopoli Nusantara" };

export default function PlayPage() {
  return <GameScreen />;
}
