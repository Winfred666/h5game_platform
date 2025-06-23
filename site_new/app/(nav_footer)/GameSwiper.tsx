"use client";

// Swiper styles are kept

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cloud, Laptop, ArrowRight } from "lucide-react"; // Replaced MUI icons

import GameTags from "@/components/GameTags";
import GamePosters from "@/components/GamePosters";

import { Button } from "@/components/ui/button"; // Replaced MUI Button
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"
import { useRef } from "react";
import { IGame } from "@/lib/types/igame";
import { ALL_NAVPATH } from "@/lib/router_info";

type SwiperPropItem = IGame

const GameSwiper = ({ swipers }: { swipers: SwiperPropItem[] }) => {
  const router = useRouter();
  const autoPlayPlugin = useRef(Autoplay({delay: 3000, stopOnMouseEnter: true}));
  // We will use Tailwind's `hover:` modifiers instead.
  return (
    <div className="pointer-events-auto">
      <Carousel
        // A defined height is better for layout stability
        className="homepage-swiper h-screen/2 lg:h-[500px]"
        plugins={[autoPlayPlugin.current]}
        opts={{
          loop: true,
          align: "center",
        }}
      >
        <CarouselContent>
        {swipers.map((val: SwiperPropItem, index: number) => (
          <CarouselItem key={`slide_${index}`} className=" relative w-full overflow-hidden">
            {/* Background Image and Overlay */}
            <Image
              src={val.coverImage}
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
                onClick={() => router.push(ALL_NAVPATH.game_id.href(val.id))}
              >
                <Image
                  key={val.coverImage}
                  src={val.coverImage}
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
                    onClick={() => router.push(ALL_NAVPATH.game_id.href(val.id))}
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
                    {val.joinDevelopers}
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
          </CarouselItem>
        ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default GameSwiper;