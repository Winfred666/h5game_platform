import React from 'react';

import ImageSwiper from '@/components/ImageSwiper';
import { getAllGames, getAllTags, getTopGames } from '@/services/game';
import { ALL_NAVPATH } from "@/services/router_info";
import PagedGames from './PagedGames';
import GameTags from '@/components/GameTags';

export default async function Home() {
  const [top_games,all_games,all_tags] = await Promise.all([
    getTopGames(), getAllGames(), getAllTags()]);
  // const I = await new Promise(resolve=>setTimeout(resolve, 3000)); // wait for the promise to resolve

  const swipers = top_games.map((game) => ({
    src: game.cover_image,
    link: ALL_NAVPATH.game_id.href(game.id),
    title: game.title,
    screenshots: game.screenshots,
    tags: game.tags,
    online: (game.online ? true : false),
    developers: game.joinDevelopers,
  }));

  return (
    <div className="flex flex-col grow mb-6">
      <div className=" ">
        <div className="mx-auto w-full">
          <ImageSwiper swipers={swipers} />
        </div>
      </div>
      <div className="flex flex-col m-6 gap-6">
        {/* use pagination to show part of the game */}
        <PagedGames games={all_games} pageSize={20} />
        <GameTags id="main" tags={all_tags} color="default"/>
      </div>
    </div>
  );
}