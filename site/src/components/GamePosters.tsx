"use client";

import CloseIcon from '@mui/icons-material/Close';
import {Button, Dialog, IconButton } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";


export default function GamePosters({
  imageList,
  onDelete,
}: {
  imageList: { imgSrc: string; alt: string }[];
  onDelete?: (index: number) => void; // onDelete function to delete the image
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  return (
    <div className="flex flex-row flex-wrap justify-start gap-10">
      {imageList.map(({ imgSrc, alt },index) => (
        <div
          className="relative overflow-hidden cursor-pointer shadow"
          key={alt}
        >
          <Image
            height="200"
            width="300"
            src={imgSrc}
            alt={alt}
            className=" max-h-80 object-cover hover:scale-[102%] transition-transform rounded-sm"
            onClick={() => setSelectedImage(imgSrc || null)}
          />
          {onDelete && (
            <div className="absolute z-10 top-4 right-4 rounded-full bg-white/50">
            <IconButton
              color="primary"
              onClick={() => onDelete(index)}
            >
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
        maxWidth="sm"
        fullWidth
      >
        <div className="relative">
          <div className="absolute top-2 right-2 rounded-full bg-white/50 z-10">
          <IconButton
            color='primary'
            onClick={() => setSelectedImage(null)}
          >
            <CloseIcon />
          </IconButton>
          </div>
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Screenshot"
              width={1200}
              height={800}
              className="w-full max-h-[700px] object-contain"
            />
          )}
        </div>
      </Dialog>
    </div>
  );
}
