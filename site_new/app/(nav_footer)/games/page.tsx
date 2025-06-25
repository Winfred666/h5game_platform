import React from "react";

import GameCards from '@/components/GameCards';
import { getGamesByTitle, getGamesByTag, getGameByTagCount } from "@/lib/services/getGame";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ name?: string, tag?: string, page?: string}> }) {
  const { name, tag, page } = await searchParams;
  const curPage = parseInt(page || "1") - 1;
  const [games_name, games_tag, tag_counts] = await Promise.all([
    name ? getGamesByTitle(name) : [],
    tag ? getGamesByTag(tag, curPage) : [],
    tag ? getGameByTagCount(tag) : 0
  ]);
  
  // merge the two results
  const games = [...games_name, ...games_tag];

  return (
    <div className="flex flex-col grow">
      <div className="m-4">
        { name && (
          <h2>
            “{name}”的搜索结果
          </h2>
        )}
        { tag && (
          <h2>
            标签“{tag}”的搜索结果
          </h2>
        )}
      </div>
      <div className="m-4">
        <GameCards games={games} currentPage={curPage} pageSize={20} totalCount={tag_counts} />
      </div>
    </div>
  );
}