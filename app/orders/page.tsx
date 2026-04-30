'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

interface Order {
    uuid: string;
    order_number: string;
    total_amount: string;
    status: string;
    created_at: string;
    items_count: number;
}

export default function MyOrdersPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            // We need to create this endpoint in Backend first!
            // But assuming it exists or we use a filter on index.
            // Let's assume we will create /api/my-orders or filter /api/orders
            // actually, typical pattern is GET /api/orders returns *my* orders for user, *all* for admin.
            // But we have Admin/OrderController.
            // We need a User/OrderController or update Api/OrderController to have index method.

            const res = await api.get('/api/my-orders');
            setOrders(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-4">Please sign in to view your orders.</p>
                <Link href="/login" className="bg-black text-white px-6 py-2 rounded">Sign In</Link>
            </div>
        );
    }

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                    <Link href="/shop" className="text-black font-semibold hover:underline">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.uuid} className="border rounded-lg p-6 bg-white flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-sm transition">
                            <div>
                                <p className="font-bold text-lg">{order.order_number}</p>
                                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-8">
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="font-medium">₹{order.total_amount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase
                                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                                        ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                                    `}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
