"use client";
import { useEffect, useState } from "react";
import { IOnlineEmbed } from "@/lib/types/igame";
import { Button } from "@/components/ui/button";
import { Fullscreen, Play} from "lucide-react";
import { useWindowSize } from "@/lib/hooks/useBrowser";

export default function EmbededCanvas({
  online,
  cover_img,
}: {
  online: IOnlineEmbed;
  cover_img: string;
}) {
  const [is_playing, set_playing] = useState<boolean>(false);
  const [is_fullscreen, set_fullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (is_fullscreen) {
      // Hide body scroll and prevent background interaction
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      // Prevent touch scrolling on mobile
      const preventScroll = (e: TouchEvent) => e.preventDefault();
      document.addEventListener("touchmove", preventScroll, { passive: false });

      return () => {
        // Cleanup when fullscreen is disabled
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        document.body.style.filter = "";
        document.removeEventListener("touchmove", preventScroll);
      };
    }
  }, [is_fullscreen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        set_fullscreen(false);
      }
    };

    // Only add listener when in fullscreen
    if (is_fullscreen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [is_fullscreen]);

  const { width, height } = useWindowSize();
  const finalWidth =
    online.width && width && online.width > width ? "100%" : `${online.width}px`;
  const finalHeight =
    online.height && height && online.height > height ? "85vh" : `${online.height}px`;

  return (
    <>
      {/* Game Container */}
      <div
        className="flex justify-center items-center overflow-hidden bg-cover bg-center"
        style={{
          position: is_fullscreen ? "fixed" : "relative",
          top: is_fullscreen ? 0 : "auto",
          left: is_fullscreen ? 0 : "auto",
          zIndex: is_fullscreen ? 9999 : 1, // Higher z-index
          width: is_fullscreen ? "100vw" : online.width ? finalWidth : "100%",
          height: is_fullscreen ? "100vh" : online.height ? finalHeight : "30vh",
          backgroundImage: `url(${cover_img})`,
          backgroundColor: is_fullscreen ? "black" : "transparent", // Black background in fullscreen
        }}
      >
        {is_playing && typeof online !== "string" ? (
          <iframe
            src={(online as IOnlineEmbed).url}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            allow="fullscreen; gamepad; microphone; camera"
          />
        ) : (
          <Button
            size="lg"
            onClick={() => {
              set_fullscreen(!online.height);
              set_playing(true);
            }}
          >
            <Play />
            开始游戏
          </Button>
        )}

        {/* Control Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-20 hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            aria-label="toggle-fullscreen"
            onClick={() => set_fullscreen((prev) => !prev)}
          >
            <Fullscreen />
          </Button>
        </div>
      </div>

      {/* Fullscreen Backdrop */}
      {is_fullscreen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          style={{ zIndex: 9998 }}
          onClick={() => set_fullscreen(false)}
        />
      )}
    </>
  );
}
