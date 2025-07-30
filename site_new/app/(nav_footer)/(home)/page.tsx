import GameCards from "@/components/GameCards";
import { GAME_PAGE_SIZE } from "@/lib/clientConfig";
import { getAllGames, getGameCount } from "@/lib/querys&actions/getGame";


// deal with pagination.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const {page} = await searchParams;
  const curPage = parseInt(page || "1") - 1; // page start from 1 while index from 0.
  // it is server component, just wait for all data.
  const [pagedGames, gameCount] = await Promise.all([
    getAllGames(curPage, GAME_PAGE_SIZE),
    getGameCount(),
  ]);

  return (
      <GameCards games={pagedGames} currentPage={curPage} pageSize={GAME_PAGE_SIZE} totalCount={gameCount}/>
  );
}
