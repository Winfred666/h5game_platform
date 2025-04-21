"use client";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { Typography, Button} from "@mui/material";
import CloudIcon from '@mui/icons-material/Cloud';
import LaptopWindowsIcon from '@mui/icons-material/LaptopWindows';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ImageSwiper = ({
  swipers,
}: {
  swipers: { src: string; link: string; title: string; screenshots: string[]; tags: string[]; online: boolean}[],
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
                <div className="relative w-80% h-100 flex items-center">
                    <Link href={val.link} className=" w-1/2 h-full relative bg-white">
                        <Image
                        style={{ objectFit: "cover" }}
                        key={val.src}
                        src={val.src}
                        alt="swiperImg"
                        fill
                        unoptimized
                        />
                    </Link>
                    <div className="w-1/2 h-full flex flex-col items-center justify-center bg-gradient-to-t from-black to-white">
                        <div className="w-full h-1/3 ml-10 flex items-center gap-5">
                            <Typography
                                variant="h5"
                            >
                                {val.title}
                            </Typography>
                            {val.online ? <CloudIcon /> : <LaptopWindowsIcon />}
                            <Button variant="outlined" component={Link} href={`${val.link}`}>Get the game <ArrowForwardIcon /></Button>
                        </div>
                        <div className="w-full mb-10 ml-10 flex gap-2 overflow-x-auto whitespace-nowrap">
                            {val.tags.map((tag: string, idx: number) => (
                                <Typography
                                    key={idx}
                                    variant="body2"
                                    className="px-2 py-1 bg-gray-200 rounded text-sm"
                                >
                                    {tag}
                                </Typography>
                            ))}
                        </div>
                        <div className="w-full flex justify-around mb-0 gap-1">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="relative w-2/7 h-35 bg-gray-300 flex items-center justify-center overflow-hidden"
                                >
                                    {val.screenshots[idx] ? (
                                        <Image
                                        src={val.screenshots[idx]}
                                        alt={`screenshot-${idx}`}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-400"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SwiperSlide>
            ))}
        </Swiper>
        </div>
    );
}

  export default ImageSwiper;