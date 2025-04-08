"use client";

import { IOnlineEmbed } from "@/types/igame";
import { ClosedCaption } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useState } from "react";

export default function EmbededCanvas({
  online,
  cover_img,
}: {
  online: IOnlineEmbed | string;
  cover_img: string;
}) {
  return (
    // first show the cover image
    <Box className="h-52 w-auto rounded shadow">
      {typeof online === "string" ? (
        <></>
      ) : (
        <iframe
          src={online.url}
          width={online.width}
          height={online.height}
          className="w-full h-full"
          allow="fullscreen"
        />
      )}
    </Box>
  );
}
