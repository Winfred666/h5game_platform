"use client";
// warning: because navbar use client, the page using nav_footer layout can still be statistic
// if not rendering using dynamic data to build page.

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gamepad2, User, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { usePathname } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import {GameListItem} from "@/components/GameListItem";
import { IGame } from "@/lib/types/igame";
import { UserThumbnail } from "@/components/UserListItem";
import { useRouter } from "next/navigation";


export default function NavBar() {
  const pathName = usePathname();
  const router = useRouter();
  const navLinks = [
    {...ALL_NAVPATH.home, href: ALL_NAVPATH.home.href()},
    ALL_NAVPATH.upload,
    ALL_NAVPATH.community,
  ];
  const current_path_idx = navLinks.findIndex((nav) =>
    nav.href.startsWith(pathName)
  );

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-sidebar"
    >
      <div className="w-full flex h-14 gap-2 lg:gap-4 px-2 lg:px-4 items-center">
        {/* 1. Logo 和标题 */}
        <div className="flex items-center">
          <Link
            href={ALL_NAVPATH.home.href()}
            className="flex items-center gap-2"
          >
            <Gamepad2 className="h-6 w-6 text-primary" />
            <h3 className="font-medium hidden lg:block">ZJU H5游戏分享平台</h3>
          </Link>
        </div>
        {/* 2. 中间的主要导航链接 */}
        <nav className="hidden lg:flex h-full items-center gap-6 mr-6">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              className={
                "navbar-button cursor-pointer " +
                (current_path_idx === index ? "navbar-active-button" : "")
              }
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 3. 搜索框，高频搜索是唯一需要 API 的客户端组件 */}
        <SearchBar thing="game" className="lg:w-3/5"
          renderListItem={(game)=>GameListItem({game} as {game:IGame})}
          onEnter={(term)=>router.push(ALL_NAVPATH.game_name.href(term))}
          onSelect={(game)=>router.push(ALL_NAVPATH.game_id.href((game as IGame).id))}
          listClassName=" max-h-[40vh]"
          />
        {/* 4. 用户头像和下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className=" cursor-pointer relative p-1 h-auto"
            >
              {/* TODO: add auth and get user info later !*/}
              <UserThumbnail user={undefined} shrinkName />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className=" lg:w-48" align="end" forceMount>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>个人主页</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
