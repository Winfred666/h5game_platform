"use client";

import { useState } from "react";

import { GameListAdmin } from "@/components/GameListItem";
import { SearchHeader } from "../components/SearchHeader";

import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { IGame } from "@/lib/types/igame";
import { deleteGameAction } from "@/lib/querys&actions/postAdminCmd";
import { PaginationWithLinks } from "@/components/ui/pagination-with-link";
import { DeleteObjDialog } from "../components/DeleteObjDialog";

// Interface definitions

export default function GameListedTab({
  games,
  currentPage,
  pageSize,
  totalCount,
}: {
  games: IGame[];
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
}) {

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [curDeleteGame, setCurDeleteGame] = useState<{
    id: number;
    name: string;
  } | undefined>();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const filteredGames = games?.filter(
    (game: IGame) =>
      searchQuery === "" ||
      game.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.developers.some((dev) =>
        dev.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      game.tags?.some(
        (tag) =>
          tag.name.includes(searchQuery) || searchQuery.includes(tag.name)
      )
  );

  const showPagination =
    currentPage !== undefined &&
    totalCount &&
    pageSize &&
    totalCount > pageSize;
  
  return (
    <div className="space-y-6">
      <SearchHeader
        title="游戏列表"
        subtitle="删除所有开发者以彻底删除该游戏（管理员可进入编辑任何游戏）"
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        searchPlaceholder="Search games..."
      />

      <GameListAdmin
        games={filteredGames}
        renderActions={game => (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                router.push(ALL_NAVPATH.game_update.href(game.id));
              }}
            >
              <FilePenLine className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setCurDeleteGame({ id: game.id, name: game.title });
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        actionsInfo="/编辑/删除"
      />
      {showPagination ? (
          <PaginationWithLinks
            page={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
          />
      ) : null}

      <DeleteObjDialog
        onDeleteAction={async (game) => deleteGameAction(game.id)}
        onClose={() => setCurDeleteGame(undefined)}
        obj={curDeleteGame}
        thing="游戏"
      />
    </div>
  );
}
