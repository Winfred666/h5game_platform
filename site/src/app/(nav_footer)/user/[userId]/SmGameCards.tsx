import { ALL_NAVPATH } from "@/services/router_info";
import { IUserGame } from "@/types/iuser";
import { Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";



export default function SmGameCards({games,isMe}:{games:IUserGame[], isMe:boolean}){
  return (<div className="overflow-x-auto flex space-x-4 p-4">
  {games.map((game) => (
    <div
      key={game.id}
      className="flex-shrink-0 w-40 flex flex-col items-center text-center space-y-3"
    >
      <Link
        href={ALL_NAVPATH.game_id.href(game.id)}
        className="no-underline"
      >
        <Image
          src={game.cover_image}
          alt={game.title}
          width={160}
          height={128}
          className="w-full h-32 object-cover rounded-lg"
        />
      </Link>
      <Typography variant="body1" sx={{ fontWeight: "bold"}}>
        {game.title}
      </Typography>
      {isMe && <Link href={ALL_NAVPATH.game_update.href(game.id)}>
        修改游戏
      </Link>}
    </div>
  ))}
</div>)
}