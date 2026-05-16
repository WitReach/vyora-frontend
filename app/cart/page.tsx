'use client';
import { useState, useEffect } from 'react';
import { useCartStore, CartItem } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import CheckoutAddress from '@/components/checkout/CheckoutAddress';
import {
    Trash2, Plus, Minus, Tag, Ticket, X, ChevronRight,
    ShoppingBag, ArrowRight, AlertCircle, Check, MapPin, Lock, Gift
} from 'lucide-react';

/* ── Coupon Modal ─────────────────────────────────────────────────────────── */
function CouponModal({ open, onClose, coupons, onApply, applying }: {
    open: boolean; onClose: () => void; coupons: any[];
    onApply: (c: string) => void; applying: boolean;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl z-10 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <p className="font-bold text-gray-900 text-sm">Coupons & Offers</p>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
                </div>
                <div className="p-4 max-h-[55vh] overflow-y-auto space-y-2.5">
                    {coupons.length === 0
                        ? <p className="text-center text-gray-400 py-8 text-sm">No active coupons right now.</p>
                        : coupons.map((c: any) => (
                            <div key={c.id} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl hover:border-gray-300 transition-all bg-gray-50">
                                <div className="min-w-0 mr-3">
                                    <span className="inline-block bg-gray-900 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-widest mb-1">{c.code}</span>
                                    <p className="text-xs font-semibold text-gray-800 leading-snug">{c.name}</p>
                                    {c.min_cart_value && <p className="text-[10px] text-gray-400 mt-0.5">Min: {formatPrice(c.min_cart_value)}</p>}
                                </div>
                                <button onClick={() => onApply(c.code)} disabled={applying}
                                    className="shrink-0 text-[10px] font-black uppercase tracking-wider text-black border border-black px-3 py-1.5 rounded-lg hover:bg-black hover:text-white transition-all disabled:opacity-40">
                                    Apply
                                </button>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

/* ── Cart Item ────────────────────────────────────────────────────────────── */
function CartRow({ item, update, remove }: {
    item: CartItem;
    update: (id: number, q: number) => void;
    remove: (id: number) => void;
}) {
    return (
        <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
            <Link href={`/product/${item.slug}`} className="relative w-20 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />}
            </Link>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <Link href={`/product/${item.slug}`}>
                        <h3 className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors leading-snug line-clamp-2">{item.name}</h3>
                    </Link>
                    <button onClick={() => remove(item.skuId)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5">
                        <Trash2 size={15} />
                    </button>
                </div>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {item.colorName && (
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            <span className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: item.colorHex || '#aaa' }} />
                            {item.colorName}
                        </span>
                    )}
                    {item.size && (
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Size {item.size}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                        <button onClick={() => update(item.skuId, Math.max(1, item.quantity - 1))} className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors text-gray-500">
                            <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="text-sm font-bold text-gray-900 w-7 text-center">{item.quantity}</span>
                        <button onClick={() => update(item.skuId, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors text-gray-500">
                            <Plus size={12} strokeWidth={3} />
                        </button>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        {item.mrp && item.mrp > item.price ? (
                            <p className="text-[10px] text-gray-400 line-through mt-0.5">{formatPrice(item.mrp * item.quantity)}</p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Labelled input ───────────────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, type = 'text', span = false }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string; span?: boolean;
}) {
    return (
        <div className={span ? 'col-span-2' : ''}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-200 transition-all" />
        </div>
    );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function CartPage() {
    const cart = useCartStore();
    const { user } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    const [couponInput, setCouponInput] = useState('');
    const [publicCoupons, setPublicCoupons] = useState<any[]>([]);
    const [couponModal, setCouponModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponErr, setCouponErr] = useState('');

    // Re-validate coupon on mount to prevent stale localStorage data
    useEffect(() => {
        if (mounted && cart.appliedCoupon && cart.items.length > 0) {
            const revalidate = async () => {
                try {
                    const res = await api.post('/api/coupon/apply', {
                        code: cart.appliedCoupon!.code,
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
                        if (res.data.data.discount_amount !== cart.appliedCoupon!.discountAmount) {
                            cart.setAppliedCoupon({
                                code: cart.appliedCoupon!.code,
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

    const [selectedAddr, setSelectedAddr] = useState<any>(null);
    const [guest, setGuest] = useState({ name: '', email: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '' });
    const g = (k: string, v: string) => setGuest(p => ({ ...p, [k]: v }));

    const [placing, setPlacing] = useState(false);
    const [orderErr, setOrderErr] = useState('');
    const [orderUUID, setOrderUUID] = useState('');
    const [settings, setSettings] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'prepaid' | 'cod'>('prepaid');
    const [paymentModal, setPaymentModal] = useState(false);

    // Gift card
    const [gcInput, setGcInput] = useState('');
    const [gcApplied, setGcApplied] = useState<{ code: string; balance: number } | null>(null);
    const [gcValidating, setGcValidating] = useState(false);
    const [gcErr, setGcErr] = useState('');

    useEffect(() => {
        setMounted(true);
        api.get('/api/settings').then(r => setSettings(r.data)).catch(() => { });

        api.get('/api/coupons/public').then(async r => {
            setPublicCoupons(r.data.checkout_coupons || []);
            const magicCoupons = r.data.magic_coupons || [];

            // Auto Apply Logic
            const state = useCartStore.getState();
            if (!state.appliedCoupon && magicCoupons.length > 0 && state.items.length > 0) {
                for (const mc of magicCoupons) {
                    try {
                        const sub = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
                        const items = state.items.map(i => ({ product_id: i.productId, price: i.price, original_price: i.price, quantity: i.quantity }));
                        const applyRes = await api.post('/api/coupons/apply', { code: mc.code, cart: { subtotal: sub, items } });
                        if (applyRes.data.success) {
                            state.setAppliedCoupon({ code: applyRes.data.data.coupon.code, discountAmount: applyRes.data.data.discount_amount });
                            break;
                        }
                    } catch (e) {
                        // ignore errors during background auto-apply
                    }
                }
            }
        }).catch(() => { });
    }, []);

    const handleApplyCoupon = async (code: string) => {
        const c = (code || couponInput).trim().toUpperCase();
        if (!c) return;
        setApplying(true); setCouponErr('');
        const sub = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
        try {
            const r = await api.post('/api/coupons/apply', {
                code: c,
                cart: { subtotal: sub, items: cart.items.map(i => ({ product_id: i.productId, price: i.price, original_price: i.price, quantity: i.quantity })) }
            });
            if (r.data.success) {
                cart.setAppliedCoupon({ code: r.data.data.coupon.code, discountAmount: r.data.data.discount_amount });
                setCouponModal(false); setCouponInput('');
            } else { setCouponErr(r.data.message); }
        } catch (e: any) { setCouponErr(e.response?.data?.message || 'Invalid coupon.'); }
        finally { setApplying(false); }
    };

    const handleValidateGiftCard = async () => {
        const c = gcInput.trim().toUpperCase();
        if (!c) return;
        setGcValidating(true); setGcErr('');
        try {
            const r = await api.post('/api/gift-cards/validate', { code: c });
            if (r.data.success) {
                setGcApplied({ code: c, balance: r.data.remaining_amount });
                setGcInput('');
            } else { setGcErr(r.data.message); }
        } catch (e: any) { setGcErr(e.response?.data?.message || 'Invalid gift card.'); }
        finally { setGcValidating(false); }
    };

    const handlePlaceOrder = async () => {
        setOrderErr('');
        let addrPayload: any, custPayload: any;
        if (user && selectedAddr) {
            addrPayload = { line1: selectedAddr.address_line1, line2: selectedAddr.address_line2 || '', city: selectedAddr.city, state: selectedAddr.state, zip: selectedAddr.zip_code };
            custPayload = { name: selectedAddr.name, email: user.email, phone: selectedAddr.phone };
        } else {
            const { name, email, phone, line1, city, state, zip } = guest;
            if (!name || !email || !phone || !line1 || !city || !state || !zip) { setOrderErr('Please fill all delivery fields.'); return; }
            addrPayload = { line1, line2: guest.line2, city, state, zip };
            custPayload = { name, email, phone };
        }
        setPlacing(true);
        try {
            const r = await api.post('/api/checkout', {
                customer: custPayload, address: addrPayload,
                payment_method: paymentMethod,
                coupon_code: cart.appliedCoupon?.code || null,
                gift_card_code: gcApplied?.code || null,
                items: cart.items.map(i => ({ sku_id: i.skuId, quantity: i.quantity, image: i.image }))
            });

            if (r.data.success) {
                const orderUUID = r.data.order_uuid;

                // If COD or Total is 0, we are done
                if (paymentMethod === 'cod' || total <= 0) {
                    setOrderUUID(orderUUID);
                    cart.clearCart();
                    return;
                }

                // Prepaid Flow: Initiate Razorpay
                try {
                    const initRes = await api.post('/api/payment/initiate', { order_uuid: orderUUID });
                    const options = {
                        key: initRes.data.key,
                        amount: initRes.data.amount,
                        currency: 'INR',
                        name: initRes.data.name,
                        description: initRes.data.description,
                        order_id: initRes.data.order_id,
                        handler: async (response: any) => {
                            try {
                                const verifyRes = await api.post('/api/payment/verify', {
                                    ...response,
                                    order_uuid: orderUUID
                                });
                                if (verifyRes.data.success) {
                                    setOrderUUID(orderUUID);
                                    cart.clearCart();
                                } else {
                                    setOrderErr('Payment verification failed. Please contact support.');
                                }
                            } catch (err: any) {
                                setOrderErr(err.response?.data?.message || 'Verification failed.');
                            }
                        },
                        prefill: initRes.data.prefill,
                        theme: { color: '#000000' },
                        modal: {
                            ondismiss: () => {
                                setOrderErr('Payment cancelled. You can try again from your orders page.');
                                setPlacing(false);
                            }
                        }
                    };
                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                } catch (err: any) {
                    setOrderErr(err.response?.data?.message || 'Could not initiate payment.');
                    setPlacing(false);
                }
            } else {
                setOrderErr(r.data.message);
                setPlacing(false);
            }
        } catch (e: any) {
            setOrderErr(e.response?.data?.message || 'Something went wrong. Please try again.');
            setPlacing(false);
        }
    };

    if (!mounted) return <div className="min-h-[60vh]" />;

    /* Success */
    if (orderUUID) return (
        <div className="max-w-md mx-auto px-4 py-28 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-sm text-gray-500 mb-1">Thank you for your purchase.</p>
            <p className="text-xs text-gray-400 font-mono mb-10">{orderUUID}</p>
            <div className="flex gap-3 justify-center">
                <Link href="/orders" className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2">
                    My Orders <ArrowRight size={15} />
                </Link>
                <Link href="/shop" className="border border-gray-200 text-gray-600 text-sm font-semibold px-6 py-3 rounded-xl hover:border-gray-400 transition-all">
                    Keep Shopping
                </Link>
            </div>
        </div>
    );

    /* Empty */
    if (cart.items.length === 0) return (
        <div className="max-w-sm mx-auto px-4 py-28 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-5" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Your bag is empty</h1>
            <p className="text-sm text-gray-400 mb-8">Add items to get started.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all">
                Browse Shop <ArrowRight size={15} />
            </Link>
        </div>
    );

    const mrpTotal = cart.items.reduce((s, i) => s + Math.max(Number(i.mrp) || 0, Number(i.price)) * i.quantity, 0);
    const subtotal = cart.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const mrpDiscount = mrpTotal > subtotal ? mrpTotal - subtotal : 0;
    const discount = cart.appliedCoupon?.discountAmount || 0;
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);

    let taxAmount = 0;
    const isTaxEnabled = settings?.is_tax_enabled == '1';
    const taxLabel = settings?.tax_label || 'Tax';
    const taxInclusive = settings?.tax_inclusion === 'include';

    cart.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const itemDiscount = subtotal > 0 ? (itemTotal / subtotal) * discount : 0;
        const itemFinal = itemTotal - itemDiscount;

        if (isTaxEnabled) {
            let taxRate = 0;
            if (item.tax_class && settings?.taxes) {
                const t = settings.taxes.find((t: any) => t.id === item.tax_class);
                if (t) taxRate = parseFloat(t.rate) / 100;
            }

            if (taxInclusive) {
                taxAmount += itemFinal - (itemFinal / (1 + taxRate));
            } else {
                taxAmount += itemFinal * taxRate;
            }
        }
    });

    const calcShipping = (rule: any) => {
        if (!rule) return 0;
        if (rule.type === 'free') return 0;
        if (rule.type === 'flat') return parseFloat(rule.fee) || 0;
        if (rule.type === 'conditional') {
            return subtotalAfterDiscount >= (parseFloat(rule.threshold) || 0) ? 0 : (parseFloat(rule.fee) || 0);
        }
        if (rule.type === 'tiered') {
            const tiers = rule.tiers || [];
            for (const t of tiers) {
                if (subtotalAfterDiscount <= (parseFloat(t.up_to) || 0)) {
                    return parseFloat(t.fee) || 0;
                }
            }
            return tiers.length > 0 ? (parseFloat(tiers[tiers.length - 1].fee) || 0) : 0;
        }
        return 0;
    };

    const codApplicableCharge = calcShipping(settings?.shipping_rules?.cod);

    let shipping = 0;
    let shippingType = 'Calculated at next step';
    let prepaidDiscount = 0;

    const activeRule = paymentMethod === 'prepaid' ? settings?.shipping_rules?.prepaid : settings?.shipping_rules?.cod;

    if (activeRule) {
        if (activeRule.type === 'free') {
            shipping = 0;
            shippingType = 'Free';
        } else if (activeRule.type === 'flat') {
            shipping = parseFloat(activeRule.fee) || 0;
            shippingType = shipping === 0 ? 'Free' : formatPrice(shipping);
        } else if (activeRule.type === 'conditional') {
            if (subtotalAfterDiscount >= (parseFloat(activeRule.threshold) || 0)) {
                shipping = 0;
                shippingType = 'Free';
            } else {
                shipping = parseFloat(activeRule.fee) || 0;
                shippingType = shipping === 0 ? 'Free' : formatPrice(shipping);
            }
        } else if (activeRule.type === 'tiered') {
            const tiers = activeRule.tiers || [];
            let matchedFee = 0;
            let applied = false;
            for (const t of tiers) {
                if (subtotalAfterDiscount <= (parseFloat(t.up_to) || 0)) {
                    matchedFee = parseFloat(t.fee) || 0;
                    applied = true;
                    break;
                }
            }
            if (!applied && tiers.length > 0) {
                matchedFee = parseFloat(tiers[tiers.length - 1].fee) || 0;
            }
            shipping = matchedFee;
            shippingType = shipping === 0 ? 'Free' : formatPrice(shipping);
        }

        if (paymentMethod === 'prepaid') {
            if (activeRule.discount_type === 'percent') {
                prepaidDiscount = (subtotalAfterDiscount * (parseFloat(activeRule.discount_value) || 0)) / 100;
            } else if (activeRule.discount_type === 'flat') {
                prepaidDiscount = parseFloat(activeRule.discount_value) || 0;
            }
        }
    }

    const gcDiscount = gcApplied ? Math.min(gcApplied.balance, subtotalAfterDiscount + shipping - prepaidDiscount) : 0;

    const total = (isTaxEnabled && !taxInclusive)
        ? Math.max(0, subtotalAfterDiscount + taxAmount + shipping - prepaidDiscount - gcDiscount)
        : Math.max(0, subtotalAfterDiscount + shipping - prepaidDiscount - gcDiscount);

    const totalSavings = mrpDiscount + discount + prepaidDiscount + gcDiscount;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                <p className="text-sm text-gray-400 mt-1">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your bag</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">

                {/* ── LEFT ─────────────────────────────────────────────────── */}
                <div className="flex-1 space-y-10 min-w-0">

                    {/* Cart Items */}
                    <section>
                        <div className="bg-white border border-gray-100 rounded-2xl px-5 divide-y divide-gray-50">
                            {cart.items.map(item => (
                                <CartRow key={item.skuId} item={item} update={cart.updateQuantity} remove={cart.removeItem} />
                            ))}
                        </div>
                    </section>

                    {/* Delivery */}
                    <section>
                        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <MapPin size={12} /> Delivery Address
                        </h2>
                        {user ? (
                            <div className="bg-white border border-gray-100 rounded-2xl p-5">
                                <CheckoutAddress selectedId={selectedAddr?.id ?? null} onChange={setSelectedAddr} />
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Full Name" value={guest.name} onChange={v => g('name', v)} placeholder="Your name" />
                                    <Field label="Phone" value={guest.phone} onChange={v => g('phone', v)} placeholder="10-digit" />
                                    <Field label="Email" value={guest.email} onChange={v => g('email', v)} placeholder="you@email.com" type="email" span />
                                    <Field label="Address Line 1" value={guest.line1} onChange={v => g('line1', v)} placeholder="House, Street" span />
                                    <Field label="Address Line 2" value={guest.line2} onChange={v => g('line2', v)} placeholder="Area, Landmark (optional)" span />
                                    <Field label="City" value={guest.city} onChange={v => g('city', v)} />
                                    <Field label="State" value={guest.state} onChange={v => g('state', v)} />
                                    <Field label="Pincode" value={guest.zip} onChange={v => g('zip', v)} />
                                </div>
                                <Link href="/login" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium">
                                    <Lock size={11} /> Sign in to use saved addresses
                                </Link>
                            </div>
                        )}
                    </section>
                </div>

                {/* ── RIGHT ────────────────────────────────────────────────── */}
                <div className="w-full lg:w-[340px] shrink-0 space-y-4">

                    {/* Coupon */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag size={14} className="text-gray-500" />
                            <p className="text-sm font-semibold text-gray-700">Apply Coupon</p>
                        </div>

                        {cart.appliedCoupon ? (
                            <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-xs font-black text-green-700 tracking-widest uppercase">{cart.appliedCoupon.code}</p>
                                    <p className="text-xs text-green-600 mt-0.5">−{formatPrice(discount)} saved</p>
                                </div>
                                <button onClick={() => cart.setAppliedCoupon(null)} className="text-green-400 hover:text-green-700 transition-colors p-1"><X size={15} /></button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        value={couponInput}
                                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon('')}
                                        placeholder="Coupon code"
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 uppercase font-mono tracking-wider focus:outline-none focus:border-gray-500 transition-all"
                                    />
                                    <button onClick={() => handleApplyCoupon('')} disabled={!couponInput || applying}
                                        className="bg-gray-900 text-white text-xs font-bold px-4 rounded-lg hover:bg-black transition-all disabled:opacity-30">
                                        {applying ? '…' : 'Apply'}
                                    </button>
                                </div>
                                {couponErr && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{couponErr}</p>}
                                <button onClick={() => setCouponModal(true)} className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-800 py-2 px-1 transition-colors">
                                    <span className="flex items-center gap-1.5"><Ticket size={13} />View available coupons</span>
                                    <ChevronRight size={13} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gift Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Gift size={14} className="text-gray-500" />
                            <p className="text-sm font-semibold text-gray-700">Gift Card</p>
                        </div>

                        {gcApplied ? (
                            <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                                <div>
                                    <p className="text-xs font-black text-violet-700 tracking-widest uppercase">{gcApplied.code}</p>
                                    <p className="text-xs text-violet-500 mt-0.5">−{formatPrice(gcDiscount)} applied · ₹{(gcApplied.balance - gcDiscount).toFixed(0)} left on card</p>
                                </div>
                                <button onClick={() => setGcApplied(null)} className="text-violet-300 hover:text-violet-700 transition-colors p-1"><X size={15} /></button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        value={gcInput}
                                        onChange={e => setGcInput(e.target.value.toUpperCase())}
                                        onKeyDown={e => e.key === 'Enter' && handleValidateGiftCard()}
                                        placeholder="Gift card code"
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 uppercase font-mono tracking-wider focus:outline-none focus:border-gray-500 transition-all"
                                    />
                                    <button onClick={handleValidateGiftCard} disabled={!gcInput || gcValidating}
                                        className="bg-violet-700 text-white text-xs font-bold px-4 rounded-lg hover:bg-violet-800 transition-all disabled:opacity-30">
                                        {gcValidating ? '…' : 'Apply'}
                                    </button>
                                </div>
                                {gcErr && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{gcErr}</p>}
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Order Summary</p>

                        <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>MRP Total</span>
                                <span className="font-medium text-gray-900">{formatPrice(mrpTotal)}</span>
                            </div>
                            {mrpDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount on MRP</span>
                                    <span>−{formatPrice(mrpDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600 font-medium">
                                <span>Cart Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Coupon Discount {cart.appliedCoupon?.code && `(${cart.appliedCoupon.code})`}</span>
                                    <span>−{formatPrice(discount)}</span>
                                </div>
                            )}
                            {prepaidDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Prepaid Discount</span>
                                    <span>−{formatPrice(prepaidDiscount)}</span>
                                </div>
                            )}
                            {gcDiscount > 0 && (
                                <div className="flex justify-between text-violet-600">
                                    <span>Gift Card ({gcApplied?.code})</span>
                                    <span>−{formatPrice(gcDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-500">
                                <span className="flex flex-col">
                                    {paymentMethod === 'cod' ? 'COD Charges' : 'Shipping Charges'}
                                    {activeRule?.notes && (
                                        <span className="text-[10px] text-gray-400 max-w-[150px] leading-tight mt-0.5">
                                            {activeRule.notes}
                                        </span>
                                    )}
                                </span>
                                <span className={shippingType === 'Free' ? 'text-green-600 font-medium' : ''}>
                                    {shippingType === 'Free' ? 'Included' : shippingType}
                                </span>
                            </div>
                            {totalSavings > 0 && (
                                <div className="flex justify-between text-green-600 font-medium pt-1">
                                    <span>Total Savings</span>
                                    <span>{formatPrice(totalSavings)}</span>
                                </div>
                            )}
                            {isTaxEnabled && (
                                <div className="flex justify-between text-gray-500 text-xs">
                                    <span>{taxLabel} {taxInclusive ? '(Included)' : ''}</span>
                                    <span>{formatPrice(taxAmount)}</span>
                                </div>
                            )}
                            <div className="h-px bg-gray-100 my-1" />
                            <div className="flex justify-between font-bold text-gray-900 text-base">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>

                        {orderErr && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-xs text-red-600">
                                <AlertCircle size={13} className="mt-0.5 shrink-0" /> {orderErr}
                            </div>
                        )}

                        <div className="mt-5 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-400 transition-colors bg-gray-50/50" onClick={() => setPaymentModal(true)}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Payment Method</p>
                                    <p className="text-sm font-bold text-gray-900">{paymentMethod === 'prepaid' ? 'Online Payment / UPI' : 'Cash on Delivery (COD)'}</p>
                                </div>
                                <span className="text-xs font-bold text-gray-500 underline underline-offset-2">Change</span>
                            </div>
                        </div>

                        <button onClick={handlePlaceOrder} disabled={placing || (!!user && !selectedAddr)}
                            className="mt-5 w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                            {placing ? 'Placing Order…' : 'Place Order'}
                            {!placing && <ArrowRight size={16} />}
                        </button>

                        {user && !selectedAddr && (
                            <p className="text-center text-[10px] text-gray-400 mt-3">Select a delivery address above to continue</p>
                        )}
                    </div>
                </div>
            </div>

            <CouponModal open={couponModal} onClose={() => setCouponModal(false)} coupons={publicCoupons} onApply={handleApplyCoupon} applying={applying} />

            {/* Payment Method Modal */}
            {paymentModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setPaymentModal(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl z-10 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <p className="font-bold text-gray-900 text-sm">Select Payment Method</p>
                            <button onClick={() => setPaymentModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
                        </div>
                        <div className="p-5 space-y-3">
                            <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'prepaid' ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                                <div className="flex items-center gap-3">
                                    <input type="radio" name="payment_method" value="prepaid" checked={paymentMethod === 'prepaid'} onChange={() => { setPaymentMethod('prepaid'); setPaymentModal(false); }} className="w-4 h-4 text-black focus:ring-black" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">Online Payment / UPI / Cards</p>
                                        <p className="text-xs text-green-600 font-medium mt-0.5">Get extra discounts on prepaid orders</p>
                                    </div>
                                </div>
                            </label>

                            {settings?.shipping_rules?.cod && (
                                <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="payment_method" value="cod" checked={paymentMethod === 'cod'} onChange={() => { setPaymentMethod('cod'); setPaymentModal(false); }} className="w-4 h-4 text-black focus:ring-black" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</p>
                                            {codApplicableCharge > 0 ? (
                                                <p className="text-xs text-red-500 font-medium mt-0.5">Extra {formatPrice(codApplicableCharge)} charge applicable</p>
                                            ) : (
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">Pay at your doorstep</p>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
