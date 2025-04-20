import Image from "next/image";

import React from 'react';

import { Typography } from "@mui/material";

import ImageSwiper from '@/components/ImageSwiper';
//import ImageCarousel from '@/components/ImageCarousel';
import GameCards from '@/components/GameCards';
import { getTopGames } from '@/services/game';
import { IGameTag } from '@/types/igame';

export default async function Home() {

  const games = await getTopGames(1, 2); 

  //const cover_imgs = games.map((game) => game.cover_image);

  //const links = games.map((game) => "/game/" + game.id);


  const swipers = games.map((game) => ({
    src: game.cover_image,
    link: "/games/" + game.id,
    title: game.title,
    screenshots: game.screenshots,
    tags: Array.isArray(game.tags) ? game.tags.flatMap((tag) => tag.name) : [],
    online: (game.online ? true : false)
  }));

  return (
    <div className="flex flex-col grow">
      <div className="bg-gradient-to-b from-black to-gray-500">
        <div className="mx-auto w-full max-w-7xl">
          <ImageSwiper swipers={swipers} />
        </div>
      </div>
      <div className="ml-5 mt-5">
        <Typography variant="h4">
          最新游戏
        </Typography>
      </div>
      <GameCards games={games} />
    </div>
  );
}