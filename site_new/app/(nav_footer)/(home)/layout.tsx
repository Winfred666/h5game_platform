import { getAllTags, getTopGames } from "@/lib/actions/getGame";
import GameSwiper from "./GameSwiper";
import GameTags from "@/components/GameTags";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let [top_games, all_tags] = await Promise.all([
    getTopGames(),
    getAllTags(),
  ]);
  // await new Promise((resolve) => setTimeout(resolve, 10000000)); // Simulate delay for demo purposes
  return (
    <div className="flex flex-col grow mb-6 gap-4">
      <div className="mx-auto w-full">
        <GameSwiper swipers={top_games} />
      </div>
      <div className="mx-4 space-y-4">
        <h2>最新游戏</h2>
        {children}
        <h2>全部分类</h2>
        <GameTags id="all_tag" tags={all_tags} color="default" />
      </div>
    </div>
  );
}
