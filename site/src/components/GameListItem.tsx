"use client";

import { Chip, IconButton, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/services/router_info";
import { IGame} from "@/types/igame";
import Image from "next/image";

interface GameListItemProps {
  game: IGame;
  onDelete: (game_id: string, user_id: string) => void;
}

export default function GameListItem({ game, onDelete }: GameListItemProps) {
  const router = useRouter();
  return (
    <div onClick={() => router.push(ALL_NAVPATH.game_id.href(game.id))}
    className="flex justify-between items-center py-2 px-3 w-full hover:bg-gray-500/20 cursor-pointer">
      <div className="flex gap-4 items-center">
        <Image width={50} height={50} src={game.cover_image} alt={game.title} />
        <Typography variant="h6">{game.title}</Typography>
      </div>
      <div className=" flex gap-2 items-center">
        {game.developer.map((dev) => (
          <Chip
            label={dev.name}
            key={game.id + "_" + dev.id}
            onDelete={() => onDelete(game.id, dev.id)}
          ></Chip>
        ))}
      </div>
      <Typography variant="caption" color="text.secondary" >{game.size}</Typography>

      {/* <div className="text-sm mr-4">
        <span className="px-2 py-1 rounded-full text-xs bg-opacity-20 bg-blue-500">
          {game.plays.toLocaleString()} plays
        </span>
      </div> */}

      <div className="flex">
        <IconButton size="small" aria-label="edit">
          <EditIcon
            fontSize="small"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              router.push(ALL_NAVPATH.game_update.href(game.id));
            }}
          />
        </IconButton>
      </div>
    </div>
  );
}
