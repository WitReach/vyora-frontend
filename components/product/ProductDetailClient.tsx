'use client';

import { ProductDetail, Variant } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, ChevronDown, ChevronUp, X, Ruler, Zap } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// ── Coupon chip with copy feedback ──────────────────────────────────────────
function CouponChip({ code, parentTextColor, parentSubtextColor }: { code: string; parentTextColor?: string; parentSubtextColor?: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={copy}
            className="shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg px-2.5 py-1.5 transition-all group"
            title={`Copy ${code}`}
            style={{ borderColor: `${parentTextColor || '#ffffff'}30` }}
        >
            <span style={{ color: parentTextColor || '#ffffff' }} className="font-black text-[11px] tracking-widest font-mono uppercase">{code}</span>
            <span style={{ color: parentSubtextColor || '#c7d2fe' }} className="text-[9px] group-hover:text-white transition-colors">
                {copied ? '✓' : '⎘'}
            </span>
        </button>
    );
}


export default function ProductDetailClient({ product, policies = {}, coupons = [] }: { product: ProductDetail; policies?: Record<string, string>; coupons?: any[] }) {
    // 1. Sanitize image URLs → always resolve to a local /storage/... path served by Next.js public/
    //    Gallery images come back as bare relative paths (e.g. "storage/products/...")
    //    Master images come back as full URLs (e.g. "http://127.0.0.1:8000/storage/...")
    //    Either way, we strip the backend origin and normalise to an absolute path starting with "/"
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    const sanitizeUrl = (url: string | null | undefined): string | null => {
        if (!url) return null;
        // Strip known backend origins first (handles full URLs)
        let path = url
            .replace(backendUrl, '')
            .replace('http://localhost:8000', '')
            .replace('http://127.0.0.1:8000', '');
        // Ensure leading slash (bare relative paths like "storage/..." are missing it)
        if (!path.startsWith('/')) path = `/${path}`;
        return path;
    };

    const cleanMasterImage = sanitizeUrl(product.image);
    const cleanMasterVideo = sanitizeUrl(product.video);

    // De-duplicate images based on URL in case Master was also uploaded to gallery
    const uniqueImages = useMemo(() => {
        const map = new Map();
        if (cleanMasterVideo) {
            map.set(cleanMasterVideo, { id: 'master_video', url: cleanMasterVideo, color_id: null });
        }
        if (cleanMasterImage) {
            map.set(cleanMasterImage, { id: 'master_image', url: cleanMasterImage, color_id: null });
        }
        product.images?.forEach(img => {
            const sanitized = sanitizeUrl(img.url);
            if (sanitized && !map.has(sanitized)) {
                map.set(sanitized, { ...img, url: sanitized });
            }
        });
        return Array.from(map.values());
    }, [product.image, product.video, product.images]);

    // 2. Parse Variants & Attributes
    const colors = useMemo(() => {
        const all = new Map();
        product.variants.forEach(v => {
            const c = v.attributes.find(a => a.name === 'Color');
            // Store entire attribute JSON string via Map mapping
            if (c && !all.has(c.value)) all.set(c.value, c);
        });
        return Array.from(all.values());
    }, [product.variants]);

    const sizes = useMemo(() => {
        const all = new Set<string>();
        product.variants.forEach(v => {
            const s = v.attributes.find(a => a.name === 'Size');
            if (s) all.add(s.value);
        });

        const availableInChart = (product.size_chart?.measurements as any)?.rows?.map((r: any) => r.size_code.toUpperCase()) || null;

        // Simplistic order mapping: XS, S, M, L, XL, XXL
        const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
        return Array.from(all)
            .filter(size => {
                // If no size chart, show all sizes. If size chart exists, only show sizes in that chart.
                return !availableInChart || availableInChart.includes(size.toUpperCase());
            })
            .sort((a, b) => {
                let iA = order.indexOf(a.toUpperCase());
                let iB = order.indexOf(b.toUpperCase());
                return (iA !== -1 ? iA : 99) - (iB !== -1 ? iB : 99);
            });
    }, [product.variants, product.size_chart]);

    // Handle selecting a size first (if no color is picked, find one that has this size)
    const handleSizeSelect = (size: string) => {
        if (!selectedColor) {
            // Find first color that has this size in stock
            const firstGoodColor = product.variants.find(v =>
                v.attributes.find(a => a.name === 'Size')?.value === size &&
                v.stock > 0
            )?.attributes.find(a => a.name === 'Color')?.value;

            if (firstGoodColor) {
                setSelectedColor(firstGoodColor);
            }
        }
        setSelectedSize(size);
    };

    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [pincode, setPincode] = useState('');

    // Dynamic Filter Engine: Renders all images on load, tightly filters by matching Attribute Value ID on Color Select
    const displayedImages = useMemo(() => {
        if (!selectedColor) return uniqueImages;
        const colorObj = colors.find(c => c.value === selectedColor);
        if (!colorObj || !colorObj.id) return uniqueImages;

        const filtered = uniqueImages.filter(img => img.color_id && img.color_id.toString() === colorObj.id.toString());
        // Fallback to all images strictly if no gallery images were uploaded mapping to this color
        return filtered.length > 0 ? filtered : uniqueImages;
    }, [uniqueImages, selectedColor, colors]);

    // Accordion & drawer states
    const [openAccordion, setOpenAccordion] = useState<string | null>('description');
    const [showSizeChart, setShowSizeChart] = useState(false);
    const [sizeChartTab, setSizeChartTab] = useState<'chart' | 'measure'>('chart');

    // For the size chart drawer: get the active color image
    const activeColorImage = useMemo(() => {
        if (!selectedColor) return displayedImages[0] || null;
        const colorObj = colors.find(c => c.value === selectedColor);
        if (!colorObj) return displayedImages[0] || null;
        return uniqueImages.find(img => img.color_id && img.color_id.toString() === colorObj.id?.toString()) || displayedImages[0] || null;
    }, [selectedColor, colors, uniqueImages, displayedImages]);

    const sizeChartRows = useMemo(() => {
        const rows = (product.size_chart?.measurements as any)?.rows || [];
        const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'];

        return [...rows].sort((a: any, b: any) => {
            let iA = order.indexOf(a.size_code.toUpperCase());
            let iB = order.indexOf(b.size_code.toUpperCase());
            return (iA !== -1 ? iA : 99) - (iB !== -1 ? iB : 99);
        });
    }, [product.size_chart]);

    const sizeChartHeaders = useMemo(() => {
        return (product.size_chart?.measurements as any)?.headers || [];
    }, [product.size_chart]);

    const currentVariant = useMemo(() => {
        if (!selectedColor || !selectedSize) return null;
        return product.variants.find(v =>
            v.attributes.find(a => a.name === 'Color')?.value === selectedColor &&
            v.attributes.find(a => a.name === 'Size')?.value === selectedSize
        );
    }, [selectedColor, selectedSize, product.variants]);

    const cart = useCartStore();

    function addToCart() {
        if (!currentVariant) return alert('Please select a size first.');
        cart.addItem({
            skuId: currentVariant.id,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            variant: `${selectedColor} - ${selectedSize}`,
            price: currentVariant.price,
            mrp: Math.max(Number(currentVariant.mrp) || 0, Number(product.mrp) || 0, Number(currentVariant.price)),
            image: cleanMasterImage || '',
            quantity: 1,
            tax_class: product.tax_class
        });
        alert("Added to cart!");
    }

    return (
        <>
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 grid grid-cols-1 md:grid-cols-12 gap-y-10 md:gap-x-8 lg:gap-x-12">
                {/* LEFT COLUMN: Media Gallery */}
                <div className="md:col-span-7">
                    {/* Desktop Masonry Grid (Hidden on Mobile) */}
                    <div className="hidden md:grid grid-cols-2 gap-1 sm:gap-2">
                        {displayedImages.map((img, idx) => (
                            <div key={img.id || idx} className={cn(
                                "relative bg-gray-50 overflow-hidden",
                                idx === 0 && !selectedColor ? "col-span-2 md:h-[calc(100vh-4rem)]" : "col-span-1 aspect-[3/4]"
                            )}>
                                {img.url.match(/\.(mp4|webm|mov|qt)$/i) ? (
                                    <video
                                        src={img.url}
                                        className={cn(idx === 0 && !selectedColor ? "object-contain" : "object-cover", "object-center w-full h-full absolute inset-0")}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <Image
                                        src={img.url}
                                        alt={`${product.name} view ${idx + 1}`}
                                        fill
                                        className={cn(idx === 0 && !selectedColor ? "object-contain" : "object-cover", "object-center")}
                                        priority={idx < 2}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Mobile Slider (Hidden on Desktop) */}
                    <div className="md:hidden block">
                        <Swiper
                            modules={[Pagination]}
                            pagination={{ clickable: true }}
                            spaceBetween={0}
                            slidesPerView={1}
                            className="w-full aspect-[4/5] sm:rounded-xl overflow-hidden shadow-sm"
                        >
                            {displayedImages.map((img, idx) => (
                                <SwiperSlide key={img.id || idx} className="relative w-full h-full bg-gray-50">
                                    {img.url.match(/\.(mp4|webm|mov|qt)$/i) ? (
                                        <video src={img.url} className="w-full h-full object-cover object-center absolute inset-0" autoPlay loop muted playsInline />
                                    ) : (
                                        <Image src={img.url} alt={`${product.name} view ${idx + 1}`} fill className="object-cover object-center" priority={idx === 0} />
                                    )}
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>

                {/* RIGHT COLUMN: Product Details (Sticky scrolling on Desktop) */}
                <div className="md:col-span-5 relative px-0 md:px-4 lg:px-8 xl:pr-16 pt-8 md:pt-12">
                    <div className="md:sticky md:top-24 space-y-8 pb-12">
                        {/* 1-3. Metadata Header */}
                        <div>
                            {product.brand && (
                                <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">{product.brand}</h2>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-heading font-medium text-gray-900 mb-3 leading-tight">{product.name}</h1>
                            <div className="flex items-center gap-2">
                                <div className="flex text-black">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <span className="text-sm font-medium text-gray-500 underline cursor-pointer hover:text-gray-900 decoration-1 underline-offset-4">124 Reviews</span>
                            </div>
                            {product.short_description && (
                                <div className="mt-3 text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.short_description }} />
                            )}
                        </div>

                        <hr className="border-gray-200" />

                        {/* 4-5. Pricing Grid */}
                        <div>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-heading font-extrabold text-gray-900 leading-none">
                                    {formatPrice(currentVariant ? currentVariant.price : product.price)}
                                </span>
                                {((currentVariant?.mrp || product.mrp) > (currentVariant?.price || product.price)) && (
                                    <div className="flex items-center gap-3 pb-0.5">
                                        <span className="text-lg font-medium text-gray-400 line-through leading-none">
                                            {formatPrice(currentVariant ? currentVariant.mrp : product.mrp)}
                                        </span>
                                        <span className="text-xs font-black bg-red-50 text-red-600 px-2 py-1 rounded-md tracking-wide">
                                            {product.discount_percentage}% OFF
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-3 font-semibold tracking-wide uppercase">Inclusive of all taxes and shipping</p>
                        </div>

                        {/* MEGA DEAL CARD */}
                        {coupons.length > 0 && (
                            <div className="bg-[#2c2c2c] rounded-2xl p-4 flex flex-col gap-4 shadow-xl border border-gray-700/50">
                                {[...coupons].sort((a, b) => {
                                    const sellingPrice = currentVariant?.price ?? product.price;
                                    const getDiscount = (c: any) => {
                                        if (c.type === 'percentage') {
                                            const savings = (sellingPrice * parseFloat(c.discount_amount)) / 100;
                                            return c.max_discount_amount ? Math.min(savings, parseFloat(c.max_discount_amount)) : savings;
                                        }
                                        if (c.type === 'fixed') return Math.min(parseFloat(c.discount_amount), sellingPrice);
                                        return 0;
                                    };
                                    return getDiscount(b) - getDiscount(a);
                                }).map((coupon: any) => {
                                    const sellingPrice = currentVariant?.price ?? product.price;
                                    let discountedPrice: number | null = null;
                                    let savingsValue = 0;
                                    let savingsLabel = '';

                                    if (coupon.type === 'percentage' && coupon.discount_amount) {
                                        savingsValue = (sellingPrice * parseFloat(coupon.discount_amount)) / 100;
                                        if (coupon.max_discount_amount && savingsValue > parseFloat(coupon.max_discount_amount)) {
                                            savingsValue = parseFloat(coupon.max_discount_amount);
                                        }
                                        discountedPrice = sellingPrice - savingsValue;
                                        savingsLabel = `${coupon.discount_amount}% off (${formatPrice(savingsValue)} saved)`;
                                    } else if (coupon.type === 'fixed' && coupon.discount_amount) {
                                        savingsValue = Math.min(parseFloat(coupon.discount_amount), sellingPrice);
                                        discountedPrice = sellingPrice - savingsValue;
                                        savingsLabel = `Flat ${formatPrice(savingsValue)} off`;
                                    } else if (coupon.type === 'free_shipping') {
                                        savingsLabel = 'Free Shipping';
                                        discountedPrice = sellingPrice;
                                    } else if (coupon.type === 'bogo' && coupon.bogo_buy_qty && coupon.bogo_get_qty) {
                                        savingsLabel = `Buy ${coupon.bogo_buy_qty} Get ${coupon.bogo_get_qty} Free`;
                                        discountedPrice = sellingPrice;
                                    }

                                    return (
                                        <div key={coupon.id} className="flex items-center justify-between group">
                                            <div className="flex items-start gap-3">
                                                <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                            Dope Deal
                                                        </span>
                                                        {discountedPrice !== null && (
                                                            <span className="text-base font-bold text-white">
                                                                Get at {formatPrice(discountedPrice)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-xs font-semibold text-indigo-300">
                                                            {savingsLabel}
                                                        </span>
                                                        {coupon.is_default_magic && (
                                                            <span className="text-[10px] text-gray-300 flex items-center gap-1 before:content-['·'] before:mr-1">
                                                                ✨ Pre-Applied
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: code chip */}
                                            <CouponChip code={coupon.code} parentTextColor="#e5e7eb" parentSubtextColor="#9ca3af" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 6. Color Selection Swatches */}
                        {colors.length > 0 && (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900">Color Variant: <span className="text-gray-500 font-normal">{selectedColor}</span></h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {colors.map((color: any) => {
                                        // Map color id dynamically back to first matching image uploaded against it via native mapping!
                                        const matchingImg = uniqueImages.find(img => img.color_id && img.color_id.toString() === color.id?.toString()) || uniqueImages[0];
                                        return (
                                            <button
                                                key={color.value}
                                                onClick={() => setSelectedColor(selectedColor === color.value ? null : color.value)}
                                                className={cn(
                                                    "relative w-[4.5rem] h-[5.5rem] rounded-xl overflow-hidden transition-all group outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black",
                                                    selectedColor === color.value ? "ring-2 ring-offset-2 ring-black shadow-lg scale-105" : "border-2 border-transparent hover:border-gray-300 opacity-80 hover:opacity-100"
                                                )}
                                            >
                                                {matchingImg.url.match(/\.(mp4|webm|mov|qt)$/i) ? (
                                                    <video src={matchingImg.url} className="w-full h-full object-cover absolute inset-0" autoPlay loop muted playsInline />
                                                ) : (
                                                    <Image src={matchingImg.url} alt={color.value} fill className="object-cover" />
                                                )}
                                                {/* Hover Tooltip Overlay mapped over visually */}
                                                <span className="absolute inset-x-0 bottom-0 bg-black/60 pt-6 pb-1 flex items-center justify-center text-[9px] text-white font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity uppercase z-10 text-center leading-none">
                                                    {color.value}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 7-8. Size Selection */}
                        {sizes.length > 0 && (
                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900">Select Size</h3>
                                    <button onClick={() => setShowSizeChart(true)} className="text-xs font-bold text-gray-500 underline uppercase tracking-wider hover:text-black transition-colors underline-offset-4 flex items-center gap-1"><Ruler className="w-3 h-3" /> Size Chart</button>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {sizes.map(size => {
                                        const isAvailable = product.variants.some(v =>
                                            (selectedColor ? v.attributes.find(a => a.name === 'Color')?.value === selectedColor : true) &&
                                            v.attributes.find(a => a.name === 'Size')?.value === size &&
                                            v.stock > 0
                                        );
                                        return (
                                            <button
                                                key={size}
                                                onClick={() => handleSizeSelect(size)}
                                                disabled={!isAvailable}
                                                className={cn(
                                                    "w-[calc(25%-7.5px)] sm:w-16 py-3.5 flex items-center justify-center bg-white border rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black",
                                                    selectedSize === size
                                                        ? "border-black bg-black text-white shadow-md transform scale-[1.02]"
                                                        : isAvailable
                                                            ? "border-gray-200 text-gray-900 hover:border-black hover:bg-gray-50"
                                                            : "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50 relative overflow-hidden"
                                                )}
                                            >
                                                {size}
                                                {!isAvailable && (
                                                    <span className="absolute w-full border-t border-gray-300 -rotate-[35deg]" style={{ top: '50%', left: '0' }} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 9. Commerce Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6">
                            <button
                                onClick={addToCart}
                                className="flex-1 bg-black text-white py-4 px-2 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors shadow-xl shadow-black/20 active:scale-[0.98] outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                Buy It Now
                            </button>
                            <div className="flex gap-3 flex-1">
                                <button
                                    onClick={addToCart}
                                    disabled={!currentVariant || currentVariant.stock <= 0}
                                    className="flex-1 bg-white border-2 border-black text-black py-4 px-2 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed active:scale-[0.98] outline-none"
                                >
                                    {currentVariant ? (currentVariant.stock > 0 ? "Add to Cart" : "Out of Stock") : "Add to Cart"}
                                </button>
                                <button className="w-14 sm:w-16 shrink-0 flex items-center justify-center border-2 border-gray-200 text-gray-500 rounded-xl hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all active:scale-95 outline-none">
                                    <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>

                        {/* 10. Delivery Pincode */}
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3 mt-8">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                                <Truck className="w-4 h-4" />
                                <span>Check Delivery Setup</span>
                            </div>
                            <div className="flex shadow-sm rounded-lg overflow-hidden">
                                <input
                                    type="text"
                                    placeholder="Enter PIN Code"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    className="flex-1 bg-white border border-gray-200 border-r-0 px-4 py-3 text-sm focus:outline-none focus:bg-gray-50 transition-colors font-medium text-gray-900"
                                />
                                <button className="bg-black text-white px-6 font-bold text-xs tracking-widest hover:bg-gray-800 transition-colors active:scale-95 origin-right">
                                    CHECK
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium">Please enter PIN code to check delivery time & Pay on Delivery availability.</p>
                        </div>

                        {/* 11-14. Accordions */}
                        <div className="border-t border-gray-200 mt-10 divide-y divide-gray-100">
                            {/* Description */}
                            <div className="py-2">
                                <button onClick={() => setOpenAccordion(openAccordion === 'description' ? null : 'description')} className="flex w-full items-center justify-between py-4 font-bold text-gray-900 group outline-none">
                                    <span className="uppercase tracking-widest text-sm">Product Description</span>
                                    {openAccordion === 'description' ? <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" /> : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />}
                                </button>
                                <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", openAccordion === 'description' ? "max-h-[2000px] opacity-100 pb-4" : "max-h-0 opacity-0")}>
                                    <div className="text-sm text-gray-500 leading-relaxed bg-white">
                                        {product.long_description
                                            ? <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.long_description }} />
                                            : <p>Premium quality guarantees unmatched durability and comfort. Built identically to exact specifications required for luxury wear. This product maps perfectly to modern street aesthetics.</p>
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Shipping & Returns — live from Policy Settings */}
                            <div className="py-2">
                                <button onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')} className="flex w-full items-center justify-between py-4 font-bold text-gray-900 group outline-none">
                                    <span className="uppercase tracking-widest text-sm">Shipping & Returns</span>
                                    {openAccordion === 'shipping' ? <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" /> : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />}
                                </button>
                                <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", openAccordion === 'shipping' ? "max-h-[1200px] opacity-100 pb-4" : "max-h-0 opacity-0")}>
                                    <div className="text-sm text-gray-600 space-y-4 leading-relaxed">
                                        {/* Shipping charges */}
                                        <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100 space-y-2">
                                            {(policies.cod_charges || policies.prepaid_charges || policies.delivery_timeline) ? (
                                                <>
                                                    {policies.cod_charges && <div className="flex items-center gap-3"><Truck className="w-4 h-4 text-black shrink-0" /><span><strong>COD:</strong> {policies.cod_charges}</span></div>}
                                                    {policies.prepaid_charges && <div className="flex items-center gap-3"><ShoppingBag className="w-4 h-4 text-black shrink-0" /><span><strong>Prepaid:</strong> {policies.prepaid_charges}</span></div>}
                                                    {policies.delivery_timeline && <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-black shrink-0" /><span><strong>Delivery:</strong> {policies.delivery_timeline}</span></div>}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex gap-3"><Truck className="w-5 h-5 text-black shrink-0" /><p>Free shipping on all prepaid orders across the nation.</p></div>
                                                    <div className="flex gap-3"><ShoppingBag className="w-5 h-5 text-black shrink-0" /><p>Dispatch within 24–48 business hours.</p></div>
                                                    <div className="flex gap-3"><ShieldCheck className="w-5 h-5 text-black shrink-0" /><p>Hassle-free returns & exchanges supported.</p></div>
                                                </>
                                            )}
                                        </div>
                                        {/* Returns */}
                                        {policies.return_policy && (
                                            <div>
                                                <h3 className="text-base font-bold uppercase tracking-widest text-black mb-2">Returns</h3>
                                                <div dangerouslySetInnerHTML={{ __html: policies.return_policy }} />
                                            </div>
                                        )}
                                        {/* Exchanges */}
                                        {policies.exchange_policy && (
                                            <div>
                                                <h3 className="text-base font-bold uppercase tracking-widest text-black mb-2">Exchanges</h3>
                                                <div dangerouslySetInnerHTML={{ __html: policies.exchange_policy }} />
                                            </div>
                                        )}
                                        {/* Refund Method */}
                                        {policies.refund_method && (
                                            <div className="pt-2 border-t border-gray-100 mt-2">
                                                <h3 className="text-base font-bold uppercase tracking-widest text-black mb-1">Refund Method</h3>
                                                <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: policies.refund_method }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Extra policy sections — from JSON array set in Admin → Policy Settings */}
                            {(() => {
                                try {
                                    const sections: { heading: string; content: string }[] =
                                        JSON.parse(policies.extra_sections || '[]');
                                    return sections.map((sec, i) =>
                                        sec.heading ? (
                                            <div key={i} className="py-2">
                                                <button
                                                    onClick={() => setOpenAccordion(openAccordion === `extra-${i}` ? null : `extra-${i}`)}
                                                    className="flex w-full items-center justify-between py-4 font-bold text-gray-900 group outline-none"
                                                >
                                                    <span className="uppercase tracking-widest text-sm">{sec.heading}</span>
                                                    {openAccordion === `extra-${i}`
                                                        ? <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                                        : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />}
                                                </button>
                                                <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", openAccordion === `extra-${i}` ? "max-h-[1200px] opacity-100 pb-4" : "max-h-0 opacity-0")}>
                                                    <div className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: sec.content }} />
                                                </div>
                                            </div>
                                        ) : null
                                    );
                                } catch { return null; }
                            })()}
                        </div>

                        {/* 17. Security Footer */}
                        <div className="flex flex-wrap items-center justify-between pt-8 pb-12 border-t border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-widest gap-4">
                            <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded text-black"><ShieldCheck className="w-4 h-4" /> 100% Original</div>
                            <span>SKU: {currentVariant ? currentVariant.code : 'SELECT'}</span>
                            {product.category && <span>Cat: {product.category}</span>}
                        </div>

                    </div>
                </div>
            </div>

            {/* ─── SIZE CHART OFF-CANVAS DRAWER ─────────────────────────── */}
            {/* Backdrop */}
            <div
                onClick={() => setShowSizeChart(false)}
                className={cn(
                    "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
                    showSizeChart ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            />
            {/* Panel */}
            <div className={cn(
                "fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
                showSizeChart ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Close */}
                <button
                    onClick={() => setShowSizeChart(false)}
                    className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Product Summary Header */}
                <div className="flex items-center gap-4 px-6 pt-14 pb-5 border-b border-gray-100">
                    {activeColorImage && (
                        <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-50">
                            {activeColorImage.url.match(/\.(mp4|webm|mov|qt)$/i) ? (
                                <video src={activeColorImage.url} className="w-full h-full object-cover absolute inset-0" autoPlay loop muted playsInline />
                            ) : (
                                <Image src={activeColorImage.url} alt={product.name} fill className="object-cover" />
                            )}
                        </div>
                    )}
                    <div className="min-w-0">
                        {product.brand && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{product.brand}</p>}
                        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{product.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-base font-extrabold text-gray-900">{formatPrice(product.price)}</span>
                            {product.mrp > product.price && (
                                <>
                                    <span className="text-sm text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                                    <span className="text-xs font-bold text-green-600">{product.discount_percentage}% OFF</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 shrink-0">
                    <button
                        onClick={() => setSizeChartTab('chart')}
                        className={cn(
                            "flex-1 py-3.5 text-sm font-bold tracking-wide transition-colors",
                            sizeChartTab === 'chart' ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-gray-700"
                        )}
                    >Size Chart</button>
                    <button
                        onClick={() => setSizeChartTab('measure')}
                        className={cn(
                            "flex-1 py-3.5 text-sm font-bold tracking-wide transition-colors",
                            sizeChartTab === 'measure' ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-gray-700"
                        )}
                    >How to Measure</button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {sizeChartTab === 'chart' ? (
                        <div className="p-4">
                            <p className="text-right text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Measurements table (Inches)</p>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full text-sm text-center">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                            <th className="py-3 px-3 text-left">Size</th>
                                            {sizeChartHeaders.map((header: string) => (
                                                <th key={header} className="py-3 px-3">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sizeChartRows.length > 0 ? sizeChartRows.map((row: any) => {
                                            const isSelected = selectedSize?.toUpperCase() === row.size_code?.toUpperCase();
                                            const isAvailable = sizes.some(s => s.toUpperCase() === row.size_code?.toUpperCase());
                                            return (
                                                <tr
                                                    key={row.size_code}
                                                    onClick={() => isAvailable && handleSizeSelect(sizes.find(s => s.toUpperCase() === row.size_code.toUpperCase()) || row.size_code)}
                                                    className={cn(
                                                        "transition-colors text-xs sm:text-sm",
                                                        isSelected
                                                            ? "bg-black text-white cursor-pointer hover:bg-gray-900"
                                                            : isAvailable
                                                                ? "cursor-pointer hover:bg-gray-50"
                                                                : "opacity-30 cursor-not-allowed"
                                                    )}
                                                >
                                                    <td className="py-3.5 px-3 font-bold text-left whitespace-nowrap">
                                                        <span className={cn("flex items-center gap-2")}>
                                                            <span className={cn(
                                                                "w-4 h-4 rounded-full border-2 inline-block shrink-0",
                                                                isSelected ? "border-white bg-white" : "border-gray-300"
                                                            )} />
                                                            {row.size_name || row.size_code}
                                                        </span>
                                                    </td>
                                                    {sizeChartHeaders.map((header: string) => (
                                                        <td key={header} className="py-3.5 px-3">
                                                            {row.measurements[header] || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={sizeChartHeaders.length + 1} className="py-8 text-center text-gray-400 italic">No measurement data available.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-3">* Measurements table in Inches</p>

                            {/* Color Selection inside drawer */}
                            <div className="mt-10 border-t border-gray-100 pt-6">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Select Color</p>
                                <div className="flex flex-wrap gap-4">
                                    {colors.map((color: any) => (
                                        <div key={color.value} className="relative group">
                                            <button
                                                onClick={() => setSelectedColor(color.value)}
                                                className={cn(
                                                    "w-10 h-10 rounded-full border-2 transition-all p-0.5",
                                                    selectedColor === color.value ? "border-black scale-110 shadow-md" : "border-transparent hover:border-gray-200"
                                                )}
                                            >
                                                <div
                                                    className="w-full h-full rounded-full shadow-inner border border-gray-100"
                                                    style={{ backgroundColor: color.meta || '#ccc' }}
                                                />
                                            </button>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                                {color.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6 text-sm text-gray-600 leading-relaxed">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">How to measure yourself</h4>
                                <p>Use a soft measuring tape and take measurements over light clothing for the most accurate fit.</p>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Bust', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
                                    { label: 'Waist', desc: 'Measure around your natural waistline, the narrowest part of your torso.' },
                                    { label: 'Hips', desc: 'Measure around the fullest part of your hips, about 8 inches below your waist.' },
                                    { label: 'Length', desc: 'Measure from the highest point of your shoulder down to where you want the garment to end.' },
                                    { label: 'Shoulder', desc: 'Measure from the edge of one shoulder to the edge of the other, across the back.' },
                                ].map(item => (
                                    <div key={item.label} className="flex gap-3">
                                        <span className="font-bold text-gray-900 w-16 shrink-0">{item.label}</span>
                                        <span>{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer Actions */}
                <div className="shrink-0 p-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <button
                        onClick={() => { addToCart(); setShowSizeChart(false); }}
                        className="flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors active:scale-[0.98]"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Bag
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-800 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:border-gray-400 transition-colors active:scale-[0.98]">
                        <Heart className="w-4 h-4" />
                        Wishlist
                    </button>
                </div>
            </div>
            {/* ──────────────────────────────────────────────────────────── */}
        </>
    );
}
