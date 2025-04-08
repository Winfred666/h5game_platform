import React from 'react';

import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

type Game = {
  id: number;
  coverUrl: string;
  name: string;
  description: string;
  author: string;
};

const GameCards = (games : Game[]) => {
  return (
    
    <Box className="flex flex-wrap justify-center gap-6 mt-8">
      {/* flex-wrap允许子元素在容器宽度不足时换行 */}
      {games.map((game) => (
        <Card
          key={game.id}
          className="w-64 flex flex-col rounded-2xl shadow-md hover:shadow-xl transition-transform hover:scale-[1.03]"
        >
          <CardMedia
            component="img"
            height="140"
            image={game.coverUrl}
            alt={game.name}
            className="object-cover"
          />
          {/* object-cover: 确保图片在容器中保持比例裁剪，填满整个容器 */}
          <CardContent className="p-4">
            <Typography variant="h6" className="mb-1">
              {game.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-2 text-sm text-gray-600">
              {game.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" className="text-xs text-gray-500">
              author: {game.author}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default GameCards;