import EmbededCanvas from "./EmbededCanvas";
import Image from "next/image";
import { Button, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import GamePoster from "@/components/GamePosters";
import GameTags from "@/components/GameTags";
import { redirect } from "next/navigation";
import { ALL_NAVPATH } from "@/services/router_info";
import Link from "next/link";
import CommentZone from "./CommentZone";
import DevBanner from "./DevBanner";
import React from "react";
import { getGameById } from "@/services/game";

export default async function GameIdDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // await the promise to get the id
  // now still in server component, just savely get game content
  const game = await getGameById(id);
  if (!game) {
    redirect(ALL_NAVPATH.not_found.href);
  }
  // if there is online, still check whether the width is bigger than screen width
  // if it is, then set the width to 100vw, otherwise use the online.width
  // console.log(window.innerWidth, game.online?.width);
  // if( game.online && game.online.width !== null && parseInt(game.online.width) > window.innerWidth ) {
  //   game.online.width = "100%";
  // }
  // if( game.online && game.online.height !== null && parseInt(game.online.height) > window.innerHeight ) {
  //   game.online.height = "90%";
  // }
  // console.log("游戏页当前game数据");
  // console.log(game);
  
  return (
    <main className="w-full flex flex-col grow">
      {/* Background Cover Image */}
      <div className="fixed inset-0 -z-10">
        <Image
          src={game.cover_image}
          alt={game.title + "_bg"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      <DevBanner game_id={game.id} developers={game.developer} />
      <div
        className="relative flex grow flex-col items-center \
  gap-6 mx-auto pb-4 max-w-[100vw] lg:max-w-[90%] min-w-3/5 lg:min-w-[50%] w-full lg:w-3/5 h-fit bg-[var(--mui-palette-background-paper)]"
        style={{
          width: typeof game.online === "object" ? game.online.width : undefined,
        }}
      >
        {/* 主要内容，使用页面包裹 */}
        {/* Online Game full screen/embed Modal */}
        {game.online ? (
          <EmbededCanvas
            online={game.online}
            cover_img={game.cover_image}
          ></EmbededCanvas>
        ) : (
          <Image alt={game.title} src={game.cover_image} width={800} height={400} className="w-full h-auto object-contain"/>
        )}
        <div className=" box-border px-8 w-full flex flex-col gap-8 lg:flex-row lg:justify-between">
          {/* Left column - Game info */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            {/* TODO: TOO WIDE */}
            <Typography
              variant="h3"
              component="h3"
              sx={{ fontWeight: "bold", wordBreak: "break-word" }}
            >
              {game.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}
            >
              {/*将\r\n或\n识别为换行符并换行*/}
              {game.description}
            </Typography>

            <GameTags tags={game.tags} id="game_detail_" />

            <div>
              <Typography variant="body1" className="flex flex-row gap-3">
                作者:
                {game.developer.map((dev) => (
                  <Link
                    key={"developer_" + dev.id}
                    href={ALL_NAVPATH.user_id.href(dev.id)}
                  >
                    {dev.name}
                  </Link>
                ))}
              </Typography>
              <Typography variant="body1">
                发布日期: {new Date(game.release_date).toLocaleDateString()}
              </Typography>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                href={game.download_url}
              >
                下载游戏（{game.size}）
              </Button>
            </div>
          </div>

          {/* Right column - Screenshots */}
          <div className=" lg:max-w-1/2 lg:min-w-1/3 flex flex-col gap-2 lg:gap-6">
          
            <Typography variant="h5">
              游戏截图
            </Typography>
            {game.screenshots.length > 0 ? (
              <GamePoster
                imageList={game.screenshots.map((screenshot, index) => ({
                  imgSrc: screenshot,
                  alt: `${game.title}_screen${index}`,
                }))}
              />
            ):(
              <Typography variant="h6" sx={{mb:6}}>
                暂无游戏截图~
              </Typography>
            )}
          </div>
        </div>
        <CommentZone gameId={game.id}/>
      </div>
    </main>
  );
}
