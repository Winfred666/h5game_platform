"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Dialog, IconButton } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";

export default function GamePosters({
  imageList,
  onDelete,
  small,
}: {
  imageList: { imgSrc: string; alt: string }[];
  onDelete?: (index: number) => void; // onDelete function to delete the image
  small?: boolean; // Whether to display in a row
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  return (
    <div className={" flex w-full flex-row justify-start " + (small ? " gap-2 flex-nowrap":" gap-10 flex-wrap")}>
      {imageList.map(({ imgSrc, alt }, index) => (
        <div
          className="relative overflow-hidden cursor-pointer shadow w-fit h-fit"
          key={alt}
        >
          <Image
            height={small ? 150 : 200}
            width={small ? 200 : 300}
            src={imgSrc}
            alt={alt}
            className=" bg-white max-h-80 object-cover hover:scale-[102%] transition-transform rounded-sm"
            onClick={() => setSelectedImage(imgSrc || null)}
          />
          {onDelete && (
            <div className="absolute z-10 top-4 right-4 rounded-full bg-white/50">
              <IconButton color="primary" onClick={() => onDelete(index)}>
                <DeleteIcon />
              </IconButton>
            </div>
          )}
        </div>
      ))}

      {/* Screenshot Modal */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="xl"
        fullWidth
      >
        <div className="relative">
          <div className="absolute top-2 right-2 rounded-full bg-white/50 z-10">
            <IconButton color="primary" onClick={() => setSelectedImage(null)}>
              <CloseIcon />
            </IconButton>
          </div>
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Screenshot"
              width={window.innerWidth <= 768 ? 600: 1200}
              height={window.innerWidth <= 768 ? 400: 800}
              className="w-full object-contain"
            />
          )}
        </div>
      </Dialog>
    </div>
  );
}
