"use client"

import useCurUserId from "@/hooks/getCurUserId";
import { useUnauditGames } from "@/hooks/getUserMsg";
import { ALL_NAVPATH } from "@/services/router_info";
import { IDeveloper } from "@/types/igame";
import Link from "next/link";


export default function DevBanner({game_id, developers}: {game_id:string, developers: IDeveloper[] }) {
  const user_id = useCurUserId();
  // find whether the game is audited
  const unaudit_games = useUnauditGames(user_id);
  if(!user_id || !developers.find((dev) => dev.id == user_id)){
    return (<></>); // not developer of this game
  }
  return(
    <div className="w-full bg-[var(--mui-palette-primary-main)] text-white text-center py-0.5">
      {unaudit_games.find((game)=>game.id === game_id) ? "正在浏览您未审核游戏的页面，仅开发者可见，可提醒 QQ 群管理员审核。":"该游戏已通过审核，所有人可正常浏览。"}
      <Link href={ALL_NAVPATH.game_update.href(game_id)}>修改游戏</Link>
    </div>
  );
}