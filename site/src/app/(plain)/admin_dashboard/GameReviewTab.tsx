"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/services/router_info";
import { useGameAudit } from "@/hooks/useAdmin";

// Interface definitions

export default function GameReviewTab({setSnackbar}:{setSnackbar: (snackbar: {open:boolean,message:string, severity:"success"|"error"})=>void}) {
  const {approveGame, games } = useGameAudit();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredGames = games?.filter(
    (game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.joinDevelopers.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = (id: string) => {
    approveGame(id).then(()=>setSnackbar({
      open: true,
      message: "游戏审核成功",
      severity: "success",
    }));
  };

  const router = useRouter();

  return (
    <div>
      <div className="flex justify-start items-baseline mb-4">
        <Typography variant="h5">待审游戏列表</Typography>
        <Typography className="grow" color="text.secondary" variant="body1">
          （若拒绝通过，可在QQ群提醒开发者）
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>游戏标题</TableCell>
              <TableCell>作者</TableCell>
              <TableCell>提交日期</TableCell>
              <TableCell align="center">审核意见</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGames?.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="cursor-pointer hover:bg-black/40" onClick={
                  ()=>router.push(ALL_NAVPATH.game_id.href(game.id))
                }>{game.title}（{game.size}）</TableCell>
                <TableCell>{game.joinDevelopers}</TableCell>
                <TableCell>{game.release_date}</TableCell>
                <TableCell align="center">
                  <Box className="flex justify-center space-x-2">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => handleApprove(game.id)}
                    >
                      Approve
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
