"use client";
import { useEffect, useRef, useState } from "react";
import { IOnlineEmbed } from "@/lib/types/igame";
import { Button } from "@/components/ui/button";
import { Fullscreen, Play } from "lucide-react";
import { useWindowSize } from "@/lib/hooks/useBrowser";
import { increViewsAction } from "@/lib/querys&actions/postViews";

export default function EmbededCanvas({
  gameId,
  online,
  coverImg,
}: {
  gameId: string;
  online: IOnlineEmbed|undefined;
  coverImg: string;
}) {
  // is_playing and is_fullscreen are both specific to embed mode, not for jump/fullscreen/download mode.
  const [is_playing, set_playing] = useState<boolean>(false);
  const [is_fullscreen, set_fullscreen] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // set playing the game directly if embed + auto play
  useEffect(() => {
    if (online && online.mode === "embed" && online.isAutoStarted) {
      set_playing(true);
    }
  }, [online]);


  const { width, height } = useWindowSize();

  let finalWidth,finalHeight,finalAspectRatio="auto";
  if (!online || online.mode === "jump" || online.mode === "fullscreen") {
    finalWidth = "100%";
    finalHeight = "auto";
    finalAspectRatio = "3"; // for a banner style 3 width 1 heigth.
  } else if (online.mode === "embed" && !is_fullscreen) {
    if (width !== null && online.width > width) {
      finalWidth = "100vw";
    } else {
      finalWidth = `${online.width}px`;
    }
    if (height !== null && online.height > height) {
      finalHeight = "85vh";
    } else {
      finalHeight = `${online.height}px`;
    }
  } else if(online.mode === "embed" && is_fullscreen){
    finalWidth = "100vw";
    finalHeight = "100vh";
  }

  // Determine iframe scroll behavior based on config
  const iframeOverflow =
    online && online.mode === "embed" && !online.enableScrollbars
      ? "hidden"
      : "auto";

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
          width: finalWidth,
          height: finalHeight,
          aspectRatio: finalAspectRatio,
          backgroundImage: `url(${coverImg})`,
          backgroundColor: is_fullscreen ? "black" : "transparent", // Black background in fullscreen
        }}
      >
        {(online && is_playing) ? (
          <iframe
            ref={iframeRef}
            src={online.url}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            allow="fullscreen; gamepad; microphone; camera"
            // scrolling is deprecated; omit it
            style={{ overflow: iframeOverflow as any }}
            onLoad={() => {
              if (online.mode !== "embed" || online.enableScrollbars) return;
              try {
                const doc =
                  iframeRef.current?.contentDocument ??
                  iframeRef.current?.contentWindow?.document;
                if (!doc) return;

                // Inject CSS to hide scrollbars inside the iframe
                const style = doc.createElement("style");
                style.textContent = `
                  html, body { overflow: hidden !important; overscroll-behavior: none; }
                  /* optional: hide visible scrollbars in some engines */
                  ::-webkit-scrollbar { display: none; width: 0; height: 0; }
                `;
                doc.head?.appendChild(style);

                // Prevent wheel/touch scrolling as a fallback
                const prevent = (e: Event) => e.preventDefault();
                doc.addEventListener("wheel", prevent, { passive: false });
                doc.addEventListener("touchmove", prevent, { passive: false });
              } catch {
                // Cross-origin: cannot access. The embedded page must handle overflow itself.
              }
            }}
          />
        ) : online && (
          <Button
            size="lg"
            onClick={() => {
              // for fullscreen game, just open new tab
              increViewsAction(gameId);
              if (online.mode !== "embed") {
                window.open(online.url, "_blank", "noopener");
              } else {
                set_playing(true);
              }
            }}
          >
            <Play />
            {online.mode === "jump" ? "点击跳转" : "开始游戏"}
          </Button>
        )}



        {/* Control Buttons */}
        {online && online.mode === "embed" && online.hasFullscreenButton && (
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
        )}
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
