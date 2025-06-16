"use client";
import { CircularProgress, Paper } from "@mui/material";
import "./loading.css";

// Define your primary color directly
const PRIMARY_COLOR = "#df546b"; // Red accent color

export default function Loading() {
  const base_speed = 100;
  const random_speed = 200;
  const bounceElements = [
    { id: 1, x: 20, y: 30, dirX: base_speed + Math.random()*random_speed, dirY: -base_speed - Math.random()*random_speed, size: 12 },
    { id: 2, x: 70, y: 60, dirX: -base_speed - Math.random()*random_speed, dirY: base_speed + Math.random()*random_speed, size: 18 },
    { id: 3, x: 40, y: 75, dirX: base_speed + Math.random()*random_speed, dirY: -base_speed - Math.random()*random_speed, size: 14 },
  ];

  return (
    <div className="flex grow items-center justify-center relative overflow-hidden h-[70vh]">
      {/* Bouncing game elements in background */}
      {bounceElements.map((element) => (
        <div
          key={element.id}
          className="absolute animate-float"
          style={{
            // 通过 CSS 变量控制动画参数
            ["--startX" as any]: `${element.x}%`,
            ["--startY" as any]: `${element.y}%`,
            ["--moveX" as any]: `${element.dirX}%`, // 随机水平移动幅度
            ["--moveY" as any]: `${element.dirY}%`, // 随机垂直移动幅度
            left: "var(--startX)",
            top: "var(--startY)",
            width: `${element.size * 4}px`,
            height: `${element.size * 4}px`,
            color: PRIMARY_COLOR,
            // 随机动画参数增加自然感
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${8 + Math.random() * 8}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15Z" />
          </svg>
        </div>
      ))}

      {/* Main loading content */}
        <Paper className="text-center px-4 z-10 p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="mb-6 flex justify-center">
            <CircularProgress
              size={80}
              thickness={4}
              sx={{ color: PRIMARY_COLOR }}
            />
          </div>

          <h2 className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
            内容加载中
          </h2>

          <div className="flex justify-center items-center space-x-2 mt-6">
            <div className="animate-pulse flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    animationDelay: `${i * 0.15}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </Paper>
    </div>
  );
}
