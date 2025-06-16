"use client";

import "./globals.css";

import { useEffect, useState } from 'react';
import { Button, Paper} from '@mui/material';
import { usePathname, useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/services/router_info";

// Define your primary color directly instead of using useTheme
const PRIMARY_COLOR = "#df546b"; // Replace with your actual primary color

export default function NotFound() {
  const router = useRouter();
  const path = usePathname();

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [directionIndex, setDirectionIndex] = useState(0);

  // Define rectangle bounds and speed
  const min = 20;
  const max = 80;
  const speed = 2;

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        let { x, y } = prev;
          // Clockwise directions: right, down, left, up
        const directions = [
          { x: 1, y: 0 },  // move right
          { x: 0, y: 1 },  // move down
          { x: -1, y: 0 }, // move left
          { x: 0, y: -1 }  // move up
        ];

        const dir = directions[directionIndex];

        // Advance position
        x += dir.x * speed;
        y += dir.y * speed;

        // Check if we've hit the next corner, advance direction
        let nextIndex = directionIndex;
        if (directionIndex === 0 && x >= max) nextIndex = 1;       // right -> down
        if (directionIndex === 1 && y >= max) nextIndex = 2;       // down -> left
        if (directionIndex === 2 && x <= min) nextIndex = 3;       // left -> up
        if (directionIndex === 3 && y <= min) nextIndex = 0;       // up -> right

        if (nextIndex !== directionIndex) {
          setDirectionIndex(nextIndex);
        }

        // Clamp to bounds
        x = Math.max(min, Math.min(max, x));
        y = Math.max(min, Math.min(max, y));

        return { x, y };
      });
    }, 50);
    return () => clearInterval(interval);
  }, [directionIndex]);

  
  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden h-screen">
      {/* Moving game character */}
      <div 
        className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
        style={{ 
          left: `${position.x}%`, 
          top: `${position.y}%`,
          color: PRIMARY_COLOR
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15Z" />
        </svg>
      </div>
      
      {/* Main content */}
      <div className="text-center px-4 z-10">
        <div 
          className="text-9xl font-bold mb-4"
          style={{ color: PRIMARY_COLOR }}
        >
          404
        </div>
        <Paper elevation={0} className="p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-4">
          {path.endsWith("user") ? "用户不存在" : "这里没有游戏"}</h2>
          <p className=" mb-6">
          哎呀！您所寻找的{path.endsWith("user") ? "用户" : "游戏关卡"}并不存在，让我们回到首页。
          </p>
            <Button 
              variant="contained" 
              size="large"
              onClick={()=>router.replace(ALL_NAVPATH.home.href)}
            >
              返回首页
            </Button>
        </Paper>
      </div>
      {/* Background */}
    </div>
  );
}