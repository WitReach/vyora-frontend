"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProductVerticalScroll({ data }: { data: any }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchProducts = async () => {
            try {
                // Determine API URL based on environment variables or fallback
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
                const res = await fetch(`${apiUrl}/products?collection=${data.collection || 'new_arrivals'}&limit=${data.limit || 8}`, { 
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
    }, [data.collection, data.limit]);

    if (loading) {
        return (
            <section className="py-12 md:py-16 px-4 md:px-8 max-w-7xl mx-auto">
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
        <section className="py-12 md:py-16 px-4 md:px-8 max-w-7xl mx-auto">
            {data.title && (
                <div className="flex justify-between items-end mb-8 md:mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{data.title}</h2>
                    <Link href={`/collections/${data.collection}`} className="hidden md:inline-flex text-indigo-600 font-semibold hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg">
                        View All
                    </Link>
                </div>
            )}
            
            <div className="flex overflow-x-auto pb-8 space-x-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 px-2 -mx-2">
                {products.map((product: any) => (
                    <Link 
                        href={`/products/${product.slug || product.id}`} 
                        key={product.id}
                        className="snap-center shrink-0 w-[70vw] md:w-[280px] group flex flex-col p-4 rounded-2xl bg-white hover:bg-gray-50 transition-all border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    >
                        <div className="relative w-full aspect-[4/5] shrink-0 bg-gray-50 rounded-xl overflow-hidden shadow-sm mb-4">
                            <img
                                src={product.thumbnail || product.image || '/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            {product.category && (
                                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 block">
                                    {typeof product.category === 'object' ? product.category.name : product.category}
                                </span>
                            )}
                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-auto pt-2">
                                <span className="text-lg md:text-xl font-extrabold text-gray-900">
                                    ${Number(product.price).toFixed(2)}
                                </span>
                                {product.compare_at_price && (
                                    <span className="text-sm text-gray-400 line-through font-medium">
                                        ${Number(product.compare_at_price).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
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
