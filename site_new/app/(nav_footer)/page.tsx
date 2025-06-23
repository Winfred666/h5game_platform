import { getAllGames, getAllTags, getTopGames } from "@/lib/services/getGame";
import GameSwiper from "./GameSwiper";

export default async function Home() {
  // it is server component, just wait for all data.
  const [top_games,all_games,all_tags] = await Promise.all([
    getTopGames(), getAllGames(0), getAllTags()]);
  
  return (
    <div className="flex flex-col grow mb-6">
      <div className="mx-auto w-full">
          <GameSwiper swipers={top_games} />
      </div>
    </div>
  );
}
