import { getAllUnauditGames } from "@/lib/querys&actions/getGame";
import GameReviewTab from "./GameReviewTab";

export default async function AdminReviewPage() {
  const games = await getAllUnauditGames();
  return (
    <GameReviewTab games={games} />
  )
}