import { getTopGames } from "@/lib/services/sgame";


export default function Home() {
  // it is server component, just wait for all data.
  const [top_games,all_games,all_tags] = await Promise.all([
    getTopGames(), getAllGames(0), getAllTags()]);
  return (
    <div className="flex flex-col grow mb-6">
      <div className="mx-auto w-full">
          <ImageSwiper swipers={swipers} />
      </div>
    </div>
  );
}
