'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { PaginatedResponse, ProductList } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

export default function ShopPage() {
    const [products, setProducts] = useState<ProductList[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch products
        api.get<PaginatedResponse<ProductList>>('/api/products')
            .then(res => {
                setProducts(res.data.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 aspect-[4/5] rounded-md mb-4"></div>
                        <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 w-1/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">All Products</h1>

            {products.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    No products found.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
