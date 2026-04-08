"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSlider({ data }: { data: any }) {
    if (!data?.slides || data.slides.length === 0) return null;

    return (
        <div className="w-full">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                className="w-full h-[500px] md:h-[600px] lg:h-[700px]"
            >
                {data.slides.map((slide: any, index: number) => (
                    <SwiperSlide key={index} className="relative w-full h-full">
                        <div className="relative w-full h-full">
                            <Image
                                src={slide.image || '/placeholder.jpg'}
                                alt={slide.title || "Banner"}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="text-center text-white px-4">
                                    {slide.title && (
                                        <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                                            {slide.title}
                                        </h2>
                                    )}
                                    {slide.subtitle && (
                                        <p className="text-lg md:text-xl mb-8 drop-shadow-md">
                                            {slide.subtitle}
                                        </p>
                                    )}
                                    {slide.link && (
                                        <Link
                                            href={slide.link}
                                            className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                                        >
                                            Shop Now
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
