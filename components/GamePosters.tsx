"use client";

import Image from "next/image";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

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

const imageCardVariants = cva("relative shadow-sm overflow-hidden", {
  variants: {
    variant: {
      default: "h-48 lg:h-52 rounded-md aspect-[4/3]",
      small: "grow lg:grow-0 lg:aspect-[4/3] h-32",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// --- TYPE DEFINITIONS ---

interface ImageItem {
  src: string;
  alt: string;
}

interface GamePostersProps extends VariantProps<typeof galleryVariants> {
  id: string; // To help React identify the component uniquely
  imageList: ImageItem[];
  onDelete?: (img: ImageItem) => void;
  className?: string;
  onBlur?: () => void;
}

// --- MAIN COMPONENT ---

export function SwiperNavigationButton({ id, offsetPixel }: { id: string; offsetPixel: number }) {
  const darkGhostClasses = " absolute top-1/2 z-30 -translate-y-1/2 text-white bg-black/50 hover:bg-black/75";
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`${id}-prev-button ${darkGhostClasses}`}
        style={{ left: `${offsetPixel}px` }}
        aria-label="Previous image"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <ChevronLeft/>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`${id}-next-button ${darkGhostClasses}`}
        style={{ right: `${offsetPixel}px` }}
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <ChevronRight />
      </Button>
    </>
  );
}

export default function GamePosters({
  id,
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
      {selectedImageIndex !== null && (
        <Dialog
          open={selectedImageIndex !== null}
          onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        >
          <DialogContent
            className=" bg-transparent border-none shadow-none p-0 
            min-w-[80vw] h-[60vh] lg:h-[70vh]
            [&>button]:text-white [&>button]:bg-black/50 [&>button]:hover:bg-black/75 [&>button]:scale-150"
            aria-describedby={undefined}
          >
            <DialogTitle className="sr-only">图片预览</DialogTitle>
            <Swiper
              initialSlide={selectedImageIndex ?? 0}
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: `.${id}-next-button`,
                prevEl: `.${id}-prev-button`,
              }}
              pagination={{ clickable: true }}
              className="relative w-[75vw] h-full z-0"
            >
              {imageList.map((image, index) => (
                <SwiperSlide
                  key={`${id}_${index}`}
                  className="relative w-full h-auto max-h-full"
                >
                  <Image
                    fill
                    src={image.src}
                    alt={image.alt}
                    className="object-contain select-none"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <SwiperNavigationButton id={id} offsetPixel={0} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// --- PURELY PRESENTATIONAL SUB-COMPONENT ---

interface ImageCardProps extends VariantProps<typeof imageCardVariants> {
  image: ImageItem;
  onClick: () => void;
  onDelete?: (img: ImageItem) => void;
  onBlur?: () => void;
}

function ImageCard({
  image,
  variant,
  onClick,
  onDelete,
  onBlur,
}: ImageCardProps) {
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
