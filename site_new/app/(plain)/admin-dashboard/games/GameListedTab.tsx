"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { GameListAdmin } from "@/components/GameListItem";
import { SearchHeader } from "../components/SearchHeader";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { IGame } from "@/lib/types/igame";
import { deleteGameAction } from "@/lib/querys&actions/postAdminCmd";
import { PaginationWithLinks } from "@/components/ui/pagination-with-link";

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

  const [curDeleteId, setcurDeleteId] = useState<number>();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAction = async () => {
    if (!curDeleteId || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteGameAction(curDeleteId);
      toast.success("成功删除游戏！");
    } catch (err: any) {
      console.error("删除游戏失败:", err);
      toast.error("删除失败，请重试。");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleCloseDeleteDialog = () => {
    setcurDeleteId(undefined);
    setIsDeleting(false);
  };

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
        renderActions={(gameId) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                router.push(ALL_NAVPATH.game_update.href(gameId));
              }}
            >
              <FilePenLine className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setcurDeleteId(gameId);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />

      {showPagination ? (
          <PaginationWithLinks
            page={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
          />
      ) : null}

      <AlertDialog
        open={curDeleteId !== undefined}
        onOpenChange={(open) => !open && handleCloseDeleteDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除游戏</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除该游戏吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCloseDeleteDialog}
              disabled={isDeleting}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAction}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
