import { getGameById } from "@/services/game";
import Link from "next/link";
import EmbededCanvas from "./EmbededCanvas";
import Image from "next/image";
import { Button, Card, CardMedia, Chip, Typography } from "@mui/material";
import { Download, PlayArrow } from "@mui/icons-material";
import GamePoster from "@/components/GamePosters";

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  // now still in server component, just savely get game content

  const game = await getGameById(id);

  return (
    <main className="w-full h-fit">
      {/* Background Cover Image */}
      <div className="fixed inset-0 -z-10">
        <Image
          src={game.cover_image}
          alt={game.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <div
        className="relative flex flex-col items-center 
        gap-6 mx-auto pb-6 px-6 max-w-[90%] min-w-[60%] h-fit bg-[var(--background)]"
        style={{
          width: typeof game.online === "object" ? game.online.width : "80%",
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
          <></>
        )}
        <div className="flex flex-col lg:flex-row gap-8 lg:justify-between">
          {/* Left column - Game info */}
          <div className="lg:w-1/2 space-y-6">
            <Typography variant="h3" component="h3" className="font-bold">
              {game.title}
            </Typography>

            <Typography variant="body1">
              {game.description}
            </Typography>

            <div className="flex flex-wrap gap-2 mt-2">
              {game.tags?.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  color="primary"
                  size="small"
                />
              ))}
            </div>

            <div className="">
              <Typography variant="subtitle1">
                作者: {game.developer.name}
              </Typography>
              <Typography variant="subtitle2">
                发布日期: {new Date(game.release_date).toLocaleDateString()}
              </Typography>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                href={game.download_url}
              >
                下载游戏
              </Button>
            </div>
          </div>

          {/* Right column - Screenshots */}
          <div className="max-w-1/2">
            <Typography variant="h5" sx={{mb:6}}>
              游戏截图
            </Typography>
            <GamePoster
              imageList={game.screenshots.map((screenshot, index) => ({
                imgSrc: screenshot,
                alt: `${game.title}_screen${index}`,
              }))}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
