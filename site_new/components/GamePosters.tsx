"use client";

import Image from "next/image";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// --- STYLING (using cva for variants) ---

const galleryVariants = cva("flex w-full", {
  variants: {
    variant: {
      default: "flex-wrap gap-4 md:gap-6",
      small: "flex-nowrap gap-2 overflow-x-auto pb-3", // Added padding for scrollbar visibility
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const imageCardVariants = cva(
  "group relative aspect-[4/3] overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "w-full sm:w-64 md:w-80",
        small: "w-48 flex-shrink-0", // Prevent shrinking in a flex row
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// --- TYPE DEFINITIONS ---

interface ImageItem {
  imgSrc: string;
  alt: string;
}

interface GamePostersProps extends VariantProps<typeof galleryVariants> {
  imageList: ImageItem[];
  onDelete?: (index: number) => void;
  className?: string;
}

// --- MAIN COMPONENT ---

export default function GamePosters({
  imageList,
  onDelete,
  variant,
  className,
}: GamePostersProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handleOpenDialog = (index: number) => setSelectedImageIndex(index);
  const handleCloseDialog = () => setSelectedImageIndex(null);

  const selectedImage =
    selectedImageIndex !== null ? imageList[selectedImageIndex] : null;

  return (
    <>
      {/* The Gallery Grid */}
      <div className={cn(galleryVariants({ variant }), className)}>
        {imageList.map((image, index) => (
          <ImageCard
            key={`${image.alt}-${index}`}
            image={image}
            variant={variant}
            onClick={() => handleOpenDialog(index)}
            onDelete={onDelete ? () => onDelete(index) : undefined}
          />
        ))}
      </div>

      {/* A SINGLE Dialog for the entire gallery */}
      <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none shadow-none">
          {selectedImage && (
            <Image
              width={1920}
              height={1080}
              src={selectedImage.imgSrc}
              alt={selectedImage.alt}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          )}
          {/* The default 'X' close button provided by Shadcn will appear automatically */}
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- PURELY PRESENTATIONAL SUB-COMPONENT ---

interface ImageCardProps extends VariantProps<typeof imageCardVariants> {
  image: ImageItem;
  onClick: () => void;
  onDelete?: () => void;
}

function ImageCard({ image, variant, onClick, onDelete }: ImageCardProps) {
  return (
    <div className={cn(imageCardVariants({ variant }))}>
      <Image
        fill
        src={image.imgSrc}
        alt={image.alt}
        className="cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
        onClick={onClick}
      />

      {onDelete && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute z-10 top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation(); // Prevent opening the dialog when clicking delete
            onDelete();
          }}
          aria-label={`Delete image: ${image.alt}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}