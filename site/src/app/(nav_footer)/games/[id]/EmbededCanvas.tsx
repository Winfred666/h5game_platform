"use client";
import { IOnlineEmbed } from "@/types/igame";
import { Box, Button, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

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
  if(online.width &&  parseInt(online.width) > window.innerWidth){
    online.width = "100%"; // 如果在线游戏的宽度大于屏幕宽度
  }
  if(online.height &&  parseInt(online.height) > window.innerHeight){
    online.height = "85vh"; // 如果在线游戏的高度大于屏幕高度
  }
  // first show the cover image, after clicking, show the online game
  return (
    <Box
      className="flex justify-center items-center overflow-hidden"
      sx={{
        position: is_fullscreen ? "fixed" : "relative",
        zIndex: is_fullscreen ? 1000:1,
        top: 0,
        left: 0,
        width: is_fullscreen
          ? "100vw"
          : (online.width === null
          ? "100%"
          : online.width),
        height: is_fullscreen
          ? "100vh"
          : (online.height === null
          ? "30vh"
          : online.height),
        backgroundImage: `url(${cover_img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
          variant="contained"
          size="large"
          className=" scale-150"
          startIcon={<PlayCircleOutlineIcon />}
          onClick={() => {
            set_fullscreen(online.height === null);
            set_playing(true);
          }}
        >
          开始游戏
        </Button>
      )}
      <IconButton
        aria-label="full-screen"
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          background: "gray",
          color: "white",
          opacity: 0.4,
          borderRadius: "50%",
          m: 0.5,
        }}
        size="small"
        onClick={() => {
          set_fullscreen((fullscreen) => !fullscreen);
        }}
      >
        <FullscreenIcon />
      </IconButton>
    </Box>
  );
}
