"use client";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import GameTags from "@/components/GameTags";
import { useState } from "react";
import GamePosters from "@/components/GamePosters";
import { useRouter } from "next/navigation";
import { IGame } from "@/lib/types/igame";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { ArrowRight, Cloud, Laptop } from "lucide-react";

type SwiperPropItem = IGame;

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
        autoplay={{ delay: 4000, disableOnInteraction: true }}
        pagination={{ clickable: true }}
        loop={true}
      >
        {swipers.map((val: SwiperPropItem, index: number) => (
          <SwiperSlide key={`slide${index}`} className="w-full overflow-hidden">
            <Image
              alt={`bg_${val.title}`}
              src={val.coverImage}
              fill
              priority
              sizes="50vw"
              className=" object-cover blur-sm lg:blur-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>

            <div className="relative h-full w-full flex gap-6 pb-8 pt-2 lg:pt-8 px-4 lg:px-8 text-white">
              <div
                className=" w-2/5 h-full relative hidden lg:block bg-white cursor-pointer rounded-lg"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => router.push(ALL_NAVPATH.game_id.href(val.id))}
              >
                <Image
                  alt={`poster_${val.title}`}
                  src={val.coverImage}
                  className=" object-cover"
                  sizes="50vw"
                  fill
                  priority
                />
              </div>

              <div className="h-full flex flex-col justify-between lg:gap-4">
                <div className="w-full flex flex-wrap justify-start lg:flex-nowrap items-center gap-4 lg:gap-8
                 font-medium">
                  <div className="text-2xl lg:max-w-3/5 overflow-hidden">
                    {val.title}
                  </div>
                  <div className="icon-lg">
                  {val.online ? <Cloud /> : <Laptop />}
                  </div>
                  <div
                    onClick={()=> router.push(ALL_NAVPATH.game_id.href(val.id))}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="rounded-sm cursor-pointer
                    flex flex-row gap-2 items-center p-1 px-2 lg:py-2 lg:px-4 border-solid border-2 border-white"
                    style={{
                      backgroundColor: isHovered ? "white" : "transparent",
                      color: isHovered ? "black" : "white",
                      transition: "background-color 0.3s, color 0.3s",
                    }}
                  >
                    <div>{val.online ? "线上游玩" : "下载游玩"}</div>
                    <ArrowRight className=" hidden lg:block" />
                  </div>
                </div>

                <div className="hidden lg:block w-full">
                  {val.developers.map(dev=>dev.name).join(", ")}
                </div>
                <GameTags tags={val.tags} id={`swiper_${index}`} />
                <GamePosters
                  variant="small"
                  imageList={val.screenshots.map((screenshot, index) => ({
                    src: screenshot,
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
