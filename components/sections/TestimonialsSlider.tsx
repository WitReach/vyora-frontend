"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function TestimonialsSlider({ data, isFluid, sectionBg }: { data: any; isFluid?: boolean; sectionBg?: string }) {
    if (!data?.items || data.items.length === 0) return null;

    const containerClass = isFluid ? 'w-full px-4 md:px-8' : 'max-w-6xl mx-auto px-4 md:px-8';

    return (
        <section className="py-16 md:py-20" style={{ backgroundColor: sectionBg || '#f9fafb' }}>
            <div className={containerClass}>
                {data.title && (
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 text-center mb-12">
                        {data.title}
                    </h2>
                )}
                <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    spaceBetween={24}
                    slidesPerView={1}
                    breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
                    className="pb-12"
                >
                    {data.items.map((item: any, idx: number) => (
                        <SwiperSlide key={idx}>
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
                                <div className="flex mb-5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span key={star} className={`text-xl ${star <= (item.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                    ))}
                                </div>
                                <p className="text-gray-700 text-base leading-relaxed flex-1 mb-6 italic">"{item.quote}"</p>
                                <div className="flex items-center gap-3">
                                    {item.avatar ? (
                                        <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                                            {item.name?.[0] || '?'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                        {item.role && <p className="text-gray-400 text-xs">{item.role}</p>}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
