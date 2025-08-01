import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cloud, Laptop } from "lucide-react"; // Added Trash2 icon
import { IGame } from "@/lib/types/igame";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import React from "react";
import GameTags from "./GameTags";

type GameListAdminProps = {
  games: IGame[];
  renderActions: (gameId: number) => React.ReactNode;
};

export const GameThumbnail = ({ game }: { game: IGame }): React.ReactNode => {
  return (
      <div className="flex w-full gap-4">
        <Image
          width={50}
          height={50}
          src={game.coverImage}
          alt={game.title}
          className=" object-cover" // Added rounding and object-fit for better visuals
        />
        {/* Replaced Typography with a simple span and Tailwind classes */}
        <div className="flex-grow text-base text-card-foreground">
          <p className="font-semibold ">{game.title}</p>
          <p className="text-sm text-muted-foreground">
            {game.developers.map((dev) => dev.name).join(", ")}
          </p>
        </div>
        <div className=" self-center">
          {game.online ? <Cloud /> : <Laptop />}
        </div>
      </div>
  );
};


export function GameListAdmin({ games, renderActions }: GameListAdminProps) {
  const router = useRouter();
  return (
    <div className=" bg-card round-lg shadow-sm p-4 text-card-foreground">
      <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 items-center p-2">
        <h4>游戏概要</h4>
        <h4>标签</h4>
        <h4>包体大小</h4>
        <h4 className="justify-self-end">操作</h4>
      </div>
      {games.length > 0 ? (
        games.map((game) => (
          <div
            key={"game_" + game.id}
            onClick={() => router.push(ALL_NAVPATH.game_id.href(game.id))}
            className=" grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 items-center p-2
            w-full rounded-lg hover:bg-accent cursor-pointer
             border-b last:border-b-0"
          >
            {/* Left side: Cover and Title, need router because use click mask */}
            <GameThumbnail game={game} />

            {/* Middle: Developer Tags (Non-deletable) + Size */}
            <GameTags id={`game_${game.id}_`} tags={game.tags} size="small" thing="game" />

            <div className=" text-muted-foreground">{game.size}</div>

            {/* Right side: Dynamic Actions */}
            <div className="flex justify-self-end gap-2">
              {renderActions(game.id)}
            </div>
          </div>
        ))
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          没有找到与您的搜索匹配的游戏。
        </div>
      )}
    </div>
  );
}
