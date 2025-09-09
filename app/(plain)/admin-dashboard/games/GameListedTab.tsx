"use client";

import { useState } from "react";

import { GameListAdmin } from "@/components/GameListItem";
import { SearchHeader } from "../components/SearchHeader";

import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2, Undo } from "lucide-react";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { IGameAdmin } from "@/lib/types/igame";
import {
  approveGameAction,
  deleteGameAction,
} from "@/lib/querys&actions/postAdminCmd";
import { PaginationWithLinks } from "@/components/ui/pagination-with-link";
import { DeleteObjDialog } from "../components/DeleteObjDialog";
import { useLoading } from "@/components/LoadingProvider";
import Link from "next/link";
import useSearchOptionsDebounce from "@/lib/hooks/useSearchOptions";

export default function GameListedTab({
  games,
  currentPage,
  pageSize,
  totalCount,
}: {
  games: IGameAdmin[];
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
}) {
  const { startLoading } = useLoading();

  const [curDeleteGame, setCurDeleteGame] = useState<
    | {
        id: string;
        name: string;
      }
    | undefined
  >();

  const { searchOptions, searchTerm, setSearchTerm, isLoading } =
      useSearchOptionsDebounce<IGameAdmin>("admin_game");


  // Do not filter game on the games view, just select to show pagination or result of debounce.
  const filteredGames = (searchTerm.trim() === "" || isLoading) ? games : searchOptions;

  const showPagination =
    currentPage !== undefined &&
    totalCount &&
    pageSize &&
    totalCount > pageSize;

  const handleDisapprove = async (gameId: string) =>
    startLoading(async () => approveGameAction(gameId, false), {
      loadingMsg: "正在返回未审核状态...",
      successMsg: "游戏已返回未审核状态！",
    });
  
  

  return (
    <div className="space-y-6">
      <SearchHeader
        title="游戏列表"
        subtitle="管理员可进入编辑/删除任何游戏"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search games..."
      />
      {isLoading && <div className=" w-full py-1 text-center">搜索中...</div>}
      <GameListAdmin
        games={filteredGames}
        renderActions={(game) => (
          <>
            <Button variant="outline" size="icon" asChild>
              <Link href={ALL_NAVPATH.game_update.href(game.id)}>
                <FilePenLine className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDisapprove(game.id);
              }}
            >
              <Undo className="h-4 w-4" />
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
        actionsInfo="/编辑/回未审核/删除"
      />

      {showPagination ? (
        <PaginationWithLinks
          page={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          buildPageLink={(page)=>ALL_NAVPATH.admin_games.href+`?page=${page}`}
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
