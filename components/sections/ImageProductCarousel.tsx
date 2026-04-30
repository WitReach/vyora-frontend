"use client";

import React, { useEffect, useState, useId } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ProductCard } from "@/components/product/ProductCard";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ImageProductCarousel({ data, isFluid }: { data: any; isFluid?: boolean }) {
    const sectionId = useId().replace(/:/g, '');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchProducts = async () => {
            try {
                if (!data.product_slugs || data.product_slugs.length === 0) {
                    setLoading(false);
                    return;
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
                const res = await fetch(`${apiUrl}/products?slugs=${data.product_slugs.join(',')}`, {
                    cache: 'no-store'
                });
                const responseData = await res.json();

                if (isMounted) {
                    if (Array.isArray(responseData)) {
                        setProducts(responseData);
                    } else if (responseData && Array.isArray(responseData.data)) {
                        setProducts(responseData.data);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch products for image product carousel:", error);
                if (isMounted) setLoading(false);
            }
        };

        fetchProducts();

        return () => { isMounted = false; };
    }, [data.product_slugs?.join(',')]);

    if (loading) {
        return (
            <section className={`py-12 md:py-16 px-4 md:px-8${isFluid ? ' w-full' : ' max-w-7xl mx-auto'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-[500px]">
                    <div className="bg-gray-100 animate-pulse rounded-2xl w-full h-[300px] lg:h-full"></div>
                    <div className="bg-gray-100 animate-pulse rounded-2xl w-full h-[400px] lg:h-full"></div>
                </div>
            </section>
        );
    }

    if (!data.image && products.length === 0) return null;

    const objectFitClass = data.object_fit === 'contain' ? 'object-contain' : 'object-cover';

    return (
        <section className={`py-12 md:py-20 px-4 md:px-8${isFluid ? ' w-full' : ' max-w-7xl mx-auto'} overflow-hidden`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                
                {/* Column 1: Image */}
                <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative rounded-3xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    {data.image ? (
                        <img 
                            src={data.image} 
                            alt="Featured" 
                            className={`absolute inset-0 w-full h-full ${objectFitClass}`} 
                        />
                    ) : (
                        <span className="text-gray-400 font-medium">No Image Provided</span>
                    )}
                </div>

                {/* Column 2: Product Carousel */}
                <div className="w-full relative px-2">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Feature Collection</h3>
                        <div className="flex items-center gap-2">
                            <button className={`prev-${sectionId} w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white hover:border-black transition-all`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button className={`next-${sectionId} w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white hover:border-black transition-all`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                    
                    {products.length > 0 ? (
                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation={{
                                prevEl: `.prev-${sectionId}`,
                                nextEl: `.next-${sectionId}`,
                            }}
                            pagination={{ clickable: true }}
                            spaceBetween={30}
                            slidesPerView={1}
                            className="pb-12"
                        >
                            {products.map((product) => {
                                const rawImage = product.image || product.thumbnail || (product.media && product.media.length > 0 ? (product.media[0].original_url?.startsWith('http') ? product.media[0].original_url : `${process.env.NEXT_PUBLIC_BACKEND_URL}${product.media[0].original_url}`) : null);
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
                                    price_formatted: product.formatted_price || `$${Number(product.price).toFixed(2)}`,
                                    mrp: product.compare_at_price || product.mrp || product.price || 0,
                                    discount_percentage: product.discount_percentage || 0,
                                    image: cleanImage,
                                    hover_image: cleanHoverImage,
                                    category: typeof product.category === 'object' ? product.category?.name : (product.category || 'Apparel'),
                                    is_new: product.is_new || false,
                                };

                                return (
                                    <SwiperSlide key={product.id}>
                                        <div className="px-4 py-8 max-w-full sm:max-w-md mx-auto">
                                            <ProductCard product={mappedProduct} />
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    ) : (
                        <div className="flex items-center justify-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <span className="text-gray-500 font-medium">No products selected</span>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
