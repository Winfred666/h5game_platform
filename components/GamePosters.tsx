"use client";

import Image from "next/image";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageDialog } from "./ui/image-dialog";

// --- STYLING (using cva for variants) ---

const galleryVariants = cva("flex w-full", {
  variants: {
    variant: {
      default: "flex-wrap gap-4 lg:gap-6",
      small: "gap-2", // Added padding for scrollbar visibility
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const imageCardVariants = cva(
  "relative shadow-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "h-48 lg:h-52 rounded-md aspect-[4/3]",
        small: "grow lg:grow-0 lg:aspect-[4/3] h-32",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// --- TYPE DEFINITIONS ---

interface ImageItem {
  src: string;
  alt: string;
}

interface GamePostersProps extends VariantProps<typeof galleryVariants> {
  imageList: ImageItem[];
  onDelete?: (img: ImageItem) => void;
  className?: string;
  onBlur?: () => void;
}

// --- MAIN COMPONENT ---

export default function GamePosters({
  imageList,
  onDelete,
  variant,
  className,
  onBlur,
}: GamePostersProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const handleOpenDialog = (index: number) => setSelectedImageIndex(index);
  const handleCloseDialog = () => setSelectedImageIndex(null);

  const handleNext = () => {
    if (selectedImageIndex === null) return
    // Loop back to the start if at the end
    setSelectedImageIndex((selectedImageIndex + 1) % imageList.length)
  }

  const handlePrev = () => {
    if (selectedImageIndex === null) return
    // Loop to the end if at the beginning
    setSelectedImageIndex(
      (selectedImageIndex - 1 + imageList.length) % imageList.length
    )
  }

  return (
    <div className={cn(galleryVariants({ variant }), className)}>
      {/* The Gallery Grid */}
      {imageList.map((image, index) => (
        <ImageCard
          key={`${image.alt}-${index}`}
          image={image}
          variant={variant}
          onClick={() => handleOpenDialog(index)}
          onDelete={onDelete ? () => onDelete(image) : undefined}
          onBlur={onBlur}
        />
      ))}
      {/* A SINGLE Dialog for the entire gallery */}
      <ImageDialog
        images={imageList}
        selectedIndex={selectedImageIndex}
        onClose={handleCloseDialog}
        onNext={handleNext}
        onPrev={handlePrev} />
    </div>
  );
}

// --- PURELY PRESENTATIONAL SUB-COMPONENT ---

interface ImageCardProps extends VariantProps<typeof imageCardVariants> {
  image: ImageItem;
  onClick: () => void;
  onDelete?: (img:ImageItem) => void;
  onBlur?: () => void;
}

function ImageCard({ image, variant, onClick, onDelete, onBlur }: ImageCardProps) {
  return (
    <div className={imageCardVariants({ variant })}>
      <Image
        fill
        sizes="200px"
        src={image.src}
        alt={image.alt}
        className=" cursor-pointer object-cover transition-transform duration-300 hover:scale-105"
        onClick={onClick}
      />

      {onDelete && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute z-10 top-2 right-2 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation(); // Prevent opening the dialog when clicking delete
            onDelete(image);
          }}
          aria-label={`Delete image: ${image.alt}`}
          onBlur={onBlur}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
