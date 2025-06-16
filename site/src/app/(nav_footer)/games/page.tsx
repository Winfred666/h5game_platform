import React from "react";

import { Typography, } from "@mui/material";
import GameCards from '@/components/GameCards';
import { getGamesByName, getGamesByTag } from "@/services/game";

// games?name=1或games?tag=2. 参数name是游戏名(只要包含此字串即可),tag是标签名

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ name?: string, tag?: string }> }) {
  const { name, tag } = await searchParams;//动态路由如[gameId]用params,而查询参数用searchParams
  const [games_name, games_tag] = await Promise.all([
    getGamesByName(name),
    getGamesByTag(tag)
  ]);
  // merge the two results
  const games = [...games_name, ...games_tag];

  return (
    <div className="flex flex-col grow">
      <div className="ml-5 mt-5">
        { name && (
          <Typography variant="h4" gutterBottom>
            “{name}”的搜索结果
          </Typography>
        )}
        { tag && (
          <Typography variant="h4" gutterBottom>
            标签“{tag}”的搜索结果
          </Typography>
        )}
      </div>
      <div className="ml-5 mr-5">
        <GameCards games={games} />
      </div>
    </div>
  );
}