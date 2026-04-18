'use client';

import Link from 'next/link';
import { ShoppingBag, User, LogOut, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui';

export default function Navbar({ settings }: { settings?: any }) {
    const cart = useCartStore();
    const { user, logout } = useAuthStore();
    const { openAuthModal } = useUIStore();
    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const isMegaMenu = settings?.navbar_style === 'mega_menu';
    const isCustom = settings?.navbar_style === 'custom';
    
    // Custom settings
    const alignment = settings?.nav_alignment || 'left';
    const position = settings?.nav_position || 'inline';
    let menuItems = [];
    try {
        if (settings?.menu_structure) {
            menuItems = JSON.parse(settings.menu_structure);
        }
    } catch(e) {}

    useEffect(() => {
        setMounted(true);
        if (isMegaMenu) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
            fetch(`${apiUrl}/categories`)
                .then(res => res.json())
                .then(data => setCategories(data))
                .catch(err => console.error("Failed to load categories", err));
        }
    }, [isMegaMenu]);

    if (!mounted) return <nav className="h-16 border-b" />;

    const storeName = settings?.store_name || "DOPE STYLE";
    const logoRelPath = settings?.main_logo;

    const authAppearance = typeof settings?.auth_appearance === 'string' 
        ? JSON.parse(settings.auth_appearance) 
        : (settings?.auth_appearance || {});
    const isModalMode = authAppearance.ux_mode === 'modal';

    // Alignment classes based on setting
    let alignmentClasses = "flex items-center space-x-6";
    if (alignment === 'center') alignmentClasses = "flex items-center justify-center space-x-6 flex-1";
    if (alignment === 'right') alignmentClasses = "flex items-center justify-end space-x-6 flex-1";

    const hoverStyle = settings?.nav_hover_style || 'none';

    // Generates isolated pseudo-classes for exact hover accuracy without bubbling!
    const getHoverClasses = (isChild = false) => {
        if (hoverStyle === 'none') return '';
        const bottomPos = isChild ? 'before:bottom-0' : 'before:bottom-2';
        
        if (hoverStyle === 'underline') {
            return `before:absolute ${bottomPos} before:left-0 before:w-full before:h-[2px] before:bg-black before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`;
        }
        if (hoverStyle === 'left_to_right') {
            return `before:absolute ${bottomPos} before:left-0 before:w-0 before:h-[2px] before:bg-black hover:before:w-full before:transition-all before:duration-300 before:ease-out`;
        }
        return '';
    };

    const renderDynamicLink = (item: any, isChild = false) => {
        let href = '/shop';
        if (item.type === 'link') href = item.link || '/';
        if (item.type === 'category') href = `/shop?category=${item.ref_id}`;
        if (item.type === 'collection') href = `/shop?collection=${item.ref_id}`;
        if (item.type === 'page') href = `/${item.ref_id}`;

        if (item.type === 'image') {
            return (
                <Link href={item.link || '/shop'} className="block w-full group/promo">
                    <div className="w-full bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100 overflow-hidden relative cursor-pointer">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.label || 'Promo'} className="w-full h-auto object-cover" />
                        ) : (
                            <div className="w-full aspect-[4/5] flex flex-col items-center justify-center p-4 text-center">
                                <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-1">Promo</span>
                                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                            </div>
                        )}
                        {item.label && (
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none">
                                <span className="text-sm font-bold text-white block">{item.label}</span>
                            </div>
                        )}
                    </div>
                </Link>
            );
        }

        const className = isChild 
            ? `text-sm text-gray-500 hover:text-black transition-colors py-1 w-fit relative block ${getHoverClasses(true)}`
            : `text-sm font-medium hover:text-gray-600 flex items-center gap-1 py-5 relative ${getHoverClasses(false)}`;

        return (
            <Link href={href} className={className}>
                {item.label}
            </Link>
        );
    };

    const DynamicNavItems = () => {
        if (!isCustom) return null;

        return (
            <>
                {menuItems.map((item: any) => (
                    <div key={item.id} className="group hidden md:block">
                        {item.type === 'mega_menu' ? (
                            <>
                                        {item.root_type && item.root_type !== '' ? (
                                            <Link href={
                                                item.root_type === 'url' ? (item.root_url || '#') :
                                                item.root_type === 'category' ? `/shop?category=${item.root_ref_id}` :
                                                item.root_type === 'collection' ? `/shop?collection=${item.root_ref_id}` :
                                                item.root_type === 'page' ? `/${item.root_ref_id}` : '#'
                                            } className={`cursor-pointer text-sm font-medium hover:text-gray-600 flex items-center gap-1 py-5 relative ${getHoverClasses(false)}`}>
                                                {item.label} <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />
                                            </Link>
                                        ) : (
                                            <div className={`cursor-pointer text-sm font-medium hover:text-gray-600 flex items-center gap-1 py-5 relative ${getHoverClasses(false)}`}>
                                                {item.label} <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />
                                            </div>
                                        )}
                                <div className="absolute left-0 top-full mt-0 w-full bg-white border-b border-t shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top -translate-y-2 group-hover:translate-y-0 z-[100]">
                                    <div className="max-w-7xl mx-auto px-4 py-8">
                                        {/* tailwind scanner safelist: grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-5 grid-cols-6 */}
                                        <div className={`grid gap-8 grid-cols-${item.columns || 4} items-start`}>
                                            {item.layout_columns?.map((col: any) => (
                                                <div key={col.id || Math.random()} className="flex flex-col gap-6">
                                                    {col.blocks?.map((block: any) => (
                                                        <div key={block.id || Math.random()}>
                                                            {block.type === 'image' ? (
                                                                renderDynamicLink(block, true)
                                                            ) : (
                                                                <div>
                                                                    {block.label && (
                                                                        <div className="border-b border-gray-100 pb-2 mb-3">
                                                                            {block.link ? (
                                                                                <Link href={block.link} className="text-sm font-black text-gray-900 uppercase tracking-wide hover:text-black">
                                                                                    {block.label}
                                                                                </Link>
                                                                            ) : (
                                                                                <span className="text-sm font-black text-gray-900 uppercase tracking-wide">{block.label}</span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {block.links && block.links.length > 0 && (
                                                                        <ul className="space-y-1.5">
                                                                            {block.links.map((link: any) => (
                                                                                <li key={link.id || Math.random()}>
                                                                                    {renderDynamicLink(link, true)}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            renderDynamicLink(item)
                        )}
                    </div>
                ))}
            </>
        );
    };

    const ActionsComponent = () => (
        <div className="flex items-center space-x-6 ml-auto shrink-0">
            {user ? (
                <div className="flex items-center space-x-4">
                    <Link href="/orders" className="text-sm font-medium hover:text-gray-600">
                        My Orders
                    </Link>
                    <button onClick={logout} className="text-sm text-red-500 hover:text-red-600">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                isModalMode ? (
                    <button 
                        onClick={() => openAuthModal('login')}
                        className="text-sm font-medium hover:text-gray-600 flex items-center gap-1"
                    >
                        <User className="w-4 h-4" /> Sign In
                    </button>
                ) : (
                    <Link href="/login" className="text-sm font-medium hover:text-gray-600 flex items-center gap-1">
                        <User className="w-4 h-4" /> Sign In
                    </Link>
                )
            )}

            <Link href="/cart" className="relative text-gray-900 hover:text-gray-600">
                <ShoppingBag className="w-5 h-5" />
                {cart.items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                        {cart.items.length}
                    </span>
                )}
            </Link>
        </div>
    );

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm">
            {/* Top Bar / Inline Position */}
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    {logoRelPath ? (
                        <img src={`/${logoRelPath}`} alt={storeName} className="h-8 w-auto object-contain" />
                    ) : (
                        <span className="text-xl font-bold tracking-tighter" style={{ fontFamily: 'var(--font-heading)' }}>
                            {storeName}
                        </span>
                    )}
                </Link>

                {/* Inline Nav Links */}
                {position === 'inline' && (
                    <div className={alignmentClasses}>
                        {isMegaMenu && (
                            <>
                                {categories.map((cat) => (
                                    <div key={cat.id} className="group hidden md:block">
                                        <Link href={`/shop?category=${cat.slug}`} className="text-sm font-medium hover:text-gray-600 flex items-center gap-1 py-5">
                                            {cat.name} {cat.children && cat.children.length > 0 && <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />}
                                        </Link>
                                        
                                        {/* Mega Menu Dropdown */}
                                        {cat.children && cat.children.length > 0 && (
                                            <div className="absolute left-0 top-[64px] w-full bg-white border-b border-t shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top -translate-y-2 group-hover:translate-y-0 z-[100]">
                                                <div className="max-w-7xl mx-auto px-4 py-8">
                                                    <div className="flex gap-16">
                                                        <div className="flex-1 grid grid-cols-3 gap-8">
                                                            {cat.children.map((sub: any) => (
                                                                <div key={sub.id}>
                                                                    <Link href={`/shop?category=${sub.slug}`} className="text-sm font-bold text-gray-900 border-b pb-2 mb-3 block hover:text-gray-600 uppercase tracking-wide">
                                                                        {sub.name}
                                                                    </Link>
                                                                    {sub.children && sub.children.length > 0 && (
                                                                        <ul className="space-y-2.5 mt-4">
                                                                            {sub.children.map((deep: any) => (
                                                                                <li key={deep.id}>
                                                                                    <Link href={`/shop?category=${deep.slug}`} className="text-sm text-gray-600 hover:text-black transition-colors block font-medium">
                                                                                        {deep.name}
                                                                                    </Link>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {isCustom && <DynamicNavItems />}

                        {!isMegaMenu && !isCustom && (
                            <Link href="/shop" className="text-sm font-medium hover:text-gray-600 py-5">
                                Shop
                            </Link>
                        )}
                    </div>
                )}

                <ActionsComponent />
            </div>

            {/* Below Nav Position */}
            {position === 'below' && isCustom && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className={`flex items-center ${alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center'} space-x-8 relative`}>
                            <DynamicNavItems />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
