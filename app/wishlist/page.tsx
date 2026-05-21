'use client';

import { useWishlistStore, WishlistItem } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useSettings } from '@/contexts/SettingsContext';
import { formatPrice } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Heart, ShoppingCart, Zap, Trash2, ShoppingBag,
    CalendarDays, ArrowRight, Package, ExternalLink,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { useUIStore } from '@/store/ui';

// ── Types ────────────────────────────────────────────────────────────────────
interface ProductVariant {
    id: number;
    price: number;
    mrp: number;
    stock: number;
    attributes: { name: string; value: string; code: string; meta: string | null }[];
}
interface ProductImage {
    id: number;
    url: string;
    is_primary: boolean;
    color_id: number | null;
}
interface ProductFull {
    id: number;
    slug: string;
    name: string;
    variants: ProductVariant[];
    images: ProductImage[];
    coupon_price?: number;
    tax_class?: string;
    mrp?: number | string;
}

// ── Horizontal scrollable row with arrow buttons + mouse wheel ───────────────
function HScrollRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    const checkScroll = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 4);
        setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);
        return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
    }, [checkScroll]);

    const scroll = (dir: 'left' | 'right') => {
        ref.current?.scrollBy({ left: dir === 'left' ? -100 : 100, behavior: 'smooth' });
    };

    // Mouse-wheel → horizontal scroll
    const onWheel = (e: React.WheelEvent) => {
        if (!ref.current) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            ref.current.scrollLeft += e.deltaY;
        }
    };

    return (
        <div className={`relative flex items-center gap-1 ${className}`}>
            {/* Left arrow */}
            {canLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="shrink-0 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all z-10"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-3 h-3" />
                </button>
            )}

            {/* Scrollable strip */}
            <div
                ref={ref}
                onWheel={onWheel}
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 p-1"
            >
                {children}
            </div>

            {/* Right arrow */}
            {canRight && (
                <button
                    onClick={() => scroll('right')}
                    className="shrink-0 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all z-10"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}

// ── Magic Deal widget ────────────────────────────────────────────────────────
function MagicDealBadge({ couponPrice, policies }: { couponPrice: number; policies: any }) {
    const bgFrom = policies?.mega_deal_bg_from || '#4f46e5';
    const bgTo = policies?.mega_deal_bg_to || '#7c3aed';
    const textColor = policies?.mega_deal_text_color || '#ffffff';
    const icon = policies?.mega_deal_icon || '⚡';
    return (
        <div
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
            style={{ background: `linear-gradient(to right, ${bgFrom}, ${bgTo})` }}
        >
            <span className="text-sm">{icon}</span>
            <span style={{ color: textColor }} className="text-[11px] font-black whitespace-nowrap">
                Get at {formatPrice(couponPrice)}
            </span>
        </div>
    );
}

// ── Single wishlist card ─────────────────────────────────────────────────────
function WishlistCard({ item, settings, policies, onRemove }: {
    item: WishlistItem;
    settings: any;
    policies: any;
    onRemove: (id: number) => void;
}) {
    const cart = useCartStore();
    const [productData, setProductData] = useState<ProductFull | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(true);

    // Ref to each color button so we can center it
    const colorItemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
    const colorStripRef = useRef<HTMLDivElement>(null);

    const buyNowStyle = settings?.pc_buynow_style || 'text_only';
    const cartStyle = settings?.pc_cart_style || 'hidden';
    const borderRadius = settings?.pc_border_radius || 'rounded';
    const bgColor = settings?.pc_bg_color || '#ffffff';

    const imgRadiusClass = borderRadius === 'square' ? 'rounded-none' : borderRadius === 'pill' ? 'rounded-[1.75rem]' : 'rounded-xl';
    const cardRadiusClass = borderRadius === 'square' ? 'rounded-none' : borderRadius === 'pill' ? 'rounded-[2rem]' : 'rounded-2xl';

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    const sanitize = (url: string | null | undefined): string | null => {
        if (!url) return null;
        let p = url.replace(backendUrl, '').replace('http://localhost:8000', '').replace('http://127.0.0.1:8000', '');
        return p.startsWith('/') ? p : `/${p}`;
    };

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        fetch(`${apiUrl}/products/${item.slug}`)
            .then(r => r.json())
            .then(d => {
                const data: ProductFull = d.data;
                setProductData(data);
                const vs: ProductVariant[] = data?.variants || [];
                const firstColor = vs[0]?.attributes.find(a => a.name === 'Color');
                if (firstColor) {
                    setSelectedColor(firstColor.value);
                    const firstImg = data.images?.find(i => i.color_id !== null);
                    if (firstImg) setSelectedColorId(firstImg.color_id);
                }
                const firstSize = vs[0]?.attributes.find(a => a.name === 'Size');
                if (firstSize) setSelectedSize(firstSize.value);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [item.slug]);

    const variants: ProductVariant[] = productData?.variants || [];

    const colors = (() => {
        const map = new Map<string, { value: string; meta: string | null; colorId: number | null }>();
        variants.forEach(v => {
            const attr = v.attributes.find(a => a.name === 'Color');
            if (attr && !map.has(attr.value)) {
                map.set(attr.value, { value: attr.value, meta: attr.meta, colorId: null });
            }
        });
        // Try to attach colorId from images
        productData?.images?.forEach(img => {
            if (img.color_id !== null) {
                // We can't perfectly match without a join, so we attach the first colorId to the first color
                for (const [k, v] of map) {
                    if (v.colorId === null) { map.set(k, { ...v, colorId: img.color_id }); break; }
                }
            }
        });
        return Array.from(map.values());
    })();

    const sizes = [...new Set(
        variants.map(v => v.attributes.find(a => a.name === 'Size')?.value).filter(Boolean) as string[]
    )];

    const handleColorSelect = (value: string, colorId: number | null) => {
        setSelectedColor(value);
        setSelectedColorId(colorId);
        // Scroll that button to center
        setTimeout(() => {
            const btn = colorItemsRef.current.get(value);
            const strip = colorStripRef.current;
            if (btn && strip) {
                const btnLeft = btn.offsetLeft;
                const btnWidth = btn.offsetWidth;
                const stripWidth = strip.clientWidth;
                strip.scrollTo({ left: btnLeft - stripWidth / 2 + btnWidth / 2, behavior: 'smooth' });
            }
        }, 30);
    };

    const selectedVariant = variants.find(v => {
        const cMatch = !selectedColor || v.attributes.some(a => a.name === 'Color' && a.value === selectedColor);
        const sMatch = !selectedSize || v.attributes.some(a => a.name === 'Size' && a.value === selectedSize);
        return cMatch && sMatch;
    });

    const isSizeOos = (size: string) => {
        const m = variants.find(v =>
            (!selectedColor || v.attributes.some(a => a.name === 'Color' && a.value === selectedColor)) &&
            v.attributes.some(a => a.name === 'Size' && a.value === size)
        );
        return !m || m.stock === 0;
    };

    const isOos = !selectedVariant || selectedVariant.stock === 0;

    const displayImage = (() => {
        if (productData?.images && selectedColorId !== null) {
            const colorImg = productData.images.find(i => i.color_id === selectedColorId);
            if (colorImg) return sanitize(colorImg.url);
        }
        return sanitize(item.image);
    })();

    const displayPrice = selectedVariant?.price ?? item.price;
    const displayMrp = selectedVariant?.mrp ?? item.mrp;
    const couponPrice = productData?.coupon_price;

    const handleAddToCart = () => {
        if (!selectedVariant || isOos) return;
        cart.addItem({
            skuId: selectedVariant.id, productId: item.productId, name: item.name, slug: item.slug,
            variant: [selectedColor, selectedSize].filter(Boolean).join(' - '),
            price: selectedVariant.price, 
            mrp: Math.max(Number(selectedVariant.mrp) || 0, Number(productData?.mrp) || 0, Number(selectedVariant.price)),
            image: displayImage || item.image || '', quantity: 1,
            tax_class: productData?.tax_class
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (!selectedVariant || isOos) return;
        handleAddToCart();
        window.location.href = '/cart';
    };

    const formattedDate = new Date(item.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className={`${cardRadiusClass} border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.07)] transition-all duration-300 overflow-hidden flex flex-col group`} style={{ backgroundColor: bgColor }}>

            {/* Image */}
            <Link href={`/product/${item.slug}`} className={`relative block aspect-[4/5] bg-gray-50 overflow-hidden ${imgRadiusClass} m-3 shrink-0`}>
                {displayImage ? (
                    <Image src={displayImage} alt={item.name} fill unoptimized className="object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><Package className="w-10 h-10" /></div>
                )}
                {isOos && !loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-gray-900 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Out of Stock</span>
                    </div>
                )}
            </Link>

            {/* Body */}
            <div className="flex-1 flex flex-col px-4 pb-4 gap-2">

                {/* Brand + Name */}
                <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{item.brand || item.category}</span>
                    <Link href={`/product/${item.slug}`}>
                        <h3 className="text-sm font-medium text-gray-900 mt-0.5 line-clamp-2 hover:text-gray-600 transition-colors leading-snug">{item.name}</h3>
                    </Link>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-extrabold text-gray-900">{formatPrice(displayPrice)}</span>
                    {displayMrp > displayPrice && <span className="text-xs text-gray-400 line-through">{formatPrice(displayMrp)}</span>}
                    {item.discount_percentage > 0 && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded ml-auto">{item.discount_percentage}% OFF</span>
                    )}
                </div>

                {/* Magic Deal */}
                {couponPrice && couponPrice < displayPrice && (
                    <MagicDealBadge couponPrice={couponPrice} policies={policies} />
                )}

                {/* ── Color Row ── */}
                {!loading && colors.length > 0 && (
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Color</p>
                        <HScrollRow>
                            {colors.map(c => (
                                <button
                                    key={c.value}
                                    title={c.value}
                                    ref={el => { if (el) colorItemsRef.current.set(c.value, el); }}
                                    onClick={() => handleColorSelect(c.value, c.colorId)}
                                    className={`shrink-0 w-5 h-5 rounded-full border-2 transition-all ${selectedColor === c.value ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:border-gray-300'}`}
                                    style={{ backgroundColor: c.meta || '#ccc' }}
                                />
                            ))}
                        </HScrollRow>
                    </div>
                )}

                {/* ── Size Row ── */}
                {!loading && sizes.length > 0 && (
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Size</p>
                        <HScrollRow>
                            {sizes.map(s => {
                                const oos = isSizeOos(s);
                                return (
                                    <button
                                        key={s}
                                        onClick={() => !oos && setSelectedSize(s)}
                                        className={`shrink-0 relative px-2 py-0.5 text-[10px] font-bold rounded border transition-all
                                            ${oos ? 'border-gray-100 text-gray-300 cursor-not-allowed' : ''}
                                            ${!oos && selectedSize === s ? 'border-gray-900 bg-gray-900 text-white' : ''}
                                            ${!oos && selectedSize !== s ? 'border-gray-200 text-gray-600 hover:border-gray-400' : ''}`}
                                    >
                                        {oos && (
                                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="w-full h-px bg-gray-300 rotate-[-20deg] absolute" />
                                            </span>
                                        )}
                                        {s}
                                    </button>
                                );
                            })}
                        </HScrollRow>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="space-y-1.5">
                        <div className="flex gap-1.5">{[1, 2, 3].map(i => <div key={i} className="h-5 w-5 rounded-full bg-gray-100 animate-pulse shrink-0" />)}</div>
                        <div className="flex gap-1.5">{[1, 2, 3, 4].map(i => <div key={i} className="h-5 w-7 rounded bg-gray-100 animate-pulse shrink-0" />)}</div>
                    </div>
                )}

                <div className="flex-1" />

                {/* Added date */}
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <CalendarDays className="w-3 h-3 shrink-0" />
                    Added {formattedDate}
                </div>

                {/* CTA buttons */}
                <div className="flex gap-1.5">
                    {buyNowStyle !== 'hidden' && (
                        <button onClick={handleBuyNow} disabled={isOos}
                            className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wide py-2.5 rounded-xl transition-all
                                ${isOos ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'}`}>
                            {(buyNowStyle === 'icon_only' || buyNowStyle === 'text_icon') && <Zap className="w-3 h-3 shrink-0" />}
                            {buyNowStyle !== 'icon_only' && <span>{isOos ? 'OOS' : 'Buy Now'}</span>}
                        </button>
                    )}
                    {cartStyle !== 'hidden' && (
                        <button onClick={handleAddToCart} disabled={isOos}
                            className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wide py-2.5 rounded-xl border transition-all
                                ${isOos ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed' : 'border-gray-200 bg-white text-gray-800 hover:border-gray-900 active:scale-[0.98]'}`}>
                            {(cartStyle === 'icon_only' || cartStyle === 'text_icon') && <ShoppingCart className="w-3 h-3 shrink-0" />}
                            {cartStyle !== 'icon_only' && <span>{added ? '✓ Added' : 'Add to Cart'}</span>}
                        </button>
                    )}
                    {cartStyle === 'hidden' && buyNowStyle === 'hidden' && (
                        <button onClick={handleAddToCart} disabled={isOos}
                            className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-bold uppercase py-2.5 rounded-xl border transition-all
                                ${isOos ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-800 hover:border-gray-900 active:scale-[0.98]'}`}>
                            <ShoppingCart className="w-3 h-3" />
                            <span>{added ? '✓ Added' : 'Move to Cart'}</span>
                        </button>
                    )}
                </div>

                {/* View Details + Remove */}
                <div className="flex items-center justify-between pt-0.5">
                    <Link href={`/product/${item.slug}`} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 font-semibold transition-colors">
                        <ExternalLink className="w-3 h-3" /> View Details
                    </Link>
                    <button onClick={() => onRemove(item.productId)} className="text-[11px] text-gray-400 hover:text-red-500 font-medium transition-colors">
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function WishlistPage() {
    const { items, removeItem, clearWishlist } = useWishlistStore();
    const { user } = useAuthStore();
    const { openAuthModal } = useUIStore();
    const settings = useSettings();
    const [mounted, setMounted] = useState(false);
    const [policies, setPolicies] = useState<any>({});

    const authAppearance = typeof settings?.auth_appearance === 'string'
        ? JSON.parse(settings.auth_appearance)
        : (settings?.auth_appearance || {});
    const isModalMode = authAppearance.ux_mode === 'modal';

    useEffect(() => {
        setMounted(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        fetch(`${apiUrl}/settings`).then(r => r.json()).then(d => setPolicies(d.policies || {})).catch(() => { });
    }, []);

    if (!mounted) return <div className="min-h-[60vh]" />;

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                        <Heart className="w-10 h-10 text-red-400 fill-red-200" />
                    </div>
                    <div className="absolute -inset-3 rounded-full border-2 border-red-100 animate-ping opacity-30" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Your Wishlist Awaits</h1>
                <p className="text-gray-500 text-sm text-center max-w-xs mb-8 leading-relaxed">Sign in to save your favourite products and access them anytime.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    {isModalMode ? (
                        <button onClick={() => openAuthModal('login')} className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
                            Sign In <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <Link href="/login" className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
                            Sign In <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                    <Link href="/shop" className="flex items-center gap-2 border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold text-sm hover:border-gray-400 transition-all">
                        <ShoppingBag className="w-4 h-4" /> Browse Shop
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
                <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-8 border border-gray-100">
                    <Heart className="w-10 h-10 text-gray-300" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Wishlist is Empty</h1>
                <p className="text-gray-500 text-sm text-center max-w-xs mb-8">Looks like you haven't added anything yet.</p>
                <Link href="/shop" className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
                    <ShoppingBag className="w-4 h-4" /> Explore Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Wishlist</h1>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-400 fill-red-300" />
                        {items.length} {items.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
                <button onClick={() => { if (confirm('Clear all items?')) clearWishlist(); }}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 font-bold uppercase tracking-wider border border-gray-200 hover:border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {items.map(item => (
                    <WishlistCard key={item.productId} item={item} settings={settings} policies={policies} onRemove={removeItem} />
                ))}
            </div>
        </div>
    );
}
