import Image from "next/image";

import React from 'react';

import ImageSwiper from '@/components/ImageSwiper';
//import ImageCarousel from '@/components/ImageCarousel';
import GameCards from '@/components/GameCards';
import { getTopGames } from '@/services/game';
import { IGame } from '@/types/igame';

export default async function Home() {

  const games = await getTopGames(1, 2); 

  //const cover_imgs = games.map((game) => game.cover_image);

  //const links = games.map((game) => "/game/" + game.id);

  const swipers = games.map((game) => ({
    src: game.cover_image,
    link: "/game/" + game.id,
  }));

  return (
    <div className="flex flex-col grow">
      <ImageSwiper swipers={swipers} />
      <GameCards games={games} />
    </div>
  );
}