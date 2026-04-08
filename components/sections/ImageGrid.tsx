import React from "react";
import Link from "next/link";

export default function ImageGrid({ data, isFluid }: { data: any; isFluid?: boolean }) {
    if (!data?.images || data.images.length === 0) return null;

    const columnClassMap: any = {
        '2': 'grid-cols-2 lg:grid-cols-2',
        '3': 'grid-cols-2 lg:grid-cols-3',
        '4': 'grid-cols-2 lg:grid-cols-4',
        '5': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
        '6': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    };
    
    const gridsClass = columnClassMap[data.columns || '4'] || 'grid-cols-2 lg:grid-cols-4';
    const enableHoverZoom = data.hover_animation !== 'none';
    const containerClass = isFluid ? 'py-12 md:py-16 px-4 md:px-8 w-full' : 'py-12 md:py-16 px-4 md:px-8 max-w-7xl mx-auto';

    return (
        <section className={containerClass}>
            {data.title && (
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-4">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{data.title}</h2>
                        {data.text && <p className="mt-4 text-gray-500 text-lg">{data.text}</p>}
                    </div>
                    {data.cta_text && data.cta_link && (
                        <Link href={data.cta_link} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[var(--secondary)] bg-[var(--primary)] hover:opacity-90 transition-opacity shrink-0">
                            {data.cta_text}
                        </Link>
                    )}
                </div>
            )}
            
            <div className={`grid gap-4 md:gap-6 ${gridsClass}`}>
                {data.images.map((item: any, idx: number) => {
                    const ctaStyle = item.cta_style || 'pill_overlay';
                    const targetAttr = item.target === '_blank' ? '_blank' : '_self';
                    const relAttr = item.target === '_blank' ? 'noopener noreferrer' : undefined;
                    const hasLink = !!item.link;

                    // The image block, with conditional overlays
                    const imageBlock = (
                        <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl group/card cursor-pointer bg-gray-100 shadow-sm border border-gray-100">
                            <img
                                src={item.image}
                                alt={item.alt || `Grid image ${idx + 1}`}
                                className={`w-full h-full object-cover ${enableHoverZoom ? 'group-hover/card:scale-105 transition-transform duration-500' : ''}`}
                            />
                            {/* Style 1: Pill overlay — shows pill button on hover */}
                            {item.cta_text && ctaStyle === 'pill_overlay' && (
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex justify-center items-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                                    <span className="inline-block px-5 py-2 bg-[var(--primary)] text-[var(--secondary)] font-bold rounded-full text-sm shadow-lg">
                                        {item.cta_text}
                                    </span>
                                </div>
                            )}
                            {/* Style 2: Full bar overlay — always visible, sticks to bottom */}
                            {item.cta_text && ctaStyle === 'bar_overlay' && (
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center py-3 px-4 bg-[var(--primary)]/90 backdrop-blur-sm">
                                    <span className="text-[var(--secondary)] font-bold text-sm tracking-wide">
                                        {item.cta_text}
                                    </span>
                                </div>
                            )}
                        </div>
                    );

                    // Wrapper that optionally wraps with a link
                    const wrapped = (children: React.ReactNode) => hasLink ? (
                        <Link href={item.link} className="block" target={targetAttr} rel={relAttr}>{children}</Link>
                    ) : (
                        <div className="block">{children}</div>
                    );

                    // Style 3 & 4 need a container wrapping image + element below
                    if (item.cta_text && (ctaStyle === 'below_button' || ctaStyle === 'underline_text')) {
                        const belowEl = ctaStyle === 'below_button' ? (
                            <div className="mt-3">
                                {hasLink ? (
                                    <Link
                                        href={item.link}
                                        target={targetAttr}
                                        rel={relAttr}
                                        className="block w-full text-center py-2.5 px-4 bg-[var(--primary)] text-[var(--secondary)] font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
                                    >
                                        {item.cta_text}
                                    </Link>
                                ) : (
                                    <span className="block w-full text-center py-2.5 px-4 bg-[var(--primary)] text-[var(--secondary)] font-bold rounded-xl text-sm">
                                        {item.cta_text}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="mt-2 text-center">
                                {hasLink ? (
                                    <Link
                                        href={item.link}
                                        target={targetAttr}
                                        rel={relAttr}
                                        className="text-sm font-semibold text-[var(--primary)] underline underline-offset-4 hover:opacity-70 transition-opacity"
                                    >
                                        {item.cta_text}
                                    </Link>
                                ) : (
                                    <span className="text-sm font-semibold text-[var(--primary)] underline underline-offset-4">
                                        {item.cta_text}
                                    </span>
                                )}
                            </div>
                        );

                        return (
                            <div key={idx} className="flex flex-col">
                                {wrapped(imageBlock)}
                                {belowEl}
                            </div>
                        );
                    }

                    return (
                        <div key={idx}>
                            {wrapped(imageBlock)}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
