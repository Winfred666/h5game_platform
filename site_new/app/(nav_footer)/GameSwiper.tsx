"use client";

// Swiper styles are kept
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cloud, Laptop, ArrowRight } from "lucide-react"; // Replaced MUI icons

import GameTags from "./GameTags";
import GamePosters from "./GamePosters";
import { IGameTag } from "@/types/igame";

import { Button } from "@/components/ui/button"; // Replaced MUI Button

type SwiperPropItem = {
  src: string;
  link: string;
  title: string;
  screenshots: string[];
  tags: IGameTag[];
  online: boolean;
  developers: string;
};

const GameSwiper = ({ swipers }: { swipers: SwiperPropItem[] }) => {
  const router = useRouter();

  // The 'isHovered' state is no longer needed for styling!
  // We will use Tailwind's `hover:` modifiers instead.

  return (
    <div className="pointer-events-auto">
      <Swiper
        // A defined height is better for layout stability
        className="homepage-swiper h-screen/2 lg:h-[500px]"
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
      >
        {swipers.map((val: SwiperPropItem, index: number) => (
          <SwiperSlide key={`slide${index}`} className="w-full overflow-hidden">
            {/* Background Image and Overlay */}
            <Image
              src={val.src}
              alt={`${val.title} background`}
              fill
              className="object-cover blur-md lg:blur-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />

            {/* Content Area */}
            <div className="relative mx-auto flex h-full max-w-screen-xl items-center gap-8 p-4 text-white lg:p-8">
              {/* Left Side: Game Poster */}
              <div
                className="relative hidden h-full w-2/5 cursor-pointer overflow-hidden rounded-md lg:block"
                onClick={() => router.push(val.link)}
              >
                <Image
                  key={val.src}
                  src={val.src}
                  className="object-cover"
                  alt={`${val.title} poster`}
                  sizes="40vw"
                  fill
                  priority={index === 0} // Only prioritize the first image
                />
              </div>

              {/* Right Side: Game Details */}
              <div className="flex h-full flex-1 flex-col justify-center gap-4 lg:justify-between">
                {/* Top Section: Title and Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-3xl font-bold lg:text-5xl">{val.title}</h2>
                  <Button
                    variant="outline"
                    className="h-auto shrink-0 border-2 border-white bg-transparent px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-white hover:text-black lg:text-lg"
                    onClick={() => router.push(val.link)}
                  >
                    {val.online ? (
                      <Cloud className="mr-2 h-5 w-5" />
                    ) : (
                      <Laptop className="mr-2 h-5 w-5" />
                    )}
                    {val.online ? "线上游玩" : "下载游玩"}
                    <ArrowRight className="ml-2 hidden h-5 w-5 lg:block" />
                  </Button>
                </div>

                {/* Middle Section: Developer and Tags */}
                <div className="flex flex-col gap-4">
                  {/* Replaced Typography with a simple <p> tag */}
                  <p className="hidden text-lg text-neutral-300 lg:block">
                    {val.developers}
                  </p>
                  <GameTags tags={val.tags} id={`swiper_${index}`} />
                </div>

                {/* Bottom Section: Screenshots */}
                <GamePosters
                  small
                  imageList={val.screenshots.map((screenshot, s_index) => ({
                    imgSrc: screenshot,
                    alt: `${val.title}_screen${s_index}`,
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

export default GameSwiper;