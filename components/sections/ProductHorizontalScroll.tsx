"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from "@/components/product/ProductCard";

export default function ProductHorizontalScroll({ data, isFluid }: { data: any; isFluid?: boolean }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchProducts = async () => {
            try {
                // Determine API URL based on environment variables or fallback
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
                
                let fetchUrl = `${apiUrl}/products?collection=${data.collection || 'new_arrivals'}&limit=${data.limit || 8}`;
                if (data.product_slugs && data.product_slugs.length > 0) {
                    fetchUrl = `${apiUrl}/products?slugs=${data.product_slugs.join(',')}`;
                }

                const res = await fetch(fetchUrl, { 
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
                console.error("Failed to fetch products for horizontal scroll output:", error);
                if (isMounted) setLoading(false);
            }
        };

        fetchProducts();
        
        return () => { isMounted = false; };
    }, [data.collection, data.limit, data.product_slugs?.join(',')]);

    if (loading) {
        return (
            <section className={`py-12 md:py-16 px-4 md:px-8${isFluid ? ' w-full' : ' max-w-7xl mx-auto'}`}>
                <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-lg mb-8"></div>
                <div className="flex space-x-6 overflow-x-hidden">
                    <div className="h-80 w-64 bg-gray-100 animate-pulse rounded-2xl shrink-0"></div>
                    <div className="h-80 w-64 bg-gray-100 animate-pulse rounded-2xl shrink-0"></div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className={`py-12 md:py-16 px-4 md:px-8${isFluid ? ' w-full' : ' max-w-7xl mx-auto'}`}>
            {data.title && (
                <div className="flex justify-between items-end mb-8 md:mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{data.title}</h2>
                    <Link href={`/collections/${data.collection}`} className="hidden md:inline-flex text-indigo-600 font-semibold hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg">
                        View All
                    </Link>
                </div>
            )}
            
            <div className="flex overflow-x-auto pb-8 space-x-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 px-2 -mx-2">
                {products.map((product: any) => {
                    // Sanitize backend URL to absolute relative path to bypass Next JS remotePatterns config caching constraints
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
                        <div 
                            key={product.id}
                            className="snap-center shrink-0 w-[70vw] md:w-[280px]"
                        >
                            <ProductCard product={mappedProduct} />
                        </div>
                    );
                })}
            </div>
            {data.title && (
                <div className="mt-8 text-center md:hidden">
                    <Link href={`/collections/${data.collection}`} className="inline-flex w-full justify-center px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50">
                        View All collection
                    </Link>
                </div>
            )}
        </section>
    );
}
