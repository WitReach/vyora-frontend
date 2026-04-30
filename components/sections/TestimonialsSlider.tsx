"use client";

import { useId } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function TestimonialsSlider({ data, isFluid, sectionBg }: { data: any; isFluid?: boolean; sectionBg?: string }) {
    const id = useId();
    const sectionId = id.replace(/:/g, '');
    
    // Support both 'testimonials' (backend) and 'items' (old frontend spec)
    const testimonials = data?.testimonials || data?.items || [];

    if (testimonials.length === 0) return null;

    return (
        <section className="py-20 md:py-24 overflow-hidden" style={{ backgroundColor: sectionBg || '#fdfdfd' }}>
            <div className={isFluid ? 'w-full px-4 md:px-8' : 'container mx-auto px-4'}>
                {/* Header with Title and Custom Arrows */}
                <div className="flex items-end justify-between mb-12">
                    <div className="space-y-3">
                        {data.title && (
                            <h2 className="text-3xl md:text-5xl font-heading font-black text-gray-900 tracking-tight italic">
                                {data.title}
                            </h2>
                        )}
                        <div className="h-1.5 w-20 bg-black rounded-full" />
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
                        modules={[Navigation, Pagination]}
                        navigation={{
                            prevEl: `.prev-${sectionId}`,
                            nextEl: `.next-${sectionId}`,
                        }}
                        pagination={{ 
                            clickable: true,
                            bulletActiveClass: '!bg-black !w-8',
                            bulletClass: 'swiper-pagination-bullet !bg-gray-200 !transition-all !duration-500 !rounded-full'
                        }}
                        spaceBetween={30}
                        slidesPerView={1.1}
                        breakpoints={{ 
                            640: { slidesPerView: 1.5 },
                            768: { slidesPerView: 2.2 }, 
                            1024: { slidesPerView: 3 } 
                        }}
                        className="pb-16 !overflow-visible"
                    >
                        {testimonials.map((item: any, idx: number) => (
                            <SwiperSlide key={idx}>
                                <div className="bg-white rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 h-full flex flex-col group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                                    <div className="flex mb-8">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <svg key={star} className={`w-5 h-5 ${star <= (Number(item.rating) || 5) ? 'text-black' : 'text-gray-100'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <blockquote className="text-gray-700 text-lg md:text-xl font-heading font-medium leading-[1.6] flex-1 mb-10">
                                        "{item.quote}"
                                    </blockquote>
                                    <div className="flex items-center gap-4 mt-auto">
                                        <div className="relative">
                                            {item.avatar ? (
                                                <img src={item.avatar} alt={item.name} className="w-14 h-14 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white text-lg font-black">
                                                    {item.name?.[0] || '?'}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm" />
                                        </div>
                                        <div>
                                            <p className="font-heading font-black text-gray-900 text-base uppercase tracking-tight">{item.name}</p>
                                            {item.role && <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">{item.role}</p>}
                                        </div>
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
