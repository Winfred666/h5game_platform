"use client"; // Make this a client component for the download tracking

import { Button } from "@/components/ui/button";
import { increViewsAction } from "@/lib/querys&actions/postViews";
import { IGame } from "@/lib/types/igame";
import { Download } from "lucide-react";

export default function DownloadButton({ game }: { game: Pick<IGame, "id"|"downloadUrl"|"size"> }) {
  const handleDownloadClick = async () => {
    try {
      // Track the download attempt
      await increViewsAction(game.id);
      
      // Then redirect to actual download
      window.location.href = game.downloadUrl;
    } catch (error) {
      console.error('Failed to track download:', error);
      // Still allow download even if tracking fails
      window.location.href = game.downloadUrl;
    }
  };

  return (
    <Button onClick={handleDownloadClick} className="w-fit">
      <Download />
      下载游戏（{game.size}）
    </Button>
  );
}
