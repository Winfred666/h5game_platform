"use client";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

function MySwiper({
  childrens,
  swipers,
  width,
  height,
}: {
  childrens: React.ReactNode;
  swipers: { src: string; link: string }[],
  width: number,
  height: number,
}) {
  return (
    <div className="pointer-events-auto">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        init={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
      >
        {swipers.map((val: any, index: number) => (
          <SwiperSlide
            key={`slide${index}`}
            className="w-full h-full flex justify-center items-center"
          >
            <div style={{ position: "relative", width, height }}>
              <Link href={val.link} className=" w-full h-full">
                <Image
                  style={{ objectFit: "cover" }}
                  key={val.src}
                  src={val.src}
                  alt="swiperImg"
                  fill
                  unoptimized
                />
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default MySwiper;
