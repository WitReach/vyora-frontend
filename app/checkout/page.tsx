'use client';

import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { 
    ChevronLeft, CreditCard, ShieldCheck, Truck, 
    CheckCircle2, AlertCircle, ShoppingBag, Tag,
    Ticket, Loader2, Lock, Gift
} from "lucide-react";

export default function CheckoutPage() {
    const cart = useCartStore();
    const { user } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Re-validate coupon on mount to prevent stale localStorage data
    useEffect(() => {
        if (mounted && cart.appliedCoupon && cart.items.length > 0) {
            const revalidate = async () => {
                try {
                    const res = await api.post('/api/coupon/apply', {
                        code: cart.appliedCoupon.code,
                        cart: {
                            subtotal: cart.items.reduce((s, i) => s + (Number(i.price) * i.quantity), 0),
                            items: cart.items.map(i => ({
                                product_id: i.productId,
                                price: i.price,
                                original_price: i.mrp || i.price,
                                quantity: i.quantity
                            }))
                        }
                    });
                    if (res.data.success) {
                        // Update if amount changed in backend
                        if (res.data.data.discount_amount !== cart.appliedCoupon.discountAmount) {
                            cart.setAppliedCoupon({
                                code: cart.appliedCoupon.code,
                                discountAmount: res.data.data.discount_amount
                            });
                        }
                    } else {
                        cart.setAppliedCoupon(null);
                    }
                } catch (e) {
                    cart.setAppliedCoupon(null);
                }
            };
            revalidate();
        }
    }, [mounted, cart.items.length]);

    // Form State
    const [form, setForm] = useState({
        customer: { name: '', email: '', phone: '' },
        address: { line1: '', line2: '', city: '', state: '', zip: '' }
    });

    // Discount State
    const [couponCode, setCouponCode] = useState('');
    const [giftCardCode, setGiftCardCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [appliedGiftCard, setAppliedGiftCard] = useState<any>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [isApplyingGiftCard, setIsApplyingGiftCard] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (user) {
            setForm(prev => ({
                ...prev,
                customer: {
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || ''
                }
            }));
        }
    }, [user]);

    const updateForm = (section: 'customer' | 'address', field: string, value: string) => {
        setForm(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    // Calculate totals locally for UI
    const subtotal = cart.total();
    const mrpTotal = cart.items.reduce((s, i) => s + Math.max(Number(i.mrp) || 0, Number(i.price)) * i.quantity, 0);
    const mrpDiscount = mrpTotal > subtotal ? mrpTotal - subtotal : 0;
    const couponDiscount = useMemo(() => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.type === 'fixed') return Math.min(subtotal, appliedCoupon.value);
        return Math.min(subtotal, (subtotal * appliedCoupon.value) / 100);
    }, [subtotal, appliedCoupon]);

    const subtotalAfterCoupon = subtotal - couponDiscount;
    const shipping = subtotalAfterCoupon > 5000 ? 0 : 0; // Assuming free shipping for now
    
    // Total before gift card
    const totalBeforeGiftCard = subtotalAfterCoupon + shipping;
    
    const giftCardDiscount = useMemo(() => {
        if (!appliedGiftCard) return 0;
        return Math.min(appliedGiftCard.remaining_amount, totalBeforeGiftCard);
    }, [totalBeforeGiftCard, appliedGiftCard]);

    const finalTotal = Math.max(0, totalBeforeGiftCard - giftCardDiscount);

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        setError(null);
        try {
            const res = await api.post('/api/coupons/apply', { code: couponCode, cart_total: subtotal });
            if (res.data.success) {
                setAppliedCoupon(res.data.coupon);
            } else {
                setError(res.data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid coupon code.");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const applyGiftCard = async () => {
        if (!giftCardCode.trim()) return;
        setIsApplyingGiftCard(true);
        setError(null);
        try {
            const res = await api.post('/api/gift-cards/validate', { code: giftCardCode });
            if (res.data.success) {
                setAppliedGiftCard(res.data.card);
            } else {
                setError(res.data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid gift card code.");
        } finally {
            setIsApplyingGiftCard(false);
        }
    };

    const handlePayment = async () => {
        if (!form.customer.phone || !form.address.line1 || !form.address.city || !form.address.zip) {
            setError("Please fill in all required fields.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // 1. Create Order in Backend
            const payload = {
                customer: form.customer,
                address: form.address,
                coupon_code: appliedCoupon?.code,
                gift_card_code: appliedGiftCard?.plain_code,
                items: cart.items.map(item => ({
                    sku_id: item.skuId,
                    quantity: item.quantity,
                    image: item.image
                }))
            };

            const orderRes = await api.post('/api/checkout', payload);
            const { order_uuid } = orderRes.data;

            // 2. Check if Payment is required (Amount > 0)
            if (finalTotal === 0) {
                // Fully covered by gift card or coupon
                cart.clearCart();
                router.push('/thank-you');
                return;
            }

            // 3. Initiate Online Payment
            const paymentRes = await api.post('/api/payment/initiate', { order_uuid });
            const { order_id, amount, key, name, description, prefill } = paymentRes.data;

            // 4. Open Razorpay Modal
            const options = {
                key: key,
                amount: amount,
                currency: "INR",
                name: name,
                description: description,
                order_id: order_id,
                handler: async function (response: any) {
                    setIsPaymentProcessing(true);
                    try {
                        await api.post('/api/payment/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            order_uuid: order_uuid
                        });

                        cart.clearCart();
                        router.push('/thank-you');
                    } catch (verifyErr) {
                        setError("Payment verification failed. Please contact support.");
                        setIsPaymentProcessing(false);
                        setSubmitting(false);
                    }
                },
                prefill: prefill,
                theme: { color: "#000000" },
                modal: {
                    ondismiss: function() {
                        setSubmitting(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to place order. Please check your details.');
            setSubmitting(false);
        }
    };

    if (!mounted) return null;

    if (cart.items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Your cart is empty</h1>
                <p className="text-gray-500 mb-8">Add some style to your cart before checking out.</p>
                <Link href="/shop" className="bg-black text-white px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-all">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Processing Overlay */}
            {isPaymentProcessing && (
                <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-black animate-spin mb-6" />
                    <h2 className="text-2xl font-black tracking-tight mb-2">Verifying Payment</h2>
                    <p className="text-gray-500 font-medium">Please do not refresh or close this window.</p>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
                <div className="flex items-center gap-4 mb-12">
                    <Link href="/cart" className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all group">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Checkout</h1>
                        <p className="text-gray-400 text-sm font-medium">Securely finalize your order</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Information Form */}
                    <div className="lg:col-span-7 space-y-12">
                        {error && (
                            <div className="bg-red-50 border border-red-100 p-6 rounded-[1.5rem] flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                                <p className="text-sm text-red-800 font-bold leading-relaxed">{error}</p>
                            </div>
                        )}

                        {/* Section: Contact */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                                <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black">1</div>
                                <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">Contact Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                                    <input
                                        type="text" placeholder="John Doe" required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={form.customer.name}
                                        onChange={e => updateForm('customer', 'name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                                    <input
                                        type="email" placeholder="john@example.com" required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={form.customer.email}
                                        onChange={e => updateForm('customer', 'email', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                                    <input
                                        type="tel" placeholder="+91 98765 43210" required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={form.customer.phone}
                                        onChange={e => updateForm('customer', 'phone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section: Shipping */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                                <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black">2</div>
                                <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">Shipping Address</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Address Line 1</label>
                                    <input
                                        type="text" placeholder="Building, Street name" required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={form.address.line1}
                                        onChange={e => updateForm('address', 'line1', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Address Line 2 (Optional)</label>
                                    <input
                                        type="text" placeholder="Apartment, suite, unit etc."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={form.address.line2}
                                        onChange={e => updateForm('address', 'line2', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">City</label>
                                        <input
                                            type="text" placeholder="Mumbai" required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            value={form.address.city}
                                            onChange={e => updateForm('address', 'city', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">State</label>
                                        <input
                                            type="text" placeholder="Maharashtra" required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            value={form.address.state}
                                            onChange={e => updateForm('address', 'state', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">ZIP / Postal Code</label>
                                        <input
                                            type="text" placeholder="400001" required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            value={form.address.zip}
                                            onChange={e => updateForm('address', 'zip', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Country</label>
                                        <div className="w-full bg-gray-100 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-400 cursor-not-allowed">
                                            India
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="hidden lg:block pt-10">
                            <div className="flex items-center gap-8 opacity-40">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Secure SSL Encrypted</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Reliable Logistics</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Authentic Goods</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary Sidebar */}
                    <div className="lg:col-span-5">
                        <div className="bg-gray-50 rounded-[3rem] p-10 lg:sticky lg:top-12 space-y-10">
                            <h3 className="text-2xl font-black tracking-tight mb-8">Order Summary</h3>
                            
                            {/* Items List */}
                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 scrollbar-none">
                                {cart.items.map(item => (
                                    <div key={item.skuId} className="flex gap-6 group">
                                        <div className="w-20 h-24 bg-white rounded-2xl relative flex-shrink-0 overflow-hidden shadow-sm">
                                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                                            <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-50">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 py-1">
                                            <p className="text-sm font-black text-gray-900 leading-tight mb-1">{item.name}</p>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{item.variant}</p>
                                            <p className="text-sm font-black text-gray-900 mt-2">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Applied Discounts Display */}
                            {(appliedCoupon || appliedGiftCard) && (
                                <div className="space-y-3 pt-6 border-t border-gray-200/50">
                                    {appliedCoupon && (
                                        <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl border border-emerald-100">
                                            <div className="flex items-center gap-3">
                                                <Tag className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Coupon: {appliedCoupon.code}</span>
                                            </div>
                                            <button onClick={() => setAppliedCoupon(null)} className="text-emerald-900 hover:scale-110 transition-transform"><AlertCircle className="w-4 h-4 rotate-45" /></button>
                                        </div>
                                    )}
                                    {appliedGiftCard && (
                                        <div className="flex items-center justify-between bg-black text-white px-5 py-3 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <Gift className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Gift Card Applied</span>
                                            </div>
                                            <button onClick={() => setAppliedGiftCard(null)} className="text-white/50 hover:text-white transition-colors"><AlertCircle className="w-4 h-4 rotate-45" /></button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Financials */}
                            <div className="space-y-4 pt-6 border-t border-gray-200">
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span className="uppercase tracking-widest text-[10px]">MRP Total</span>
                                    <span>{formatPrice(mrpTotal)}</span>
                                </div>
                                {mrpDiscount > 0 && (
                                    <div className="flex justify-between text-sm font-bold text-emerald-600">
                                        <span className="uppercase tracking-widest text-[10px]">Discount on MRP</span>
                                        <span>-{formatPrice(mrpDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-4">
                                    <span className="uppercase tracking-widest text-[10px]">Cart Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-sm font-bold text-emerald-600">
                                        <span className="uppercase tracking-widest text-[10px]">Coupon Discount</span>
                                        <span>-{formatPrice(couponDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span className="uppercase tracking-widest text-[10px]">Shipping</span>
                                    <span className="text-emerald-600">FREE</span>
                                </div>
                                {giftCardDiscount > 0 && (
                                    <div className="flex justify-between text-sm font-bold text-gray-900">
                                        <span className="uppercase tracking-widest text-[10px]">Gift Card Credit</span>
                                        <span>-{formatPrice(giftCardDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-6 border-t border-gray-200">
                                    <span className="text-lg font-black uppercase tracking-widest">Total</span>
                                    <span className="text-3xl font-black tracking-tighter">{formatPrice(finalTotal)}</span>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4 pt-4">
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text" placeholder="Coupon Code"
                                            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            value={couponCode} onChange={e => setCouponCode(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={applyCoupon} disabled={isApplyingCoupon || !couponCode}
                                        className="bg-black text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 disabled:opacity-20 transition-all"
                                    >
                                        {isApplyingCoupon ? '...' : 'Apply'}
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text" placeholder="Gift Card Code"
                                            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                            value={giftCardCode} onChange={e => setGiftCardCode(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={applyGiftCard} disabled={isApplyingGiftCard || !giftCardCode}
                                        className="bg-black text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 disabled:opacity-20 transition-all"
                                    >
                                        {isApplyingGiftCard ? '...' : 'Redeem'}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={submitting}
                                className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-[13px] uppercase tracking-[0.3em] hover:bg-gray-800 disabled:opacity-50 transition-all shadow-2xl shadow-gray-200 flex items-center justify-center gap-4 group active:scale-[0.98]"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" /> 
                                        Secure Checkout • {formatPrice(finalTotal)}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
