import React from "react";

import GameCards from '@/components/GameCards';
import { getGamesByTitle, getGamesByTag, getGameByTagCount } from "@/lib/querys&actions/getGame";
import { getTagById } from "@/lib/querys&actions/getTag";
import { GAME_PAGE_SIZE } from "@/lib/clientConfig";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ name?: string, tag?: string, page?: string}> }) {
  const { name, tag, page } = await searchParams;
  const curPage = parseInt(page || "1");
  const tagId = tag ?? undefined;
  const [games_name, tag_name, games_tag, tag_counts] = await Promise.all([
    name ? getGamesByTitle(name) : [],
    tagId ? getTagById(tagId) : undefined,
    tagId ? getGamesByTag(tagId, curPage, GAME_PAGE_SIZE) : [],
    tagId ? getGameByTagCount(tagId) : 0
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
        { tag_name && (
          <h2>
            标签“{tag_name.name}”的搜索结果
          </h2>
        )}
      </div>
      <div className="m-4">
        <GameCards games={games} currentPage={curPage} pageSize={GAME_PAGE_SIZE} totalCount={tag_counts} />
      </div>
    </div>
  );
}
