"use client"

import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { IGame } from "@/types/igame";
import CloudIcon from "@mui/icons-material/Cloud";
import LaptopWindowsIcon from "@mui/icons-material/LaptopWindows";

import { ALL_NAVPATH } from '@/services/router_info';
import GameTags from './GameTags';
import { useRouter } from 'next/navigation';

interface GameCardsProps {
  games: IGame[];
}

const GameCards: React.FC<GameCardsProps> = ({ games }) => {
  const router = useRouter();
  return (
    <Box className="flex flex-col items-center lg:items-start lg:flex-row flex-wrap gap-6 mt-8">
      {/* flex-wrap允许子元素在容器宽度不足时换行 */}
      {games.map((game) => (
        <Card
          key={game.id}
          className="w-72 cursor-pointer flex flex-col shadow-xs rounded-xl hover:shadow-sm transition-transform hover:scale-[1.01]"
          onClick={() => router.push(ALL_NAVPATH.game_id.href(game.id))}
        >
          <CardMedia
            component="img"
            height="140"
            image={game.cover_image}
            alt={game.title}
            className="object-cover"
          />
          {/* object-cover: 确保图片在容器中保持比例裁剪，填满整个容器 */}
          <CardContent className="p-4">
            <div className=" flex flex-row justify-between items-center">
            <Typography variant="h6">
              {game.title}
            </Typography>
            {game.online ? <CloudIcon /> : <LaptopWindowsIcon />}
            </div>
            <Typography variant="body1" color="text.secondary" component="div" className=" h-10 overflow-hidden">
              <GameTags id={`game_${game.id}`} tags={game.tags} color="primary" size="small" />
            </Typography>
            <Typography variant="body1" color="text.secondary" className="text-sm line-clamp-2">
              {game.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default GameCards;