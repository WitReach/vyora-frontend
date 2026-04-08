"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ProductCard } from "@/components/product/ProductCard";

import "swiper/css";
import "swiper/css/navigation";

export default function ProductCarousel({ data, isFluid }: { data: any; isFluid?: boolean }) {
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
        <section className="py-12 bg-white">
            <div className={isFluid ? 'w-full px-4 md:px-8' : 'container mx-auto px-4'}>
                {data.title && (
                    <h2 className="text-3xl font-bold text-center mb-8">{data.title}</h2>
                )}

                <Swiper
                    modules={[Navigation]}
                    navigation
                    spaceBetween={20}
                    slidesPerView={1}
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
        </section>
    );
}
