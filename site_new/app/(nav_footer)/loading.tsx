import { Card, CardContent } from "@/components/ui/card";
import { Hexagon, Loader2 } from "lucide-react";

// --- Configuration for our orbiting hexagons ---
// This data is generated on the server once per render.
const ORBITING_HEXAGONS = [
  {
    size: "w-10 h-10",
    colorClass: "text-primary/70",
    orbitRadius: 100, // in pixels
    animationDuration: "8s",
    initialRotation: Math.floor(Math.random() * 360),
  },
  {
    size: "w-16 h-16",
    colorClass: "text-primary/50",
    orbitRadius: 160,
    animationDuration: "10s",
    initialRotation: Math.floor(Math.random() * 360),
  },
  {
    size: "w-12 h-12",
    colorClass: "text-primary/30",
    orbitRadius: 280,
    animationDuration: "15s",
    initialRotation: Math.floor(Math.random() * 360),
  },
];

export default function Loading() {
  return (
    // Main container to center content
    <div className="flex grow items-center justify-center relative overflow-hidden h-[70vh]">
      {/* Container for the tornado/orbit animation */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {ORBITING_HEXAGONS.map((hex, i) => (
          // This is the "arm" that rotates. It's an invisible div.
          <div
            key={i}
            className="absolute animate-orbit"
            style={
              {
                "--initial-rotation": `${hex.initialRotation}deg`,
                animationDuration: hex.animationDuration,
              } as React.CSSProperties
            }
          >
            {/* This is the hexagon at the end of the arm, pushed out by its radius */}
            <div
              className={`absolute ${hex.size} ${hex.colorClass}`}
              style={{ transform: `translateY(-${hex.orbitRadius}px)` }}
            >
              <Hexagon
                className="h-full w-full animate-spin"
                style={{ animationDuration: "5s" }} // Make the hexagon itself spin slowly
                fill="currentColor"
                strokeWidth={0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Main loading text, sits on top with a higher z-index */}
      <Card className="z-20 w-full max-w-md text-center shadow-xl bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="font-bold text-primary">内容加载中</h2>
            <p className="text-muted-foreground">请稍候，精彩即将呈现...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}