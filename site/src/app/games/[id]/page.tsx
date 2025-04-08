import { getGameById } from "@/services/game";
import Link from "next/link";
import EmbededCanvas from "./EmbededCanvas";
import Image from "next/image";
import { Button, Card, CardMedia, Chip, Typography } from "@mui/material";
import { Download, PlayArrow } from "@mui/icons-material";
import GamePoster from "@/components/GamePoster";

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  // now still in server component, just savely get game content

  const game = await getGameById(id);
  return (
    <main>
      {/* Background Cover Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src={game.cover_image}
          alt={game.title}
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Game info */}
          <div className="lg:w-1/2 space-y-6">
            <Typography
              variant="h2"
              component="h1"
              className="text-white font-bold"
            >
              {game.title}
            </Typography>

            <Typography variant="body1" className="text-gray-200">
              {game.description}
            </Typography>

            <div className="flex flex-wrap gap-2">
              {game.tags?.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  color="primary"
                  size="small"
                  className="bg-blue-600"
                />
              ))}
            </div>

            <div className="bg-gray-800 bg-opacity-70 p-4 rounded-lg">
              <Typography variant="subtitle1" className="text-white">
                作者: {game.developer.name}
              </Typography>
              <Typography variant="subtitle2" className="text-gray-300">
                发布日期: {new Date(game.release_date).toLocaleDateString()}
              </Typography>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                href={game.download_url}
                className="bg-blue-600 hover:bg-blue-700"
              >
                下载游戏
              </Button>
            </div>
          </div>

          {/* Right column - Screenshots */}
          <div className="lg:w-1/2">
            <Typography variant="h5" className="text-white mb-4">
              游戏截图
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {game.screenshots.map((screenshot, index) => (
                <GamePoster
                  imgSrc={screenshot}
                  key={`${game.title}_screen${index}`}
                  alt={`${game.title}_screen${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Online Game full screen/embed Modal */}
      {game.online ? (
        <EmbededCanvas
          online={game.online}
          cover_img={game.cover_image}
        ></EmbededCanvas>
      ) : (
        <></>
      )}
    </main>
  );
}
