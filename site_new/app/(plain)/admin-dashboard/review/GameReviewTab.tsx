"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { SearchHeader } from "../components/SearchHeader";
import { GameListAdmin } from "@/components/GameListItem";
import { IGame } from "@/lib/types/igame";
import { approveGameAction } from "@/lib/querys&actions/postAdminCmd";

export default function GameReviewTab({ games }: { games: IGame[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  const filteredGames = games?.filter(
    (game: IGame) =>
      searchQuery === "" || 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.developers.some((dev) =>
        dev.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      game.tags?.some((tag) => tag.name.includes(searchQuery) || searchQuery.includes(tag.name))
  );

  const handleApprove = async (id: number) => {
    try {
      await approveGameAction(id);
      toast.success("游戏审核成功");
    } catch {
      toast.error("游戏审核失败");
    }
  };

  return (
    <div className="space-y-4">
      <SearchHeader
        title="待审游戏列表"
        subtitle="若有问题或要删除游戏，应在QQ群提醒开发者"
        searchValue={searchQuery}
        onSearchChange={handleSearch}
      />
      <GameListAdmin
        games={filteredGames}
        renderActions={(gameId) => (
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleApprove(gameId)}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      />
    </div>
  );
}
