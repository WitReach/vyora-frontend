'use client';

import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
    const cart = useCartStore();
    const [mounted, setMounted] = useState(false);

    // Hydration fix for Zustand persist
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <Link href="/shop" className="text-blue-600 hover:underline">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.items.map(item => (
                        <div key={item.skuId} className="flex gap-4 border-b border-gray-100 pb-6">
                            <div className="relative w-24 h-32 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                {item.image && (
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            <Link href={`/product/${item.slug}`} className="hover:underline">
                                                {item.name}
                                            </Link>
                                        </h3>
                                        <button
                                            onClick={() => cart.removeItem(item.skuId)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{item.variant}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center border border-gray-200 rounded-md">
                                        <button
                                            onClick={() => cart.updateQuantity(item.skuId, Math.max(1, item.quantity - 1))}
                                            className="p-2 hover:bg-gray-50"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-4 text-sm font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => cart.updateQuantity(item.skuId, item.quantity + 1)}
                                            className="p-2 hover:bg-gray-50"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-2 border-b border-gray-200 pb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-900">{formatPrice(cart.total())}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-gray-500">Calculated at checkout</span>
                            </div>
                        </div>

                        <div className="flex justify-between py-4 text-lg font-bold text-gray-900">
                            <span>Total</span>
                            <span>{formatPrice(cart.total())}</span>
                        </div>

                        <button className="w-full bg-black text-white py-3 rounded-md font-bold text-lg hover:bg-gray-800 transition">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
