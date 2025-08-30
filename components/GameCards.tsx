"use client";
import Image from "next/image";
import { Cloud, Laptop } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GameTags from "./GameTags"; // Reusing your existing GameTags component
import { IGame } from "@/lib/types/igame";
import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { PaginationWithLinks } from "./ui/pagination-with-link";

type GameCardProps =
  | {
      game: IGame;
      small: false;
    }
  | {
      game: Pick<IGame, "id" | "title" | "coverImage"> & {
        isMeOrAdmin: boolean;
      };
      small: true;
    };

interface GameCardsProps {
  games: IGame[]; // Assuming a post-processed game type
  currentPage?: number; // if display pagination, current page number
  pageSize?: number;
  totalCount?: number;
}

export function GameCard({ game, small }: GameCardProps) {
  const router = useRouter();
  return (
    <Card
      key={`game_${game.id}`}
      className={`py-0 gap-0 ${small ? "w-48 lg:w-56" : "w-72 lg:w-80"} 
                  group overflow-hidden transition-shadow hover:shadow-md
                  cursor-pointer`}
      onClick={() =>
        router.push(
          small && game.isMeOrAdmin
            ? ALL_NAVPATH.game_id_unaudit.href(game.id)
            : ALL_NAVPATH.game_id.href(game.id)
        )
      }
    >
      {/* Image Section */}
      <div className="w-full relative aspect-video">
        <Image
          src={game.coverImage}
          alt={game.title}
          fill
          sizes={small ? "224px" : "288px"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content Section - Only show if not small */}
      {!small && (
        <div className="flex flex-col flex-grow p-4">
          <CardHeader className="p-0">
            <div className="flex justify-between gap-2">
              <CardTitle className="text-lg leading-snug">
                {game.title}
              </CardTitle>
              {game.online ? (
                <Cloud className="shrink-0 text-muted-foreground" />
              ) : (
                <Laptop className="shrink-0 text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-grow">
            {/* Tags Section */}
            <div className="h-10 overflow-hidden mb-2">
              <GameTags id={`card_${game.id}`} tags={game.tags} />
            </div>

            {/* Description Section */}
            <CardDescription className="text-sm line-clamp-2">
              {game.description}
            </CardDescription>
          </CardContent>
        </div>
      )}

      {/* Small version - only title */}
      {small && (
        <div className="p-2">
          <CardTitle className=" text-sm leading-snug line-clamp-1">
            {game.title}
          </CardTitle>
        </div>
      )}
    </Card>
  );
}

export default function GameCards({
  games,
  currentPage,
  pageSize,
  totalCount,
}: GameCardsProps) {
  const showPagination =
    currentPage !== undefined &&
    totalCount &&
    pageSize &&
    totalCount > pageSize;

  // console.log(`Current Page: ${currentPage}, Page Size: ${pageSize}, Total Games: ${totalCount}, ${showPagination}`);
  return (
    // The main container, using Tailwind classes directly
    <>
      <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
        {games.map((game) => (
          <GameCard key={`game_${game.id}`} game={game} small={false} />
        ))}
      </div>

      {showPagination ? (
        <PaginationWithLinks
          page={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          buildPageLink={ALL_NAVPATH.home.href}
        />
      ) : null}
    </>
  );
}
