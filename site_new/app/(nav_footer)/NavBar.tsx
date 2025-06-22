"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gamepad2, Search, User, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { ALL_NAVPATH } from "@/lib/router_info";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathName = usePathname();
  const navLinks = [
    ALL_NAVPATH.home,
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
            href={ALL_NAVPATH.home.href}
            className="flex items-center gap-2"
          >
            <Gamepad2 className="h-6 w-6 text-primary" />
            <h1 className=" font-medium hidden lg:block">ZJU H5游戏分享平台</h1>
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
        {/* 3. 搜索框 */}
        <div className="grow">
          <div className="relative max-w-xs">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索游戏名称..."
              className="w-full pl-8"
            />
          </div>
        </div>

        {/* 4. 用户头像和下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className=" cursor-pointer relative flex items-center gap-2 p-1 h-auto"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="用户头像"
                />
                <AvatarFallback> <UserRound className="h-5 w-5"/> </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline">用户名</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className=" lg:w-48" align="end" forceMount>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>个人主页</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
