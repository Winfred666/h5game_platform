import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, FilePenLine, Laptop, X } from "lucide-react"; // Replaced MUI icons with Lucide
import { IGame } from "@/lib/types/igame";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import React from "react";

type GameListItemProps = {
  game: IGame;
};
type GameListItemAdminProps = GameListItemProps & {
  onDelete: (gameId: number, userId: number) => void;
};

const GameThumbnail = (game:IGame): React.ReactNode => {
  return (
    <div className="flex gap-4">
      <Image
        width={50}
        height={50}
        src={game.coverImage}
        alt={game.title}
        className=" object-cover" // Added rounding and object-fit for better visuals
      />
      {/* Replaced Typography with a simple span and Tailwind classes */}
      <div className="text-base text-card-foreground">
      <p className="font-semibold ">
        {game.title}
      </p>
      <p className="text-sm text-muted-foreground">
        {game.developers.map(dev=>dev.name).join(", ")}
      </p>
      </div>
    </div>
  );
};

export function GameListItem({ game }: GameListItemProps) {
  return (
    <div className="flex w-full justify-between items-center">
      {GameThumbnail(game)}
      {game.online ? <Cloud /> : <Laptop />}
    </div>
  )
}

export function GameListItemAdmin({ game, onDelete }: GameListItemAdminProps) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(ALL_NAVPATH.game_id.href(game.id))}
      // Use theme-aware colors from shadcn/ui's theme
      className="flex items-center justify-between p-3 w-full rounded-lg hover:bg-accent cursor-pointer transition-colors"
    >
      {/* Left side: Cover and Title */}
      {GameThumbnail(game)}
      <div className="flex items-center gap-4">
        {/* Middle: Developer Badges (Chips) */}
        {/* This section is hidden on smaller screens to prevent layout overflow */}
        <div className="hidden md:flex flex-wrap items-center gap-2">
          {game.developers.map((dev) => (
            <Badge
              key={game.id + "_" + dev.id}
              variant="secondary"
              className="pl-2 pr-1 py-1"
            >
              <span className="mr-1">{dev.name}</span>
              {/* Custom delete button inside the Badge */}
              <button
                aria-label={`Remove developer ${dev.name}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigating to game page
                  onDelete(game.id, dev.id);
                }}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        {/* Game Size - hidden on medium screens and smaller */}
        <span className="text-sm text-muted-foreground hidden lg:block">
          {game.size}
        </span>
      </div>

      {/* Right side: Edit Button */}
      {/* Replaced IconButton with shadcn's Button */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Edit game"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation(); // Prevent navigating to game page
          router.push(ALL_NAVPATH.game_update.href(game.id));
        }}
      >
        {/* Used FilePenLine for a clear "edit" action */}
        <FilePenLine className="h-4 w-4" />
      </Button>
    </div>
  );
}
