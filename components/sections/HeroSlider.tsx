"use client";

import { useId } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSlider({ data }: { data: any }) {
    const id = useId();
    const sectionId = id.replace(/:/g, '');

    if (!data?.slides || data.slides.length === 0) return null;

    return (
        <div className="w-full relative group/hero">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                navigation={{
                    prevEl: `.prev-${sectionId}`,
                    nextEl: `.next-${sectionId}`,
                }}
                pagination={{ 
                    clickable: true,
                    bulletActiveClass: '!bg-white !w-8',
                    bulletClass: 'swiper-pagination-bullet !bg-white/30 !opacity-100 !transition-all !duration-500 !rounded-full'
                }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                className="w-full h-[500px] md:h-[650px] lg:h-[800px]"
            >
                {data.slides.map((slide: any, index: number) => {
                    const SlideContent = (
                        <div className="relative w-full h-full">
                            <Image
                                src={slide.image || '/placeholder.jpg'}
                                alt={slide.title || "Banner"}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                            {/* Gradient Overlay for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent flex items-center px-6 md:px-20 lg:px-32">
                                <div className="max-w-3xl text-white">
                                    <div className="space-y-6 mb-10">
                                        {slide.title && (
                                            <h2 className="text-4xl md:text-8xl font-heading font-black leading-[0.95] animate-in fade-in slide-in-from-left-12 duration-1000">
                                                {slide.title}
                                            </h2>
                                        )}
                                    </div>
                                    
                                    {slide.subtitle && (
                                        <p className="text-base md:text-xl mb-12 text-white/80 font-medium leading-relaxed max-w-lg animate-in fade-in slide-in-from-left-12 duration-1000 delay-200">
                                            {slide.subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );

                    return (
                        <SwiperSlide key={index} className="relative w-full h-full">
                            {slide.link ? (
                                <Link href={slide.link} className="block w-full h-full">
                                    {SlideContent}
                                </Link>
                            ) : (
                                SlideContent
                            )}
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {/* Custom Premium Arrows */}
            <div className="hidden md:block">
                <button className={`prev-${sectionId} absolute left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover/hero:opacity-100 transition-all duration-500 hover:bg-white hover:text-black shadow-2xl disabled:hidden`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button className={`next-${sectionId} absolute right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover/hero:opacity-100 transition-all duration-500 hover:bg-white hover:text-black shadow-2xl disabled:hidden`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
}

