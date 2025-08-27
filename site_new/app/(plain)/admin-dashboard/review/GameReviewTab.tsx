"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";

import { SearchHeader } from "../components/SearchHeader";
import { GameListAdmin } from "@/components/GameListItem";
import { IGameAdmin } from "@/lib/types/igame";
import {
  approveGameAction,
  deleteGameAction,
} from "@/lib/querys&actions/postAdminCmd";
import { useLoading } from "@/components/LoadingProvider";
import { DeleteObjDialog } from "../components/DeleteObjDialog";

export default function GameReviewTab({ games }: { games: IGameAdmin[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { startLoading } = useLoading();

  const [curDeleteGame, setCurDeleteGame] = useState<
    | {
        id: string;
        name: string;
      }
    | undefined
  >();

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  const filteredGames = games?.filter(
    (game: IGameAdmin) =>
      searchQuery === "" ||
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.developers.some((dev) =>
        dev.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      game.tags?.some(
        (tag) =>
          tag.name.includes(searchQuery) || searchQuery.includes(tag.name)
      )
  );

  const handleApprove = async (id: string) =>
    startLoading(async () => approveGameAction(id, true), {
      loadingMsg: "正在公开游戏...",
      successMsg: "游戏审核通过！",
    });

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
        renderActions={({ id, title }) => (
          <>
            <Button
              variant="success"
              size="icon"
              onClick={() => handleApprove(id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setCurDeleteGame({ id, name: title })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        actionsInfo="/通过/删除"
      />
      <DeleteObjDialog
        onDeleteAction={async (game) => deleteGameAction(game.id)}
        onClose={() => setCurDeleteGame(undefined)}
        obj={curDeleteGame}
        thing="游戏"
      />
    </div>
  );
}
