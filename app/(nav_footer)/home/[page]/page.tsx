import GameCards from "@/components/GameCards";
import { GAME_PAGE_SIZE } from "@/lib/clientConfig";
import { getAllGames, getGameCount } from "@/lib/querys&actions/getGame";
import { notFound } from "next/navigation";

// for static generation of all pages, no use as mostly runtime ISR, not SSG.
// https://nextjs.org/docs/app/api-reference/functions/generate-static-params#subset-of-paths-at-build-time
// export async function generateStaticParams(): Promise<{ page?: string }[]> {
//   const totalCount = await getGameCount();
//   let pageCount = Math.ceil(totalCount / GAME_PAGE_SIZE);
//   if (pageCount === 0) pageCount = 1; // at least one page even no game.
//   // No searchParams (visiting "/") -> empty params object.
//   console.log("generateStaticParams pageCount:", pageCount);
//   return Array.from({ length: pageCount }, (_, i) => ({
//     page: (i + 1).toString(),
//   }));
// }
export async function generateStaticParams() {
  return [];
}

// only generate those in generateStaticParams
// export const dynamicParams = false;

// deal with pagination.
export default async function Home({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page } = await params;
  const curPage = parseInt(page || "1"); // page start from 1 while index from 0.
  
  // Handle non-numeric or invalid page numbers immediately
  if (isNaN(curPage) || curPage < 1) {
    notFound();
  }

  // First, get the total count of games to determine the max valid page.
  const gameCount = await getGameCount();
  // Calculate the maximum valid page number.
  // Handle the case where there are no games (maxPage should be 1).
  const maxPage = Math.ceil(gameCount / GAME_PAGE_SIZE) || 1;

  // If the requested page is greater than the max possible page, show a 404.
  if (curPage > maxPage) {
    notFound();
  }

  // Only fetch the games for the page if the page number is valid.
  const pagedGames = await getAllGames(curPage, GAME_PAGE_SIZE);

  return (
    <GameCards
      games={pagedGames}
      currentPage={curPage}
      pageSize={GAME_PAGE_SIZE}
      totalCount={gameCount}
    />
  );
}
