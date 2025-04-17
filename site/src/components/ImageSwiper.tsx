"use client";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

const ImageSwiper = ({
  swipers,
}: {
  swipers: { src: string; link: string }[],
}) => {
    return (
        // pointer-events: auto 是 CSS 的默认值,表示该元素可以响应鼠标事件(如点击、悬停等) 
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
                <div className="relative w-80% h-100">
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

  export default ImageSwiper;