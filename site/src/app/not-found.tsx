"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';

// Define your primary color directly instead of using useTheme
const PRIMARY_COLOR = "#f44336"; // Replace with your actual primary color

export default function NotFound() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  // Animation for the game character
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        const newX = prev.x + direction.x * 1;
        const newY = prev.y + direction.y * 1;
        
        // Bounce when hitting edges
        let newDirX = direction.x;
        let newDirY = direction.y;
        
        if (newX > 80 || newX < 20) newDirX = -direction.x;
        if (newY > 80 || newY < 20) newDirY = -direction.y;
        
        if (newDirX !== direction.x || newDirY !== direction.y) {
          setDirection({ x: newDirX, y: newDirY });
        }
        
        return {
          x: Math.max(20, Math.min(80, newX)),
          y: Math.max(20, Math.min(80, newY))
        };
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [direction]);
  
  return (
    <div className="flex flex-col items-center justify-center grow relative overflow-hidden">
      {/* Moving game character */}
      <div 
        className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 opacity-50"
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
        <h1 
          className="text-9xl font-bold mb-2"
          style={{ color: PRIMARY_COLOR }}
        >
          404
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-4">游戏不存在</h2>
          <p className="text-gray-600 mb-6">
          哎呀！您所寻找的游戏关卡并不存在，让我们回到首页。
          </p>
          <Link href="/" passHref>
            <Button 
              variant="contained" 
              size="large"
              sx={{ bgcolor: PRIMARY_COLOR }}
            >
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}