import { getAllGames, getGameCount } from "@/lib/querys&actions/getGame";
import GameListedTab from "./GameListedTab";
import { GAME_PAGE_SIZE } from "@/lib/clientConfig";


// WARNING: this is exactly like (nav_footer)/(home)/page.tsx

export default async function AdminGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const {page} = await searchParams;
  const curPage = parseInt(page || "1"); // page start from 1 while index from 0.
  const [pagedGames, gameCount] = await Promise.all([
    getAllGames(curPage, GAME_PAGE_SIZE),
    getGameCount(),
  ]);
  
  return (
    <GameListedTab games={pagedGames} currentPage={curPage} pageSize={GAME_PAGE_SIZE} totalCount={gameCount} />
  )
}