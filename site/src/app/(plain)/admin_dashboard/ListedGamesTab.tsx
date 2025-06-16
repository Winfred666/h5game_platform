"use client";

import { useState } from "react";
import {
  Paper,
  IconButton,
  Typography,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import GameListItem from "@/components/GameListItem";
import { useGamesManager } from "@/hooks/useAdmin";

// Interface definitions

export default function ListedGamesTab({
  setSnackbar,
}: {
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error";
  }) => void;
}) {
  const { games, deleteGame } = useGamesManager();
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [curDelete, setCurDelete] = useState<{
    game_id: string;
    user_id: string;
  }>();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredGames = games?.filter(
    (game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.joinDevelopers.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags.some((tag) => tag.includes(searchQuery))
  );

  const handleDelete = () => {
    if (!curDelete || isDeleting) return;
    setIsDeleting(true);
    deleteGame(curDelete.game_id, curDelete.user_id)
      .then(() => {
        setSnackbar({
          open: true,
          message: "成功删除该游戏的一位开发者！",
          severity: "success",
        });
      })
      .finally(handleCloseDeleteDialog);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurDelete(undefined);
    setIsDeleting(false);
  };

  return (
    <div>
      <div className="flex justify-between items-baseline mb-4">
        <Typography variant="h5">
          删除所有开发者以彻底删除该游戏
        </Typography>
        <Typography className="grow" color="text.secondary" variant="body1">
          （管理员可进入编辑任何游戏）
        </Typography>
        <Paper className="flex items-center px-2 py-1 w-64">
          <InputBase
            placeholder="Search games..."
            className="ml-1 flex-1"
            value={searchQuery}
            onChange={handleSearch}
          />
          <IconButton type="button" className="p-1" aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </div>

      <List className="rounded-md overflow-hidden">
        {filteredGames && filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <ListItem key={game.id} disablePadding divider>
              <GameListItem
                game={game}
                onDelete={(game_id, user_id) => {
                  setCurDelete({ game_id, user_id });
                  setOpenDeleteDialog(true);
                }}
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <Typography className="py-4 w-full text-center">
              No games found matching your search.
            </Typography>
          </ListItem>
        )}
      </List>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        disableRestoreFocus
      >
        <DialogTitle>删除关联</DialogTitle>
        <DialogContent>
          <Typography>确定要从该游戏作者中删除该开发人员吗？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseDeleteDialog()}>取消</Button>
          <Button onClick={handleDelete} loading={isDeleting}>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
