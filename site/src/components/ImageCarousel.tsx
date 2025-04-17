"use client"

import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

//定时轮换图片的组件,Carousel是旋转木马的意思.
//参数是images以及轮换间隔interval
const ImageCarousel = ({ images = [], interval = 3000 }:{ images: string[]; interval?: number }) => {
    const [current, setCurrent] = useState(0);//当前所在的image序号(从0开始)
  
    useEffect(() => {
      if (!images.length) return;
      //设置一个每隔interval的时间就会触发的计时器
      const timer = setInterval(() => {
        setCurrent(prev => (prev + 1) % images.length);
      }, interval);
      return () => clearInterval(timer);
    }, [images, interval]);
    //useEffect在images和interval变化时自动触发(先调用return在重新运行)
  
    const prevSlide = () => {
      setCurrent(prev => (prev - 1 + images.length) % images.length);
    };
    const nextSlide = () => {
      setCurrent(prev => (prev + 1) % images.length);
    };
  
    if (!images.length) return null;
  
    return (
      <Box className="flex justify-center border border-black">
        <div className="relative w-full h-200 overflow-hidden">
            {/* 通过控制opacity来实现只有一张image出现 */}
            {images.map((src, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-20 transition-opacity duration-1000 ${idx === current ? 'opacity-100' : 'opacity-0 hidden'}`}
                >
                    <img src={src} alt={`slide-${idx}`} className="w-full h-full object-cover border border-black" />
                </div>
            ))}
            <IconButton
                onClick={prevSlide}
                className="absolute top-1/2 left-0 transform -translate-y-1/2"
            >
                <ArrowBackIos />
            </IconButton>
            <IconButton
                onClick={nextSlide}
                className="absolute top-1/2 right-0 transform -translate-y-1/2"
            >
                <ArrowForwardIos />
            </IconButton>
        </div>
      </Box>
    );
  };
  
  export default ImageCarousel;