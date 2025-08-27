import Image from "next/image";
import { Cloud, Eye, Laptop } from "lucide-react"; // Added Trash2 icon
import { IGame, IGameAdmin } from "@/lib/types/igame";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import React from "react";
import GameTags from "./GameTags";
import { Button } from "./ui/button";
import Link from "next/link";

type GameListAdminProps = {
  games: IGameAdmin[];
  renderActions: (game: IGame) => React.ReactNode;
  actionsInfo: string;
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
      <div className=" self-center">{game.online ? <Cloud /> : <Laptop />}</div>
    </div>
  );
};

export function GameListAdmin({
  games,
  renderActions,
  actionsInfo,
}: GameListAdminProps) {
  return (
    <div className=" bg-card round-lg shadow-sm p-4 text-card-foreground">
      <div
        className="grid grid-cols-[3fr_2fr_1fr_1fr_1fr_2fr] gap-4 items-center px-4 py-1 
      border-b font-semibold text-muted-foreground text-sm"
      >
        <h4>游戏概要</h4>
        <h4>标签</h4>
        <h4>包体大小</h4>
        <h4>游玩量</h4>
        <h4>更新时间</h4>
        <h4 className="justify-self-end">操作（查看{actionsInfo}）</h4>
      </div>
      {games.length > 0 ? (
        games.map((game) => (
          <div
            key={"game_" + game.id}
            className=" grid grid-cols-[3fr_2fr_1fr_1fr_1fr_2fr] gap-4 items-center px-4 py-1
            w-full rounded-lg hover:bg-accent
             border-b last:border-b-0"
          >
            {/* Left side: Cover and Title, need router because use click mask */}
            <GameThumbnail game={game} />

            {/* Middle: Developer Tags (Non-deletable) + Size */}
            <GameTags
              id={`game_${game.id}_`}
              tags={game.tags}
              size="small"
              thing="game"
            />

            <div className=" text-muted-foreground">{game.size}</div>
            <div className=" text-muted-foreground">{game.views}</div>
            <div className=" text-muted-foreground">{game.updatedAt}</div>

            {/* Right side: Dynamic Actions */}
            <div className="justify-self-end flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href={ALL_NAVPATH.game_id_unaudit.href(game.id)}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              {renderActions(game)}
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
