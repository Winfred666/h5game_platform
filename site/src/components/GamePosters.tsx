"use client";

import { ClosedCaption } from "@mui/icons-material";
import { Box, Button, Card, CardMedia, Dialog, IconButton } from "@mui/material";
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
    <div className="flex flex-row justify-start gap-10">
      {imageList.map(({ imgSrc, alt },index) => (
        <Card
          className="overflow-hidden cursor-pointer hover:scale-[102%] transition-transform"
          onClick={() => setSelectedImage(imgSrc || null)}
          key={alt}
        >
          <CardMedia
            component="img"
            height="200"
            image={imgSrc || undefined}
            alt={alt}
            className="h-48 object-cover"
          />
          {onDelete && (
            <IconButton
              onClick={() => onDelete(index)}
              className="absolute top-8 right-8 bg-white bg-opacity-70 text-gray-800"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Card>
      ))}

      {/* Screenshot Modal */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="sm"
        fullWidth
      >
        <div className="relative">
          <Button
            onClick={() => setSelectedImage(null)}
            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 z-10"
          >
            <ClosedCaption />
          </Button>
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Screenshot"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          )}
        </div>
      </Dialog>
    </div>
  );
}
