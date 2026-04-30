"use client";

import { useEffect, useState, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ProductCard } from "@/components/product/ProductCard";

import "swiper/css";
import "swiper/css/navigation";

export default function ProductCarousel({ data, isFluid }: { data: any; isFluid?: boolean }) {
    const id = useId();
    const sectionId = id.replace(/:/g, '');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        // Fetch products based on collection type (mock logic for now, just fetching latest)
        fetch(`${apiUrl}/products`)
            .then((res) => res.json())
            .then((data) => {
                setProducts(data.data || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch products", err);
                setLoading(false);
            });
    }, [data.collection]);

    if (loading) return <div className="py-12 text-center">Loading products...</div>;
    if (products.length === 0) return null;

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className={isFluid ? 'w-full px-4 md:px-8' : 'container mx-auto px-4'}>
                <div className="flex items-end justify-between mb-10">
                    <div className="space-y-2">
                        {data.title && (
                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 tracking-tight">{data.title}</h2>
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
                        spaceBetween={24}
                        slidesPerView={1.2}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                    }}
                    className="pb-8"
                >
                    {products.slice(0, data.limit || 8).map((product) => {
                        // Sanitize backend URL to absolute relative path to bypass Next JS remotePatterns config caching constraints
                        const rawImage = product.image || (product.media && product.media.length > 0 ? (product.media[0].original_url?.startsWith('http') ? product.media[0].original_url : `${process.env.NEXT_PUBLIC_BACKEND_URL}${product.media[0].original_url}`) : null);
                        const cleanImage = rawImage 
                            ? rawImage.replace(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000', '').replace('http://localhost:8000', '').replace('http://127.0.0.1:8000', '') 
                            : null;

                        const rawHoverImage = product.hover_image || null;
                        const cleanHoverImage = rawHoverImage
                            ? rawHoverImage.replace(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000', '').replace('http://localhost:8000', '').replace('http://127.0.0.1:8000', '')
                            : null;

                        const mappedProduct: any = {
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            brand: product.brand || null,
                            price: product.price || 0,
                            price_formatted: product.formatted_price || `$${product.price}`,
                            mrp: product.mrp || product.price || 0,
                            discount_percentage: product.discount_percentage || 0,
                            image: cleanImage,
                            hover_image: cleanHoverImage,
                            category: product.category?.name || 'Apparel',
                            is_new: product.is_new || false,
                        };

                        return (
                            <SwiperSlide key={product.id}>
                                <div className="px-2 pt-2 pb-6">
                                    <ProductCard product={mappedProduct} />
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
                </div>
            </div>
        </section>
    );
}
