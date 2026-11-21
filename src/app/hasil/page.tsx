import type { Metadata } from "next";
import VictoryScreen from "@/components/result/VictoryScreen";

export const metadata: Metadata = { title: "Hasil Permainan · Monopoli Nusantara" };

export default function ResultPage() {
  return <VictoryScreen />;
}
