'use client';

import Link from 'next/link';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useState, useEffect } from 'react';

export default function Navbar({ settings }: { settings?: any }) {
    const cart = useCartStore();
    const { user, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <nav className="h-16 border-b" />;

    const storeName = settings?.store_name || "DOPE STYLE";
    const logoRelPath = settings?.main_logo; // "storage/theme/logos/..."

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    {logoRelPath ? (
                        <img src={`/${logoRelPath}`} alt={storeName} className="h-8 w-auto object-contain" />
                    ) : (
                        <span className="text-xl font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading)' }}>
                            {storeName}
                        </span>
                    )}
                </Link>

                {/* Actions */}
                <div className="flex items-center space-x-6">
                    <Link href="/shop" className="text-sm font-medium hover:text-gray-600">
                        Shop
                    </Link>

                    {user ? (
                        <div className="flex items-center space-x-4">
                            <Link href="/orders" className="text-sm font-medium hover:text-gray-600">
                                My Orders
                            </Link>
                            <button onClick={logout} className="text-sm text-red-500 hover:text-red-600">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="text-sm font-medium hover:text-gray-600 flex items-center gap-1">
                            <User className="w-4 h-4" /> Sign In
                        </Link>
                    )}

                    <Link href="/cart" className="relative text-gray-900 hover:text-gray-600">
                        <ShoppingBag className="w-5 h-5" />
                        {cart.items.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                {cart.items.length}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
