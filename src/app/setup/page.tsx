import type { Metadata } from "next";
import GameSetup from "@/components/setup/GameSetup";

export const metadata: Metadata = { title: "Persiapan Permainan · Monopoli Nusantara" };

export default function SetupPage() {
  return <GameSetup />;
}
