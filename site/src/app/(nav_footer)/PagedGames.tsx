"use client";

import React, { useState } from "react";
import { Pagination, Typography } from "@mui/material";
import GameCards from "@/components/GameCards";
import { IGame } from "@/types/igame";

export default function PagedGames({
  games,
  pageSize = 10,
}: {
  games: IGame[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(games.length / pageSize);

  const handleChange = (event: any, page: number) => {
    setPage(page);
  };

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedGames = games.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col grow gap-6">
      <Typography variant="h5">
          最新游戏
        </Typography>
      {/* Render paged games here */}
      <GameCards games={pagedGames} />
      <Pagination
        count={totalPages}
        page={page}
        onChange={handleChange}
        color="primary"
      />
    </div>
  );
}
