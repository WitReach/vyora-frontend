'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import api from '@/lib/api';
import Link from 'next/link';
import { 
    Gift, ArrowRight, Check, Clock, ShieldCheck, 
    ShoppingBag, CreditCard, Users, Sparkles,
    Smartphone, Zap, Heart
} from 'lucide-react';

interface GiftCardTemplate {
    id: number;
    name: string;
    amount: number;
    description: string | null;
    validity_days: number | null;
    purchased_count: number;
    created_at: string;
}

function GiftCardOption({ card, onBuy, buying }: { card: GiftCardTemplate; onBuy: () => void; buying: boolean }) {
    const isPremium = card.amount >= 1000;

    return (
        <div
            className={`group relative bg-white rounded-[2.5rem] p-5 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:-translate-y-2 border border-gray-100 ${buying ? 'opacity-60 pointer-events-none' : ''}`}
            onClick={onBuy}
        >
            {/* Visual Card Display */}
            <div className={`relative aspect-[1.6/1] w-full rounded-[2rem] overflow-hidden p-8 flex flex-col justify-between transition-all duration-700 group-hover:scale-[1.02] shadow-2xl ${
                isPremium
                ? 'bg-black text-white'
                : 'bg-gray-50 text-gray-900 border border-gray-100'
            }`}>
                {/* Background Patterns */}
                <div className="absolute inset-0 opacity-10 bg-noise pointer-events-none" />
                <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] pointer-events-none ${isPremium ? 'bg-white/10' : 'bg-black/5'}`} />

                <div className="flex justify-between items-start relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPremium ? 'bg-white/10 backdrop-blur-md border border-white/10' : 'bg-white border border-gray-200'}`}>
                        <Gift className={`w-6 h-6 ${isPremium ? 'text-gray-300' : 'text-gray-900'}`} />
                    </div>
                    <span className={`text-[11px] font-black tracking-[0.4em] uppercase ${isPremium ? 'text-gray-500' : 'text-gray-300'}`}>
                        DOPE STYLE
                    </span>
                </div>

                <div className="relative z-10">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isPremium ? 'text-gray-500' : 'text-gray-400'}`}>Gift Card Value</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold">₹</span>
                        <p className="text-5xl font-black tracking-tighter">{card.amount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex justify-between items-end relative z-10">
                    <p className={`text-[9px] font-mono tracking-[0.2em] opacity-40 uppercase`}>Authenticated Digital Asset</p>
                    <div className={`w-14 h-8 rounded-lg border ${isPremium ? 'bg-white/5 border-white/10' : 'bg-gray-900/5 border-gray-900/10'}`} />
                </div>
            </div>

            {/* Information */}
            <div className="mt-8 px-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-black uppercase tracking-widest text-gray-900">
                        {card.name || `Digital Voucher`}
                    </h3>
                    {isPremium && (
                        <div className="flex items-center gap-1.5 bg-black text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            <Sparkles className="w-3 h-3 text-amber-400" /> Premium
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-400 mb-6 leading-relaxed line-clamp-2">
                    {card.description || 'Instant digital delivery with a unique redemption code valid storewide.'}
                </p>

                <div className="space-y-3 mb-8">
                    {[
                        'Instant Unique Code Delivery',
                        'Share via WhatsApp or Email',
                        card.validity_days ? `Valid for ${card.validity_days} days` : 'No Expiry Date'
                    ].map((text, i) => (
                        <div key={i} className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                            <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-emerald-500" />
                            </div>
                            {text}
                        </div>
                    ))}
                </div>

                <button
                    className="w-full py-4 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 group/btn"
                    disabled={buying}
                    onClick={(e) => { e.stopPropagation(); onBuy(); }}
                >
                    {buying ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Purchase Card <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" /></>
                    )}
                </button>
            </div>
        </div>
    );
}

export default function GiftCardsPage() {
    const { user } = useAuthStore();
    const { openAuthModal } = useUIStore();
    const [mounted, setMounted] = useState(false);
    const [cards, setCards] = useState<GiftCardTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState<number | null>(null);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setMounted(true);
        api.get('/api/gift-cards/purchasable')
            .then(r => setCards(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleBuy = async (card: GiftCardTemplate) => {
        if (!user) {
            openAuthModal();
            return;
        }

        setBuying(card.id);
        try {
            const orderRes = await api.post('/api/payment/initiate', {
                type: 'gift_card',
                template_id: card.id,
            });

            if (!orderRes.data?.order_id) throw new Error('Could not initiate payment');

            const options = {
                key: orderRes.data.key,
                amount: orderRes.data.amount,
                currency: 'INR',
                name: orderRes.data.name || 'Dope Style',
                description: orderRes.data.description,
                order_id: orderRes.data.order_id,
                handler: async (response: any) => {
                    const verifyRes = await api.post('/api/payment/verify', {
                        ...response,
                        type: 'gift_card',
                        template_id: card.id,
                    });

                    if (verifyRes.data.success) {
                        const activateRes = await api.post('/api/gift-cards/activate', {
                            template_id: card.id,
                        });

                        if (activateRes.data.success) {
                            setSuccess(`₹${card.amount} gift card added to your wallet!`);
                            setCards(prev => prev.map(c =>
                                c.id === card.id ? { ...c, purchased_count: c.purchased_count + 1 } : c
                            ));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }
                },
                prefill: { name: user.name, email: user.email },
                theme: { color: '#000000' },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (e) {
            alert('Payment failed. Please try again.');
        } finally {
            setBuying(null);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 selection:bg-black selection:text-white">

            {/* Premium Hero Section */}
            <div className="relative bg-white overflow-hidden border-b border-gray-100">
                {/* Background elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50/50 -skew-x-12 translate-x-32 pointer-events-none" />
                <div className="absolute top-40 left-10 w-64 h-64 bg-black/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 py-20 sm:py-32 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <Sparkles className="w-4 h-4 text-amber-400" /> Digital Masterpieces
                            </div>
                            <h1 className="text-6xl sm:text-8xl font-black text-gray-900 tracking-tight leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                                Give the gift<br />
                                <span className="text-gray-300">of style</span>
                            </h1>
                            <p className="text-gray-500 text-lg leading-relaxed max-w-lg mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                Surprise your loved ones with a Dope Style gift card. Each purchase generates a 
                                unique digital vault code you can redeem yourself or share instantly.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                                <Link
                                    href="/gift-cards/my-cards"
                                    className="inline-flex items-center gap-4 bg-black text-white px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-gray-800 transition-all shadow-2xl shadow-gray-200 group"
                                >
                                    <CreditCard className="w-5 h-5 transition-transform group-hover:scale-110" /> Go to My Wallet
                                </Link>
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="User" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center text-[10px] text-white font-black">
                                        +2k
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Animated Visual */}
                        <div className="hidden lg:block relative perspective-1000">
                            <div className="relative w-full aspect-[1.6/1] bg-black rounded-[3rem] p-12 shadow-2xl animate-float rotate-3 hover:rotate-0 transition-transform duration-700 cursor-pointer overflow-hidden group">
                                <div className="absolute inset-0 bg-noise opacity-20" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                                        <Gift className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/40 text-[10px] font-black tracking-[0.4em] mb-1">AUTHENTIC</p>
                                        <p className="text-white text-xs font-black tracking-widest">DS-VC-2026</p>
                                    </div>
                                </div>

                                <div className="mt-12 relative z-10">
                                    <p className="text-white/30 text-[10px] font-black tracking-[0.4em] mb-2 uppercase">Voucher Value</p>
                                    <p className="text-white text-7xl font-black tracking-tighter">₹5,000</p>
                                </div>

                                <div className="absolute bottom-12 right-12 w-20 h-12 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Success Notification */}
                {success && (
                    <div className="mt-12 p-8 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-500 shadow-xl shadow-emerald-500/5">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-emerald-200">
                                <Check className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="font-black text-2xl tracking-tight leading-none mb-1">{success}</p>
                                <p className="text-emerald-600 text-sm font-medium">Your unique code is now active in your wallet.</p>
                            </div>
                        </div>
                        <Link
                            href="/gift-cards/my-cards"
                            className="bg-emerald-800 text-white px-10 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-900 transition-all shrink-0 shadow-lg"
                        >
                            View Card in Vault
                        </Link>
                    </div>
                )}

                {/* Main Grid */}
                <div className="py-20">
                    <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
                        <div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-black mb-3">Denominations</h2>
                            <p className="text-gray-400 text-sm font-medium">Select a card value — instant unique code delivery</p>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Instant Delivery</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Digital Vault</span>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-[500px] rounded-[2.5rem] bg-white border border-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : cards.length === 0 ? (
                        <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-gray-200">
                            <Gift className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <p className="text-gray-400 font-black uppercase tracking-widest">No denominations available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {cards.map(card => (
                                <GiftCardOption
                                    key={card.id}
                                    card={card}
                                    buying={buying === card.id}
                                    onBuy={() => handleBuy(card)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Trust Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-24 border-t border-gray-100">
                    {[
                        { icon: <CreditCard className="w-6 h-6" />, title: 'Encrypted Codes', desc: 'Every card has a unique 12-digit code.' },
                        { icon: <Check className="w-6 h-6" />, title: 'Valid Storewide', desc: 'Use it on any product across the shop.' },
                        { icon: <Heart className="w-6 h-6" />, title: 'Easy Sharing', desc: 'Gift via WhatsApp or Email instantly.' },
                        { icon: <ShoppingBag className="w-6 h-6" />, title: 'No Expiry', desc: 'Our cards never expire. Take your time.' }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-50 hover:shadow-xl hover:shadow-gray-100 transition-all duration-500">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest mb-3 text-gray-900">{feature.title}</h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* FAQ Style Section */}
                <div className="bg-black rounded-[3rem] p-12 sm:p-20 text-center text-white overflow-hidden relative shadow-2xl shadow-gray-200 mb-20 group">
                    <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
                    
                    <h3 className="text-4xl sm:text-6xl font-black mb-6 relative z-10 tracking-tight">Bulk Gifting?</h3>
                    <p className="text-gray-400 max-w-lg mx-auto mb-12 relative z-10 text-base leading-relaxed">
                        Reward your corporate team or clients with bulk digital gift cards. 
                        Contact our sales team for bespoke institutional solutions.
                    </p>
                    <button className="bg-white text-gray-900 px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-gray-100 transition-all relative z-10 shadow-2xl active:scale-95">
                        Inquire Now
                    </button>
                </div>
            </div>
        </div>
    );
}
