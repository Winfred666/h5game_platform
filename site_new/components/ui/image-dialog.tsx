// components/ui/image-lightbox.tsx

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect } from "react"

// Define the shape of our image object
export interface LightboxImage {
  src: string
  alt: string
}

interface ImageLightboxProps {
  images: LightboxImage[]
  selectedIndex: number | null
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function ImageDialog({
  images,
  selectedIndex,
  onClose,
  onNext,
  onPrev,
}: ImageLightboxProps) {
  // Effect for keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedIndex === null) return

      if (event.key === "ArrowRight") {
        onNext()
      } else if (event.key === "ArrowLeft") {
        onPrev()
      } else if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedIndex, onNext, onPrev, onClose])

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="p-0 bg-transparent border-none shadow-none lg:min-w-3/5"
        aria-describedby={undefined}>
        {/*
          This is the key for accessibility. The title is here for screen readers
          but visually hidden for other users.
        */}
        <DialogTitle className="sr-only">
          {selectedImage?.alt || "Image Viewer"}
        </DialogTitle>
        
        {/* We add a relative container to position the nav buttons */}
        <div className="relative">
          {selectedImage && (
            <Image
              width={900}
              height={600}
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              priority
            />
          )}
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/75 hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Previous image"
          >
            <ChevronLeft className=" icon-lg" />
          </Button>
          {/* Next Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/75 hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Next image"
          >
            <ChevronRight className=" icon-lg" />
          </Button>
        </div>
        {/* The default 'X' close button provided by Shadcn will appear automatically and call onOpenChange */}
      </DialogContent>
    </Dialog>
  )
}