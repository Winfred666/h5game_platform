"use client";
import { useEffect, useState } from "react";
import { IOnlineEmbed } from "@/lib/types/igame";
import { Button } from "@/components/ui/button";
import { Fullscreen, Play } from "lucide-react";

export default function EmbededCanvas({
  online,
  cover_img,
}: {
  online: IOnlineEmbed;
  cover_img: string;
}) {
  const [is_playing, set_playing] = useState<boolean>(false);
  const [is_fullscreen, set_fullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        set_fullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    // 清理函数
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  "use client";
  const finalWidth = (online.width &&  online.width > window.innerWidth) ? "100%"
   : `${online.width}px`; // 如果在线游戏的宽度大于屏幕宽度
  const finalHeight = (online.height && online.height > window.innerHeight) ? "85vh"
    : `${online.height}px`; // 如果在线游戏的高度大于屏幕高度
  // first show the cover image, after clicking, show the online game
  return (
    <div
      className="flex justify-center items-center overflow-hidden bg-cover top-0 left-0 bg-center"
      style={{
        position: is_fullscreen ? "fixed" : "relative",
        zIndex: is_fullscreen ? 1000:1,
        width: is_fullscreen
          ? "100vw"
          : (online.width === null
          ? "100%"
          : finalWidth),
        height: is_fullscreen
          ? "100vh"
          : (online.height === null
          ? "30vh"
          : finalHeight),
        backgroundImage: `url(${cover_img})`,
      }}
    >
      {is_playing && typeof online !== "string" ? (
        <iframe
          src={(online as IOnlineEmbed).url}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      ) : (
        <Button
          size="lg"
          onClick={() => {
            set_fullscreen(online.height === null);
            set_playing(true);
          }}
        >
          <Play />
          开始游戏
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        aria-label="full-screen"
        className=" absolute bottom-0 right-0"
        onClick={() => {
          set_fullscreen((fullscreen) => !fullscreen);
        }}
      >
        <Fullscreen />
      </Button>
    </div>
  );
}
