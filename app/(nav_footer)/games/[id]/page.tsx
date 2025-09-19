import EmbededCanvas from "./EmbededCanvas";
import Image from "next/image";
import GamePoster from "@/components/GamePosters";
import GameTags from "@/components/GameTags";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";
import { getPublicGameById } from "@/lib/querys&actions/getGame";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { Button } from "@/components/ui/button";
import { IGame } from "@/lib/types/igame";
import DownloadButton from "./downloadButton";

export function GameIdPage({ game }: { game: IGame }) {
  return (
    <>
      {/* Background Cover Image */}
      <div>
        {/* prevent skipping auto scroll behavior */}
      <div className="fixed inset-0 -z-10">
        <Image
          src={game.coverImage}
          alt={game.title + "_bg"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      </div>

      {/* 主要内容，使用页面包裹 */}
      <div
        className="relative flex flex-col items-center
  gap-6 mx-auto pb-4 max-w-[100vw] lg:max-w-[85%] lg:min-w-1/2 
  flex-grow bg-card"
        style={{
          width:
            game.online && game.online.mode === "embed"
              ? `${game.online.width + 20}px`
              : "auto",
        }}
      >
        {/* 4 mode, jump, embed, fullscreen(still jump), download(no button) */}
        <EmbededCanvas
          gameId={game.id}
          online={game.online}
          coverImg={game.coverImage}
        ></EmbededCanvas>

        <div className=" px-8 flex flex-col gap-8 lg:flex-row lg:justify-between">
          {/* Left column - Game info */}
          <div className="flex flex-col gap-6 lg:max-w-3/5">
            <h2>{game.title}</h2>

            <div className=" whitespace-pre-line break-words">
              {/*将\r\n或\n识别为换行符并换行*/}
              {game.description}
            </div>
            <GameTags tags={game.tags} id="game_detail_" />
            <div>
              <div className="flex flex-row flex-wrap items-baseline">
                <div>作者：</div>
                {game.developers.map((dev, index) => (
                  <div
                    key={"developer_" + dev.id}
                    className="flex items-center"
                  >
                    <Button
                      asChild
                      variant="ghost"
                      className="py-0 px-1 h-auto"
                    >
                      <Link href={ALL_NAVPATH.user_id.href(dev.id)}>
                        {dev.name}
                      </Link>
                    </Button>
                    {index < game.developers.length - 1 && <div>，</div>}
                  </div>
                ))}
              </div>
              <div>发布日期： {game.createdAt}</div>
            </div>
            {game.downloadUrl !== "" && <DownloadButton game={game} />}
          </div>

          {/* Right column - Screenshots */}
          <div className="flex flex-col gap-2 lg:gap-6">
            <h2>游戏截图</h2>
            {game.screenshots.length > 0 ? (
              <GamePoster
                imageList={game.screenshots.map((screenshot, index) => ({
                  src: screenshot,
                  alt: `${game.title}_screen${index}`,
                }))}
              />
            ) : (
              <div>暂无游戏截图~</div>
            )}
          </div>
        </div>
        {/* <CommentZone gameId={game.id}/> */}
      </div>
    </>
  );
}

export default async function PublicGameIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // await the promise to get the id
  // now still in server component, just savely get game content
  const game = await getPublicGameById(id);
  // console.log("games: ", game);
  if (!game) {
    return notFound();
  }
  return <GameIdPage game={game} />;
}

// use revalidatePath + static for any tourist page to speed up
export const dynamic = "force-static";
