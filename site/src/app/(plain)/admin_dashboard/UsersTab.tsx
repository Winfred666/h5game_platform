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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { BatchedUsers, useUserManager } from "@/hooks/useAdmin";
import Link from "next/link";
import { IUser } from "@/types/iuser";
import { encryptPassword } from "@/services/utils";

export default function UsersTab({
  setSnackbar,
}: {
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error";
  }) => void;
}) {
  const { users, addUsers, deleteUser, changeUser } = useUserManager();
  const [newUsers, setNewUsers] = useState<BatchedUsers>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openChangeDialog, setOpenChangeDialog] = useState(false);
  const [curChangeUser, setCurChangeUser] = useState<{
    id: string;
    qq: string;
    hash: string | undefined;
    admin: boolean;
  }>({
    id: "",
    qq: "",
    hash: undefined,
    admin: false,
  });

  const [curDeleteUser, setCurDeleteUser] = useState<IUser>();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers =
    users?.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.qq.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.created_at.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // try parsing the qq,name \n qq,name as json
    let lines = e.target.value.split("\n");
    try {
      // filter empty lines and trim whitespace
      lines = lines.filter((line) => line.trim() !== "");
      const newUsers: BatchedUsers = lines.map((line) => {
        const [qq, name] = line.split(",");
        // qq should only contain digits, and name should not be empty
        if (!qq || !name) throw new Error();
        if (!/^\d+$/.test(qq)) throw new Error("QQ 号格式错误");
        return { qq, name };
      });
      setNewUsers(newUsers);
      setSnackbar({
        open: true,
        message: "输入格式正确！",
        severity: "success",
      });
    } catch (e) {
      setNewUsers([]);
      setSnackbar({ open: true, message: "输入格式错误！", severity: "error" });
    }
  };

  const handleAddUser = () => {
    if (newUsers.length === 0) {
      setSnackbar({ open: true, message: "没有新成员！", severity: "error" });
      return;
    }
    addUsers(newUsers)
      .then((num) => {
        setSnackbar({
          open: true,
          message: `添加${num}位新用户！`,
          severity: "success",
        });
      })
      .finally(() => setOpenAddDialog(false));
  };

  const handleDeleteUser = () => {
    if (curDeleteUser) {
      deleteUser(curDeleteUser.id)
        .then(() => {
          setSnackbar({
            open: true,
            message: "成功删除用户！",
            severity: "success",
          });
        })
        .finally(handleCloseDeleteDialog);
    }
  };

  const handleCloseChangeDialog = () => {
    setOpenChangeDialog(false);
    setCurChangeUser((cur) => ({ ...cur, id: "" })); // reset id to empty string
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurDeleteUser(undefined);
  };

  return (
    <div>
      <div className="flex justify-between items-baseline mb-4">
        <Typography variant="h5"> 用户列表</Typography>
        <div className="flex items-center space-x-4">
          <Paper className="flex items-center px-2 py-1 w-64">
            <InputBase
              placeholder="Search users..."
              className="ml-1 flex-1"
              value={searchQuery}
              onChange={handleSearch}
            />
            <IconButton type="button" className="p-1" aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
          >
            添加用户
          </Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>昵称</TableCell>
              <TableCell>QQ 号</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>权限</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.qq}</TableCell>
                <TableCell>{user.created_at}</TableCell>
                <TableCell>{user.is_admin ? "管理员" : "用户"}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    aria-label="edit"
                    onClick={() => {
                      setCurChangeUser({
                        id: user.id,
                        qq: user.qq,
                        hash: undefined,
                        admin: user.is_admin,
                      });
                      setOpenChangeDialog(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    aria-label="delete"
                    onClick={() => {
                      setCurDeleteUser(user);
                      setOpenDeleteDialog(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>批量添加用户</DialogTitle>
        <DialogContent>
          <Typography>
            已有用户不会重新创建，可放心导入全体成员。参考该共享文档，以快速从QQ群管理中导入用户信息：
            <Link
              href="https://docs.qq.com/doc/DV0xKdGxpcFBDU2ZR"
              target="_blank"
            >
              https://docs.qq.com/doc/DV0xKdGxpcFBDU2ZR
            </Link>
          </Typography>
          {/* TODO: multiline, input all needed for users adding */}
          <TextField
            autoFocus
            margin="dense"
            multiline
            name="name"
            label="新成员 QQ,Name"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>取消</Button>
          <Button onClick={handleAddUser}>添加</Button>
        </DialogActions>
      </Dialog>

      {/* Delete user dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>删除用户</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除{curDeleteUser?.name}，QQ：{curDeleteUser?.qq} 吗？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>取消</Button>
          <Button onClick={handleDeleteUser}>删除</Button>
        </DialogActions>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog
        open={openChangeDialog}
        onClose={() => {
          setOpenChangeDialog(false);
        }}
        disableRestoreFocus
      >
        <DialogTitle>修改用户信息</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="QQ 号"
            value={curChangeUser.qq}
            fullWidth
            variant="outlined"
            onChange={(e) =>
              setCurChangeUser((cur) => ({ ...cur, qq: e.target.value }))
            }
          />

          <FormControlLabel
            checked={curChangeUser.hash !== undefined}
            onChange={(e, checked) =>
              setCurChangeUser((cur) => ({
                ...cur,
                hash: checked ? encryptPassword("") : undefined,
              }))
            }
            disabled={false}
            control={<Checkbox />}
            label="清空密码"
          />

          <FormControlLabel
            checked={curChangeUser.admin}
            onChange={(e, checked) =>
              setCurChangeUser((cur) => ({
                ...cur,
                admin: checked,
              }))
            }
            control={<Checkbox />}
            label="设为管理员"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseChangeDialog()}>取消</Button>
          <Button
            onClick={() => {
              if (curChangeUser.id !== "")
                changeUser(
                  curChangeUser.id,
                  curChangeUser.qq,
                  curChangeUser.hash,
                  curChangeUser.admin
                );
              else
                setSnackbar({
                  open: true,
                  message: "修改失败，请重新打开对话框",
                  severity: "error",
                });
              handleCloseChangeDialog();
            }}
          >
            修改
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
