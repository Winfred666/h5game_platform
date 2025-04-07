import { Box } from "@mui/material";

export default function GamePoster({
  imgSrc,
  alt,
}: {
  imgSrc: string;
  alt: string;
}) {
  return (
    <Box
      component="img"
      src={imgSrc || undefined}
      alt={alt}
      className=" h-52 w-auto rounded shadow"
    />
  );
}
