"use client";

import { ProductList } from "@/types";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useSettings } from "@/contexts/SettingsContext";

export function ProductCard({ product }: { product: ProductList }) {
    const settings = useSettings();

    // Pull configuration (or use sane defaults matching your brand)
    const cardStyle = settings?.pc_style || 'lift'; // 'outline', 'solid', 'lift'
    const bgColor = settings?.pc_bg_color || '#ffffff';
    const borderRadius = settings?.pc_border_radius || 'rounded'; // 'square', 'rounded', 'pill'
    const shadowInt = settings?.pc_shadow || 'soft'; // 'none', 'soft', 'strong'
    // Pull per-button styles from settings (new keys)
    // Fallback gracefully for stores using old settings
    const buyNowStyle  = settings?.pc_buynow_style  || (settings?.pc_btn_layout === 'icon_only' ? 'icon_only' : settings?.pc_btn_layout === 'both' ? 'text_icon' : 'text_only');
    const cartStyle    = settings?.pc_cart_style    || 'hidden';
    const wishlistStyle = settings?.pc_wishlist_style || (settings?.pc_show_wishlist === 'false' ? 'hidden' : 'icon_only');

    const imageAspect = settings?.pc_image_aspect || 'aspect-[4/5]';

    // Build classes based on config
    let cardClasses = "group block transition-all duration-300 relative border overflow-hidden ";
    
    // Border Radius
    if (borderRadius === 'square') cardClasses += "rounded-none ";
    else if (borderRadius === 'pill') cardClasses += "rounded-[2rem] ";
    else cardClasses += "rounded-2xl ";

    // Border / Outline style
    if (cardStyle === 'outline') cardClasses += "border-gray-200 ";
    else cardClasses += "border-gray-100 ";

    // Shadow mapping
    if (cardStyle === 'lift') {
        if (shadowInt === 'soft') cardClasses += "shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 ";
        else if (shadowInt === 'strong') cardClasses += "shadow-lg hover:shadow-2xl hover:-translate-y-1.5 ";
        else cardClasses += "hover:-translate-y-1 "; // no shadow, just lift
    } else {
        // Solid or Outline don't lift by default, but can have static shadows
        if (shadowInt === 'soft') cardClasses += "shadow-sm hover:shadow ";
        else if (shadowInt === 'strong') cardClasses += "shadow-md hover:shadow-lg ";
    }

    // Inner wrapper radius adjusting for outer card radius
    const imgRadiusClass = borderRadius === 'square' ? 'rounded-none' 
                         : borderRadius === 'pill' ? 'rounded-[1.75rem]' 
                         : 'rounded-xl';

    return (
        <div className={cardClasses} style={{ backgroundColor: bgColor }}>
            <div className={`p-3 h-full flex flex-col`}>
                {/* Image Wrapper (Clickable) */}
                <Link href={`/product/${product.slug}`} className={`block relative ${imageAspect} bg-gray-50 overflow-hidden ${imgRadiusClass} cursor-pointer`}>
                    {product.image ? (
                        <>
                            {/* Main Default Image */}
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                unoptimized
                                className={`object-cover object-center transition-all duration-500 ease-out ${product.hover_image ? 'group-hover:opacity-0 group-hover:scale-[1.03]' : 'group-hover:scale-[1.03]'}`}
                            />
                            {/* Reveal Hover Variation Image */}
                            {product.hover_image && (
                                <Image
                                    src={product.hover_image}
                                    alt={`${product.name} alternate view`}
                                    fill
                                    unoptimized
                                    className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500 ease-out"
                                />
                            )}
                            {/* Soft inner shadow/gradient overlay for premium feel */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${imgRadiusClass}`} />
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50">No Image</div>
                    )}

                    {product.is_new && (
                        <span className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md text-white border border-primary/20 text-[10px] px-2.5 py-1 font-bold rounded-full uppercase tracking-wider shadow-sm shadow-primary/20 z-10">
                            New
                        </span>
                    )}
                </Link>

                {/* Text and Actions Wrapper */}
                <div className="mt-4 px-1 pb-1 flex flex-col gap-1 flex-grow">
                    {/* Brand Name */}
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                        {product.brand || product.category}
                    </span>
                    
                    {/* Product Name (Clickable) */}
                    <Link href={`/product/${product.slug}`} className="block cursor-pointer">
                        <h3 className="text-sm font-heading font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Pricing Grid */}
                    <div className="flex items-center gap-2 mt-1">
                        {/* Smashed grey MRP */}
                        {product.mrp > product.price && (
                            <span className="text-xs text-gray-400 font-medium line-through">
                                {formatPrice(product.mrp)}
                            </span>
                        )}
                        {/* Bold Sales Price */}
                        <span className="text-base font-heading font-extrabold text-gray-900 shrink-0">
                            {formatPrice(product.price)}
                        </span>
                        {/* Discount Badge */}
                        {product.discount_percentage > 0 && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded ml-auto">
                                {product.discount_percentage}% OFF
                            </span>
                        )}
                    </div>

                    {/* Conditional Coupon Logic */}
                    {product.coupon_price && (
                        <div className="text-[11px] text-gray-500 mt-1 font-medium bg-green-50/50 p-1.5 rounded-md border border-green-100/50">
                            Best Price <span className="text-green-700 font-bold">{formatPrice(product.coupon_price)}</span> with coupon
                        </div>
                    )}

                    <div className="flex-grow"></div>

                    {/* Call To Actions */}
                    {(buyNowStyle !== 'hidden' || cartStyle !== 'hidden' || wishlistStyle !== 'hidden') && (
                        <div className="flex items-center gap-2 mt-3 pt-2">

                            {/* Buy Now */}
                            {buyNowStyle !== 'hidden' && (
                                <button className="flex-1 flex items-center justify-center gap-1.5 bg-black text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm focus:ring-2 focus:ring-offset-1 focus:ring-black cursor-pointer">
                                    {(buyNowStyle === 'icon_only' || buyNowStyle === 'text_icon') && (
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    )}
                                    {buyNowStyle !== 'icon_only' && <span>Buy Now</span>}
                                </button>
                            )}

                            {/* Add to Cart */}
                            {cartStyle !== 'hidden' && (
                                <button className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 cursor-pointer">
                                    {(cartStyle === 'icon_only' || cartStyle === 'text_icon') && (
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    )}
                                    {cartStyle !== 'icon_only' && <span>Add to Cart</span>}
                                </button>
                            )}

                            {/* Wishlist */}
                            {wishlistStyle !== 'hidden' && (
                                <button
                                    className={`flex shrink-0 items-center justify-center gap-1.5 border border-gray-200 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all active:scale-95 cursor-pointer ${wishlistStyle === 'icon_only' ? 'w-9 h-9' : 'flex-1 py-2.5 px-3'}`}
                                    aria-label="Add to Wishlist"
                                >
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {wishlistStyle !== 'icon_only' && <span className="text-xs font-bold uppercase tracking-wider">Wishlist</span>}
                                </button>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

