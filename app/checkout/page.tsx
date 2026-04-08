'use client';

import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import Script from "next/script";

export default function CheckoutPage() {
    const cart = useCartStore();
    const { user } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        customer: { name: '', email: '', phone: '' },
        address: { line1: '', line2: '', city: '', state: '', zip: '' }
    });

    useEffect(() => {
        setMounted(true);
        if (user) {
            setForm(prev => ({
                ...prev,
                customer: {
                    name: user.name,
                    email: user.email,
                    phone: '' // We don't store phone in User table yet, optional update later
                }
            }));
        }
    }, [user]);

    // Simple handler to update nested state
    const updateForm = (section: 'customer' | 'address', field: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const handlePayment = async () => {
        setSubmitting(true);
        setError(null);

        try {
            // 1. Create Order in Backend
            const payload = {
                customer: form.customer,
                address: form.address,
                items: cart.items.map(item => ({
                    sku_id: item.skuId,
                    quantity: item.quantity
                }))
            };

            const orderRes = await api.post('/api/checkout', payload);
            const { order_uuid } = orderRes.data;

            // 2. Initiate Payment (Get Razorpay Order ID)
            const paymentRes = await api.post('/api/payment/initiate', { order_uuid });
            const { order_id, amount, key, name, description, prefill } = paymentRes.data;

            // 3. Open Razorpay Modal
            const options = {
                key: key,
                amount: amount,
                currency: "INR",
                name: name,
                description: description,
                image: "https://your-logo-url.com/logo.png", // TODO: Add Logo
                order_id: order_id,
                handler: async function (response: any) {
                    setIsPaymentProcessing(true);
                    try {
                        // 4. Verify Signature
                        await api.post('/api/payment/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            order_uuid: order_uuid
                        });

                        cart.clearCart();
                        router.push('/thank-you');
                    } catch (verifyErr) {
                        console.error(verifyErr);
                        setError("Payment verification failed. Please contact support.");
                        setIsPaymentProcessing(false);
                    }
                },
                prefill: prefill,
                theme: {
                    color: "#000000"
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                setError(`Payment Failed: ${response.error.description}`);
                setIsPaymentProcessing(false);
            });
            rzp1.open();

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            setSubmitting(false); // Only stop submitting if initial fail. If modal open, wait for handler.
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handlePayment();
    };

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
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Customer Info */}
                        <div className="bg-white p-6 border rounded-lg space-y-4">
                            <h2 className="text-xl font-semibold">Contact Information</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    type="text" placeholder="Full Name" required
                                    className="w-full border p-3 rounded-md"
                                    value={form.customer.name}
                                    onChange={e => updateForm('customer', 'name', e.target.value)}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="email" placeholder="Email" required
                                        className="w-full border p-3 rounded-md"
                                        value={form.customer.email}
                                        onChange={e => updateForm('customer', 'email', e.target.value)}
                                    />
                                    <input
                                        type="tel" placeholder="Phone" required
                                        className="w-full border p-3 rounded-md"
                                        value={form.customer.phone}
                                        onChange={e => updateForm('customer', 'phone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white p-6 border rounded-lg space-y-4">
                            <h2 className="text-xl font-semibold">Shipping Address</h2>
                            <div className="space-y-4">
                                <input
                                    type="text" placeholder="Address Line 1" required
                                    className="w-full border p-3 rounded-md"
                                    value={form.address.line1}
                                    onChange={e => updateForm('address', 'line1', e.target.value)}
                                />
                                <input
                                    type="text" placeholder="Address Line 2 (Optional)"
                                    className="w-full border p-3 rounded-md"
                                    value={form.address.line2}
                                    onChange={e => updateForm('address', 'line2', e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text" placeholder="City" required
                                        className="w-full border p-3 rounded-md"
                                        value={form.address.city}
                                        onChange={e => updateForm('address', 'city', e.target.value)}
                                    />
                                    <input
                                        type="text" placeholder="State" required
                                        className="w-full border p-3 rounded-md"
                                        value={form.address.state}
                                        onChange={e => updateForm('address', 'state', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text" placeholder="ZIP Code" required
                                        className="w-full border p-3 rounded-md"
                                        value={form.address.zip}
                                        onChange={e => updateForm('address', 'zip', e.target.value)}
                                    />
                                    <div className="border p-3 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed">
                                        India
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-black text-white py-4 rounded-md font-bold text-lg hover:bg-gray-800 disabled:opacity-50 transition"
                        >
                            {submitting ? 'Processing...' : `Place Order • ${formatPrice(cart.total())}`}
                        </button>
                    </form>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {cart.items.map(item => (
                                <div key={item.skuId} className="flex gap-4">
                                    <div className="w-16 h-20 bg-gray-200 rounded-md relative flex-shrink-0">
                                        {/* Simplification: No NextImage here to avoid overflow issues in sidebar, simple img */}
                                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />}
                                        <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.variant}</p>
                                    </div>
                                    <p className="text-sm src-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>{formatPrice(cart.total())}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                        </div>

                        <div className="flex justify-between border-t border-gray-200 mt-4 pt-4 font-bold text-lg">
                            <span>Total</span>
                            <span>{formatPrice(cart.total())}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
