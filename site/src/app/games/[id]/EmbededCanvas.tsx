"use client";
import { IOnlineEmbed } from "@/types/igame";
import { Box, Button, Icon } from "@mui/material";
import { useState } from "react";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

export default function EmbededCanvas({
  online,
  cover_img,
}: {
  online: IOnlineEmbed | string;
  cover_img: string;
}) {
  const [is_playing, set_playing] = useState<boolean>(false);
  // first show the cover image, after clicking, show the online game
  return (
    <Box
      className="relative flex justify-center items-center overflow-hidden"
      sx={{
        width: typeof online === "string" ? "100%" : online.width,
        height: typeof online === "string" ? "100%" : online.height,
        maxWidth: "100%",
        maxHeight: "90vh",
        backgroundImage: `url(${cover_img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {is_playing && typeof online !== "string" ? (
        <iframe
          src={(online as IOnlineEmbed).url}
          className="w-full h-full"
        ></iframe>
      ) : (
        <Button
          variant="contained"
          size="large"
          className=" scale-150"
          startIcon={<PlayCircleOutlineIcon />}
          onClick={()=>set_playing(true)}
        >
          开始游戏
        </Button>
      )}
    </Box>
  );
}
