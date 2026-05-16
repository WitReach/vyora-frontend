'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import Link from 'next/link';
import {
    Gift, Wallet, ArrowRight, CreditCard, Clock, CheckCircle,
    AlertCircle, X, Check, Copy, Share2, MessageCircle, Mail, Link2,
    ShieldCheck, Zap, History, LayoutGrid, ListFilter
} from 'lucide-react';

interface GiftCard {
    id: number;
    card_number: string;
    plain_code: string;
    share_token: string;
    amount: number;
    used_amount: number;
    remaining_amount: number;
    status: string;
    status_badge: { label: string; class: string };
    type: string;
    template_name: string | null;
    created_at: string;
    expires_at: string | null;
    purchased_by: string | null;
    created_by: string | null;
    is_redeemable: boolean;
}

interface WalletSummary {
    total_balance: number;
    gifted_amount: number;
    active_cards: number;
}

// ── Share Modal ─────────────────────────────────────────────────────────────
function ShareModal({ card, onClose }: { card: GiftCard; onClose: () => void }) {
    const [codeCopied, setCodeCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/gift-cards/share/${card.share_token}`
        : '';

    const shareText = `🎁 I'm gifting you a ₹${card.amount.toLocaleString()} Dope Style Gift Card!\n\nUse code: *${card.plain_code}* at checkout.\n\nOr open this link to view & redeem: ${shareUrl}`;

    const copyCode = () => {
        navigator.clipboard.writeText(card.plain_code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    };

    const shareEmail = () => {
        const subject = encodeURIComponent(`Your ₹${card.amount.toLocaleString()} Dope Style Gift Card`);
        const body = encodeURIComponent(shareText);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <div className="absolute top-0 right-0 p-8">
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-10 pt-16">
                    <div className="mb-10 text-center">
                        <div className="w-20 h-20 bg-black text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <Share2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Share Gift Card</h3>
                        <p className="text-sm text-gray-400 font-medium tracking-tight">Send this digital asset to anyone instantly.</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 text-center">Redemption Code</p>
                            <div className="group relative">
                                <div className="absolute inset-0 bg-black/5 blur-xl group-hover:bg-black/10 transition-all rounded-3xl" />
                                <div className="relative bg-gray-50 border border-gray-100 rounded-3xl p-6 flex items-center justify-between">
                                    <p className="font-mono text-xl font-black tracking-[0.3em] text-gray-900">
                                        {card.plain_code}
                                    </p>
                                    <button
                                        onClick={copyCode}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${codeCopied ? 'bg-emerald-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
                                    >
                                        {codeCopied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: <MessageCircle />, label: 'WhatsApp', color: 'bg-emerald-50 text-emerald-600', action: shareWhatsApp },
                                { icon: <Mail />, label: 'Email', color: 'bg-blue-50 text-blue-600', action: shareEmail },
                                { icon: linkCopied ? <CheckCircle /> : <Link2 />, label: linkCopied ? 'Copied' : 'Link', color: 'bg-gray-50 text-gray-900', action: copyLink }
                            ].map((btn, i) => (
                                <button
                                    key={i}
                                    onClick={btn.action}
                                    className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] transition-all hover:scale-105 ${btn.color}`}
                                >
                                    {btn.icon}
                                    <span className="text-[9px] font-black uppercase tracking-widest">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-relaxed">
                            Secured Digital Transaction · Dope Style Vault
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Assign Modal ─────────────────────────────────────────────────────────────
function AssignModal({ card, onClose, onSuccess }: { card: GiftCard; onClose: () => void; onSuccess: () => void }) {
    const [identifier, setIdentifier] = useState('');
    const [foundUser, setFoundUser] = useState<any>(null);
    const [searching, setSearching] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const lookup = async () => {
        if (!identifier.trim()) return;
        setSearching(true); setError(''); setFoundUser(null);
        try {
            const r = await api.post('/api/gift-cards/lookup-user', { identifier });
            setFoundUser(r.data.user);
        } catch (e: any) {
            setError(e.response?.data?.message || 'User not found.');
        } finally { setSearching(false); }
    };

    const assign = async () => {
        if (!confirmed || !foundUser) return;
        setAssigning(true); setError('');
        try {
            await api.post('/api/gift-cards/assign', { gift_card_id: card.id, recipient_id: foundUser.id });
            setSuccess(`Gift card sent to ${foundUser.name}!`);
            setTimeout(() => { onSuccess(); onClose(); }, 1500);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Transaction failed.');
        } finally { setAssigning(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <div className="absolute top-0 right-0 p-8">
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {!success ? (
                    <div className="p-10 pt-16">
                        <div className="mb-10 text-center">
                            <div className="w-20 h-20 bg-amber-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Transfer Ownership</h3>
                            <p className="text-sm text-gray-400 font-medium tracking-tight">Permanent in-app digital asset transfer.</p>
                        </div>

                        <div className="space-y-8">
                            {!foundUser ? (
                                <>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-4">Recipient Identity</label>
                                        <div className="flex gap-3">
                                            <input value={identifier} onChange={e => setIdentifier(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && lookup()}
                                                placeholder="Enter Email or Phone"
                                                className="flex-1 border border-gray-100 bg-gray-50 rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all" />
                                            <button onClick={lookup} disabled={searching || !identifier.trim()}
                                                className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-gray-800 transition-all disabled:opacity-30">
                                                {searching ? '...' : 'Find'}
                                            </button>
                                        </div>
                                    </div>
                                    {error && <p className="text-xs text-red-500 font-bold flex items-center gap-2 px-2"><AlertCircle className="w-4 h-4" />{error}</p>}
                                </>
                            ) : (
                                <>
                                    <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 relative group overflow-hidden">
                                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-black/5 rounded-full blur-3xl" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Recipient Profile</p>
                                        <p className="font-black text-2xl text-gray-900 mb-1">{foundUser.name}</p>
                                        <p className="text-xs text-gray-500 font-bold">{foundUser.email}</p>
                                    </div>

                                    <div className="p-6 bg-amber-50 border border-amber-200 rounded-[2rem] flex gap-4">
                                        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                        <p className="text-xs text-amber-800 font-bold leading-relaxed">
                                            Warning: This transfer is permanent. You will lose access to this gift card immediately.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${confirmed ? 'bg-black border-black shadow-lg shadow-black/20' : 'border-gray-200'}`}>
                                                {confirmed && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="hidden" />
                                            <span className="text-xs text-gray-600 font-black uppercase tracking-widest">Authorize Transfer</span>
                                        </label>

                                        <div className="flex gap-3">
                                            <button onClick={assign} disabled={!confirmed || assigning}
                                                className="flex-1 py-5 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-gray-800 transition-all disabled:opacity-30 shadow-2xl active:scale-95">
                                                {assigning ? 'Securing Transaction...' : `Transfer Asset to ${foundUser.name.split(' ')[0]}`}
                                            </button>
                                            <button onClick={() => setFoundUser(null)} className="px-8 py-5 bg-gray-50 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-gray-100 transition-all">Back</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/30">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Transfer Complete</h3>
                        <p className="text-gray-400 font-medium">{success}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Card Chip ────────────────────────────────────────────────────────────────
function GiftCardChip({ card, onShare, onAssign }: {
    card: GiftCard;
    onShare: (card: GiftCard) => void;
    onAssign: (card: GiftCard) => void;
}) {
    return (
        <div className={`relative group rounded-[2.5rem] p-1.5 transition-all duration-500 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] ${card.is_redeemable ? 'opacity-100' : 'opacity-60 grayscale'}`}>
            <div className="relative rounded-[2.2rem] overflow-hidden p-8 text-white min-h-[280px] flex flex-col justify-between shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                style={{ background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' }}>
                
                {/* Textures & Effects */}
                <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000 group-hover:translate-x-10" />

                <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                            <Gift className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50">
                                {card.template_name ?? 'Digital Voucher'}
                            </p>
                            <p className="font-mono text-[10px] tracking-widest mt-1 text-white/30 uppercase">{card.card_number}</p>
                        </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        card.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                        card.status === 'partially_used' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                        'border-white/10 bg-white/5 text-white/40'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${card.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                        {card.status_badge.label}
                    </div>
                </div>

                <div className="mt-8 relative z-10">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-3 font-black">Available Credit</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold opacity-30">₹</span>
                        <p className="text-6xl font-black tracking-tighter leading-none">{card.remaining_amount.toLocaleString()}</p>
                    </div>
                    {card.used_amount > 0 && (
                        <div className="mt-4 flex items-center gap-4">
                            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-400/50 rounded-full" 
                                    style={{ width: `${(card.remaining_amount / card.amount) * 100}%` }}
                                />
                            </div>
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest whitespace-nowrap">
                                Used ₹{card.used_amount.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5 relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {card.expires_at ? `Expires ${new Date(card.expires_at).toLocaleDateString()}` : 'No Expiry Date'}
                    </div>
                    {card.is_redeemable && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onShare(card)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-[1.2rem] transition-all active:scale-95 border border-white/5"
                            >
                                <Share2 className="w-3.5 h-3.5" /> Share
                            </button>
                            <button
                                onClick={() => onAssign(card)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-black px-5 py-3 rounded-[1.2rem] hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" /> Transfer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MyGiftCardsPage() {
    const { user } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [cards, setCards] = useState<GiftCard[]>([]);
    const [wallet, setWallet] = useState<WalletSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [shareCard, setShareCard] = useState<GiftCard | null>(null);
    const [assignCard, setAssignCard] = useState<GiftCard | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const [cardsRes, walletRes] = await Promise.all([
                api.get('/api/gift-cards/my-cards'),
                api.get('/api/gift-cards/wallet'),
            ]);
            setCards(cardsRes.data);
            setWallet(walletRes.data);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { setMounted(true); if (user) load(); }, [user]);

    if (!mounted) return null;

    if (!user) return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50/50">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] border border-gray-100 flex items-center justify-center mb-10 shadow-2xl shadow-gray-100 relative overflow-hidden group">
                <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                <Gift className="w-10 h-10 text-gray-200 group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Identity Required</h1>
            <p className="text-gray-400 text-base font-medium mb-10">Sign in to access your digital vault and assets.</p>
            <Link href="/login" className="bg-black text-white px-12 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-gray-800 transition-all flex items-center gap-4 shadow-2xl shadow-gray-200 active:scale-95">
                Authorize Access <ArrowRight className="w-5 h-5" />
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 selection:bg-black selection:text-white">
            {/* Elegant Header */}
            <div className="bg-white border-b border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50/50 -skew-x-12 translate-x-32 pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                        <div>
                            <div className="inline-flex items-center gap-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full mb-8">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Digital Vault
                            </div>
                            <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight leading-none mb-6">Asset Portfolio</h1>
                            <p className="text-gray-400 text-lg font-medium max-w-lg">Manage your digital gift cards, monitor balances, and secure your transfers.</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-4">
                            <Link href="/gift-cards"
                                className="inline-flex items-center gap-4 bg-black text-white px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-gray-800 transition-all shadow-2xl shadow-gray-200 group active:scale-95">
                                <Zap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" /> Mint New Card
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Refined Wallet Summary */}
                {wallet && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 -mt-12 relative z-10 mb-20">
                        {[
                            { label: 'Portfolio Value', value: `₹${wallet.total_balance.toLocaleString()}`, icon: <Wallet className="w-5 h-5 text-gray-900" />, desc: 'Total usable credit' },
                            { label: 'Assets Gifted', value: `₹${wallet.gifted_amount.toLocaleString()}`, icon: <History className="w-5 h-5 text-gray-900" />, desc: 'Outbound transfers' },
                            { label: 'Active Holdings', value: wallet.active_cards, icon: <LayoutGrid className="w-5 h-5 text-gray-900" />, desc: 'Available digital cards' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    {stat.icon}
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-[1.2rem] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                        {stat.icon}
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
                                </div>
                                <p className="text-5xl font-black text-gray-900 tracking-tighter mb-2">{stat.value}</p>
                                <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest">{stat.desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cards Grid Container */}
                <div className="py-10">
                    <div className="mb-12 flex items-center justify-between border-b border-gray-200 pb-8">
                        <div className="flex items-center gap-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Your Digital Assets</h2>
                            <span className="bg-gray-100 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-gray-500">
                                {cards.length} Total
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                                <ListFilter className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {[1, 2].map(i => <div key={i} className="h-72 rounded-[3rem] bg-white border border-gray-100 animate-pulse" />)}
                        </div>
                    ) : cards.length === 0 ? (
                        <div className="text-center py-40 bg-white border border-dashed border-gray-100 rounded-[4rem] relative overflow-hidden">
                            <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
                            <Gift className="w-20 h-20 text-gray-100 mx-auto mb-8 animate-bounce duration-[3s]" />
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Vault is Empty</h3>
                            <p className="text-gray-400 font-medium mb-12 max-w-xs mx-auto">No digital gift cards found in your holdings. Start your collection today.</p>
                            <Link href="/gift-cards" className="inline-flex items-center gap-4 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] px-12 py-5 rounded-[1.5rem] hover:bg-gray-800 transition-all shadow-2xl active:scale-95">
                                Shop Gift Cards <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {cards.map(card => (
                                <GiftCardChip
                                    key={card.id}
                                    card={card}
                                    onShare={setShareCard}
                                    onAssign={setAssignCard}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Insight */}
                <div className="mt-20 p-12 bg-gray-900 rounded-[3rem] text-white overflow-hidden relative group">
                    <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                        <div className="text-center md:text-left max-w-lg">
                            <h4 className="text-2xl font-black mb-3 tracking-tight">Security Protocol</h4>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                Every card in your vault is protected by unique 12-digit encryption. 
                                In-app transfers are final and secured via our proprietary ledger system.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-amber-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {shareCard && <ShareModal card={shareCard} onClose={() => setShareCard(null)} />}
            {assignCard && <AssignModal card={assignCard} onClose={() => setAssignCard(null)} onSuccess={load} />}
        </div>
    );
}
