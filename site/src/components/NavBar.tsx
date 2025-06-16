"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SearchBar from "./SearchBar";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  MenuItem,
  Tooltip,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import { IGame } from "@/types/igame";
import { ALL_NAVPATH } from "@/services/router_info";

import useCurUserId, { clearCurUserIdCookie } from "@/hooks/getCurUserId";
import { useUserMsg } from "@/hooks/getUserMsg";
import { useSnackBar } from "./SnackBarContext";

export default function NavBar() {
  const pathName = usePathname();
  const router = useRouter();
  const snackbar = useSnackBar();

  const all_navs = [
    ALL_NAVPATH.home,
    ALL_NAVPATH.upload,
    ALL_NAVPATH.community,
  ];
  const settings = [
    {
      name: ALL_NAVPATH.profile.name,
      icon: <HomeIcon />,
      action: () => router.push(ALL_NAVPATH.profile.href),
    },
    {
      name: "退出登录",
      icon: <LogoutIcon />,
      action: () => {
        clearCurUserIdCookie(); // 本地必须清除
        fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/me", {
          method: "DELETE",
          credentials: "include",
        }).then((res) => {
          if (res.ok) {
            window.location.reload(); // 刷新页面以更新状态
          } else {
            throw new Error("用户未登录");
          }
        }).catch((error) => {
          snackbar.open(error.message);
          console.error(error);
        });
      },
    },
  ];

  const current_path_idx = all_navs.findIndex((nav) =>
    nav.href.startsWith(pathName)
  );

  const id = useCurUserId();
  const {user} = useUserMsg(id);

  return (
    <div className=" z-10">
      <AppBar elevation={1} position="static" color="secondary">
        <Toolbar className="gap-4 h-full">
          <div
            className="flex flex-row gap-2 cursor-pointer"
            onClick={() => router.push(ALL_NAVPATH.home.href)}
          >
            <SportsEsportsIcon fontSize="large" color="primary" />
            <Typography className="select-none hidden lg:block " variant="h6" component="div">
              ZJU H5游戏分享平台
            </Typography>
          </div>
          {/* All functional page */}
          {all_navs.map((nav, index) => (
            <div
              key={index}
              className={
                " navbar-button cursor-pointer " +
                (current_path_idx === index ? "navbar-active-button" : "")
              }
              onClick={() => router.push(nav.href)}
            >
              {nav.name}
            </div>
          ))}

          {/* search bar at middle */}
          <div className=" grow">
            <SearchBar
              placeholder="搜索游戏名称..."
              thing="game"
              processOptionFunc={(game: IGame) => {
                return {
                  label: game.title,
                  id: game.id,
                };
              }}
              onSelect={(selectOption) => {
                router.push(ALL_NAVPATH.game_id.href(selectOption.id));
              }}
              onEnter={(searchTerm) => {
                router.push(ALL_NAVPATH.game_name.href(searchTerm));
              }}
            />
          </div>
          {/* Personal avatar + name is at right */}
          <Box className="lg:mr-6">
            <Tooltip
              title={settings.map((setting) => (
                <MenuItem key={setting.name} onClick={setting.action}>
                  {setting.icon}
                  <Typography className="text-center ml-1">
                    {setting.name}
                  </Typography>
                </MenuItem>
              ))}
            >
              <div
                aria-haspopup="true"
                className="flex flex-row items-center gap-2"
              >
                <Avatar className=" hidden lg:flex" alt={user?.name ?? "游客"} src={user?.profile}/>
                <Typography >{user?.name ?? "游客"}</Typography>
              </div>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}
