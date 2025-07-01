import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ghost, TriangleAlert } from "lucide-react";
import { ALL_NAVPATH } from "@/lib/clientConfig";

import "./animation.css"

// --- Configuration for background wandering elements ---
// This runs once on the server during render.
const wanderingElements = [
  {
    delay: "0s",
    duration: "12s",
    size: "w-24 h-24",
  },
  {
    delay: "-10s",
    duration: "18s",
    size: "w-32 h-32",
  },
];

export default function NotFound() {
  return (
    <div className="flex grow items-center justify-center relative overflow-hidden h-screen bg-background">
      {/* Subtle wandering background elements */}
      {wanderingElements.map((el, i) => (
        <div
          key={i}
          className="absolute animate-wander"
          style={
            {
              animationDelay: el.delay,
              animationDuration: el.duration,
            } as React.CSSProperties
          }
        >
          <Ghost className={`${el.size} text-primary`} />
        </div>
      ))}

      {/* Main content card */}
      <Card className="z-10 w-4/5 lg:w-full max-w-md text-center shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <h1
            className="font-black text-primary"
            data-text="404"
          >
            404
          </h1>
          <CardTitle className="flex items-center justify-center gap-2 font-bold pt-4">
            <TriangleAlert className="h-6 w-6" />
            这里没有游戏
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            抱歉，您访问的页面不存在，让我们回到首页。
          </p>
          {/* 
            The `asChild` prop makes the Button component pass its props down to the Link,
            effectively styling the link as a button. This is the correct pattern.
          */}
          <Button asChild size="lg">
            <Link href={ALL_NAVPATH.home.href()}>返回首页</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}