
import React from 'react';

import ImageCarousel from '@/components/ImageCarousel';
import GameCards from '@/components/GameCards';
import { getTopGames } from '@/services/game';
import { IGame } from '@/types/igame';

export default async function Home() {
//   const [games, setGames] = useState<IGame[]>([]);

//   useEffect(() => {
//     getTopGames(1, 2).then((fetchedGames) => {
//       setGames(fetchedGames);
//     });
//   }, []);
  const games = await getTopGames(1, 2); 

  const cover_imgs = games.map((game) => game.cover_image);

  return (
    <div className="container mx-auto p-4">
      <ImageCarousel images={cover_imgs} interval={5000} />
      <GameCards games={games} />
    </div>
  );
}