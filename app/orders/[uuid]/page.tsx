'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useSettings } from '@/contexts/SettingsContext';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface OrderItem {
    id: number;
    product_name: string;
    variant_name: string;
    image_url: string;
    quantity: number;
    price: string;
    total: string;
}

interface Address {
    name: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip_code: string;
}

interface Order {
    uuid: string;
    order_number: string;
    total_amount: string;
    subtotal: string;
    shipping_amount: string;
    tax_amount: string;
    discount_amount: string;
    status: string;
    payment_method: string;
    payment_status: string;
    created_at: string;
    items: OrderItem[];
    shipping_address: Address;
}

export default function OrderDetailsPage({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = use(params);
    const { user } = useAuthStore();
    const settings = useSettings();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchOrder();
    }, [user, uuid]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/api/my-orders/${uuid}`);
            setOrder(res.data);
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse font-bold text-gray-400">Loading order details...</div>;
    if (!order) return <div className="p-20 text-center">Order not found.</div>;

    const subtotal = order.items.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Back Button */}
                <Link href="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors group">
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-bold uppercase tracking-wider">Back to Orders</span>
                </Link>

                <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgb(0,0,0,0.03)]">
                    {/* Header Section */}
                    <div className="p-8 md:p-12 border-b border-gray-50 bg-gradient-to-br from-gray-50/50 to-white">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tighter text-gray-900">
                                    Order <span className="text-primary">#{order.order_number}</span>
                                </h1>
                            </div>

                            <div className="bg-black text-white px-8 py-4 rounded-3xl text-center shadow-xl shadow-black/10">
                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-1">Total Paid</p>
                                <p className="text-2xl font-heading font-black">{formatPrice(order.total_amount)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 grid md:grid-cols-3 gap-12">
                        {/* Items Column */}
                        <div className="md:col-span-2 space-y-8">
                            <h2 className="text-xl font-heading font-black text-gray-900 flex items-center gap-3">
                                <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm">01</span>
                                Order Items
                            </h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group transition-colors hover:bg-gray-50">
                                        <div className="relative w-20 h-24 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-white shadow-sm">
                                            {item.image_url ? (
                                                <Image 
                                                    src={item.image_url} 
                                                    alt={item.product_name} 
                                                    fill 
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-xs text-gray-300">No Image</div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className="font-heading font-bold text-gray-900 leading-tight mb-1">{item.product_name}</h4>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">{item.variant_name || 'Standard'}</p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <p className="text-sm font-medium">
                                                    <span className="text-gray-400">{item.quantity} x </span>
                                                    {formatPrice(item.price)}
                                                </p>
                                                <p className="font-heading font-black text-gray-900">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Payment Info */}
                            <div className="pt-8 border-t border-gray-100 grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Payment Method</p>
                                    <p className="text-sm font-bold text-gray-800">{order.payment_method}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Payment Status</p>
                                    <p className={`text-sm font-black uppercase tracking-widest ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {order.payment_status}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Summary & Address Column */}
                        <div className="space-y-12">
                            {/* Summary Card */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-heading font-black text-gray-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm">02</span>
                                    Summary
                                </h2>
                                <div className="space-y-3 px-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold">{formatPrice(subtotal)}</span>
                                    </div>
                                    {parseFloat(order.shipping_amount) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Shipping</span>
                                            <span className="font-bold">{formatPrice(order.shipping_amount)}</span>
                                        </div>
                                    )}
                                    {parseFloat(order.tax_amount) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Tax</span>
                                            <span className="font-bold">{formatPrice(order.tax_amount)}</span>
                                        </div>
                                    )}
                                    {parseFloat(order.discount_amount) > 0 && (
                                        <div className="flex justify-between text-sm text-emerald-600">
                                            <span>Discount</span>
                                            <span className="font-bold">-{formatPrice(order.discount_amount)}</span>
                                        </div>
                                    )}
                                    <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between">
                                        <span className="text-base font-heading font-black">Grand Total</span>
                                        <span className="text-xl font-heading font-black text-primary">{formatPrice(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-heading font-black text-gray-900 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm">03</span>
                                    Shipping
                                </h2>
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-1">
                                    <p className="font-bold text-gray-900">{order.shipping_address.name}</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {order.shipping_address.address_line1}<br />
                                        {order.shipping_address.address_line2 && <>{order.shipping_address.address_line2}<br /></>}
                                        {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.zip_code}
                                    </p>
                                    <div className="pt-4 mt-4 border-t border-gray-200/50">
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Contact</p>
                                        <p className="text-xs font-bold text-gray-700">{order.shipping_address.phone}</p>
                                        <p className="text-xs text-gray-500">{order.shipping_address.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
