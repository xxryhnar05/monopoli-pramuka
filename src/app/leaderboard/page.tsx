import type { Metadata } from "next";
import LeaderboardPage from "@/components/leaderboard/LeaderboardPage";

export const metadata: Metadata = { title: "Leaderboard · Monopoli Nusantara" };

export default function Page() {
  return <LeaderboardPage />;
}
