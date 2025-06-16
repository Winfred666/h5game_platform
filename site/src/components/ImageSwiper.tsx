"use client";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { Typography, Button } from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";
import LaptopWindowsIcon from "@mui/icons-material/LaptopWindows";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GameTags from "./GameTags";
import { IGameTag } from "@/types/igame";
import { useState } from "react";
import GamePosters from "./GamePosters";
import { useRouter } from "next/navigation";

type SwiperPropItem = {
  src: string;
  link: string;
  title: string;
  screenshots: string[];
  tags: IGameTag[];
  online: boolean;
  developers: string;
};

const ImageSwiper = ({ swipers }: { swipers: SwiperPropItem[] }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  return (
    // pointer-events: auto 是 CSS 的默认值,表示该元素可以响应鼠标事件(如点击、悬停等)
    <div className="pointer-events-auto">
      <Swiper
        className="homepage-swiper"
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        init={true}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
      >
        {swipers.map((val: SwiperPropItem, index: number) => (
          <SwiperSlide
            key={`slide${index}`}
            className="w-full overflow-hidden"
          >
            <Image
              src={val.src}
              alt={val.src}
              fill
              className=" object-cover blur-sm lg:blur-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>

            <div className="relative w-80% lg:h-100 flex items-center gap-6 py-8 px-4 text-white">
              
              <div className=" w-1/2 h-full relative hidden lg:block bg-white cursor-pointer rounded-sm"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={()=> router.push(val.link)}
              >
              <Image
                key={val.src}
                src={val.src}
                className=" object-cover"
                alt="swiperImg"
                sizes="50vw"
                fill
                priority
              />
              </div>

              <div className="w-1/2 h-full flex flex-col grow lg:justify-around">
                <div className="w-full h-1/3 flex flex-wrap justify-around lg:justify-start lg:flex-nowrap items-center gap-2 lg:gap-8">
                  <div className=" text-2xl lg:text-4xl lg:max-w-3/5">
                    {val.title}
                  </div>
                  {val.online ? <CloudIcon /> : <LaptopWindowsIcon />}
                  <div
                    onClick={() => router.push(val.link)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className=" text-md font-semibold lg:text-xl rounded-sm cursor-pointer
                    flex flex-row gap-2 items-center py-1 px-2 lg:py-2 lg:px-4 border-solid border-2 border-white"
                    style={{
                      backgroundColor: isHovered
                        ? "white"
                        : "transparent",
                      color: isHovered ? "black" : "white",
                      transition: "background-color 0.3s, color 0.3s",
                    }}
                  >
                    <div>
                    {val.online ? "线上游玩" : "下载游玩"}
                    </div>
                    <ArrowForwardIcon className=" hidden lg:block" />
                  </div>
                </div>

                <Typography className="hidden lg:block w-full">
                  {val.developers} 
                </Typography>
                <GameTags tags={val.tags} id={`swiper_${index}`} />
                <GamePosters
                  small
                  imageList={val.screenshots.map((screenshot, index) => ({
                    imgSrc: screenshot,
                    alt: `${val.title}_screen${index}`,
                  }))}
                />

              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSwiper;
