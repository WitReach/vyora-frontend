"use client";

import Link from 'next/link';
import { useId } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

export default function HorizontalScrollCards({ data, isFluid }: { data: any; isFluid?: boolean }) {
    const id = useId();
    // Remove characters that might be invalid in CSS selectors
    const sectionId = id.replace(/:/g, '');

    if (!data?.cards || data.cards.length === 0) return null;

    const enableHoverZoom = data.hover_animation !== 'none';

    return (
        <section className="py-16 md:py-20 bg-white overflow-hidden">
            <div className={isFluid ? 'w-full px-4 md:px-8' : 'container mx-auto px-4'}>
                {/* Header with Title and Custom Arrows */}
                <div className="flex items-end justify-between mb-10">
                    <div className="space-y-2">
                        {data.title && (
                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 tracking-tight">
                                {data.title}
                            </h2>
                        )}
                        {data.subtitle && (
                            <p className="text-sm md:text-base text-gray-500 font-medium max-w-xl">{data.subtitle}</p>
                        )}
                    </div>
                    
                    {/* Custom Navigation Arrows */}
                    <div className="hidden md:flex items-center gap-3">
                        <button className={`prev-${sectionId} w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button className={`next-${sectionId} w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Swiper
                        modules={[Navigation]}
                        navigation={{
                            prevEl: `.prev-${sectionId}`,
                            nextEl: `.next-${sectionId}`,
                        }}
                        spaceBetween={16}
                        slidesPerView={2.2}
                        breakpoints={{
                            640: { slidesPerView: 3.2 },
                            768: { slidesPerView: 4 },
                            1024: { slidesPerView: 5 },
                        }}
                        className="!overflow-visible"
                    >
                        {data.cards.map((card: any, idx: number) => (
                            <SwiperSlide key={idx}>
                                <div className="flex flex-col group/card bg-transparent pb-4">
                                    {/* Portrait image — tall ratio like reference */}
                                    {card.image && (
                                        <div className="w-full overflow-hidden bg-gray-100 rounded-xl" style={{ aspectRatio: '3/4' }}>
                                            <img
                                                src={card.image}
                                                alt={card.headline || 'Card image'}
                                                className={`w-full h-full object-cover ${enableHoverZoom ? 'group-hover/card:scale-105 transition-transform duration-500' : ''}`}
                                            />
                                        </div>
                                    )}

                                    {/* Text content below image — clean and editorial */}
                                    <div className="pt-3 flex flex-col gap-1 flex-1">
                                        {card.headline && (
                                            <h3 className="text-xs font-extrabold tracking-tight text-gray-900 group-hover/card:text-black transition-colors uppercase">
                                                {card.headline}
                                            </h3>
                                        )}
                                        {card.paragraph && (
                                            <p className="text-[11px] leading-relaxed text-gray-500 line-clamp-2">
                                                {card.paragraph}
                                            </p>
                                        )}
                                        {card.cta_text && card.cta_link && (
                                            <div className="mt-1">
                                                <Link
                                                    href={card.cta_link}
                                                    className="text-[10px] font-bold uppercase tracking-widest text-black border-b border-black/10 hover:border-black transition-all pb-0.5"
                                                >
                                                    {card.cta_text}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}

