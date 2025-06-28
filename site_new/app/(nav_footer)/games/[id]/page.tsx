import EmbededCanvas from "./EmbededCanvas";
import Image from "next/image";
import GamePoster from "@/components/GamePosters";
import GameTags from "@/components/GameTags";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";
import { getGameById } from "@/lib/services/getGame";
import { ALL_NAVPATH } from "@/lib/routerInfo";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
// import DevBanner from "./DevBanner";

export default async function GameIdDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // await the promise to get the id
  // try
  // now still in server component, just savely get game content
  const game = await getGameById(parseInt(id));
  if (!game) {
    redirect(ALL_NAVPATH.not_found.href);
  }
  return (
    <div className="w-full flex flex-col grow">
      {/* Background Cover Image */}
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
      {/* <DevBanner game_id={game.id} developers={game.developer} /> */}
      {/* 主要内容，使用页面包裹 */}
      <div
        className="relative flex grow flex-col items-center
  gap-6 mx-auto pb-4 max-w-[100vw] lg:max-w-[90%] min-w-3/5 lg:min-w-[50%] w-full h-fit 
   bg-card"
      >
        {/* Online Game full screen/embed Modal */}
        {game.online ? (
          <EmbededCanvas
            online={game.online}
            cover_img={game.coverImage}
          ></EmbededCanvas>
        ) : (
          <Image
            alt={game.title}
            src={game.coverImage}
            width={800}
            height={400}
            className="w-full h-auto object-contain"
          />
        )}
        <div className=" box-border px-8 w-full flex flex-col gap-8 lg:flex-row lg:justify-between">
          {/* Left column - Game info */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            {/* TODO: TOO WIDE */}
            <h2>{game.title}</h2>

            <div className=" whitespace-pre-line break-words">
              {/*将\r\n或\n识别为换行符并换行*/}
              {game.description}
            </div>
            <GameTags tags={game.tags} id="game_detail_" />
            <div>
              <div className="flex flex-row gap-3">
                作者:
                {game.developers.map((dev) => (
                  <Link
                    key={"developer_" + dev.id}
                    href={ALL_NAVPATH.user_id.href(dev.id)}
                  >
                    {dev.name}
                  </Link>
                ))}
              </div>
              <div>发布日期: {game.createdAt}</div>
            </div>
              <Button
                asChild
                className="w-fit"
              >
                <Link href={game.downloadUrl}>
                <Download />
                下载游戏（{game.size}）
                </Link>
              </Button>
          </div>

          {/* Right column - Screenshots */}
          <div className=" lg:max-w-1/2 lg:min-w-1/3 flex flex-col gap-2 lg:gap-6">
            <h2>游戏截图</h2>
            {game.screenshots.length > 0 ? (
              <GamePoster
                imageList={game.screenshots.map((screenshot, index) => ({
                  imgSrc: screenshot,
                  alt: `${game.title}_screen${index}`,
                }))}
              />
            ) : (
              <h2>暂无游戏截图~</h2>
            )}
          </div>
        </div>
        {/* <CommentZone gameId={game.id}/> */}
      </div>
    </div>
  );
}
