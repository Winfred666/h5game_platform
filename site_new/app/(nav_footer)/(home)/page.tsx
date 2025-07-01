import GameCards from "@/components/GameCards";
import { getAllGames, getGameCount } from "@/lib/actions/getGame";


// deal with pagination.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const {page} = await searchParams;
  const curPage = parseInt(page || "1") - 1; // page start from 1 while index from 0.
  const pageSize = 30; // assuming page size is 30
  // it is server component, just wait for all data.
  let [pagedGames, gameCount] = await Promise.all([
    getAllGames(curPage, pageSize),
    getGameCount(),
  ]);

  return (
      <GameCards games={pagedGames} currentPage={curPage} pageSize={pageSize} totalCount={gameCount}/>
  );
}
