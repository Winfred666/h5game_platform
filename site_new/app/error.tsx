"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Hexagon, AlertTriangle } from "lucide-react";

// --- Configuration for our static background hexagons ---
// We keep the hexagon theme but make it static and subtle for the error page.
const STATIC_HEXAGONS = [
  {
    size: "w-24 h-24",
    colorClass: "text-destructive/10",
    position: "top-1/4 left-[15%]",
  },
  {
    size: "w-16 h-16",
    colorClass: "text-primary/30",
    position: "bottom-[15%] right-[20%]",
  },
  {
    size: "w-40 h-40",
    colorClass: "text-primary/20",
    position: "top-[10%] right-[5%]",
    animation: "", 
  },
];

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    // Main container to center content, same as the loading page
    <div className="flex grow items-center justify-center relative overflow-hidden h-[70vh]">
      {/* Background decoration: Static hexagons */}
      <div className="absolute inset-0 z-10">
        {STATIC_HEXAGONS.map((hex, i) => (
          <div key={i} className={`absolute ${hex.position}`}>
            <Hexagon
              className={`${hex.size} ${hex.colorClass} animate-pulse `}
              fill="currentColor"
              strokeWidth={0}
            />
          </div>
        ))}
      </div>

      {/* Main error card, sits on top with a higher z-index */}
      <Card className="z-20 w-full max-w-md text-center shadow-xl bg-card/80 backdrop-blur-sm border-destructive/50">
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <CardTitle className="text-destructive">出错了</CardTitle>
          </div>
        <CardContent>
          <p className="text-muted-foreground">
            请坐和放宽，您可以尝试刷新页面或稍后再试。
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            再试一次
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}