import Link from 'next/link';

export default function HorizontalScrollCards({ data, isFluid }: { data: any; isFluid?: boolean }) {
    if (!data?.cards || data.cards.length === 0) return null;

    const enableHoverZoom = data.hover_animation !== 'none';

    return (
        <section className="py-12 md:py-16">
            {data.title && (
                <div className={`px-4 md:px-8 mb-8 md:mb-10${isFluid ? '' : ' max-w-7xl mx-auto'}`}>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {data.title}
                    </h2>
                </div>
            )}

            {/* Scroll container — bleeds to screen edges on mobile for full-bleed feel */}
            <div className="flex overflow-x-auto pb-6 snap-x snap-mandatory gap-4 md:gap-6 px-4 md:px-8 scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                {data.cards.map((card: any, idx: number) => (
                    <div
                        key={idx}
                        className="snap-start shrink-0 w-[72vw] sm:w-[44vw] md:w-[320px] lg:w-[360px] flex flex-col group/card bg-transparent"
                    >
                        {/* Portrait image — tall ratio like reference */}
                        {card.image && (
                            <div className="w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '3/4' }}>
                                <img
                                    src={card.image}
                                    alt={card.headline || 'Card image'}
                                    className={`w-full h-full object-cover ${enableHoverZoom ? 'group-hover/card:scale-105 transition-transform duration-500' : ''}`}
                                />
                            </div>
                        )}

                        {/* Text content below image — clean and editorial */}
                        <div className="pt-4 flex flex-col gap-2 flex-1">
                            {card.headline && (
                                <h3 className="text-base font-extrabold tracking-wide uppercase" style={{ color: 'var(--primary)' }}>
                                    {card.headline}
                                </h3>
                            )}
                            {card.paragraph && (
                                <p className="text-sm leading-relaxed text-gray-600">
                                    {card.paragraph}
                                </p>
                            )}
                            {card.cta_text && card.cta_link && (
                                <div className="mt-2">
                                    <Link
                                        href={card.cta_link}
                                        className="text-sm font-bold uppercase tracking-wider underline underline-offset-4 hover:opacity-60 transition-opacity"
                                        style={{ color: 'var(--primary)' }}
                                    >
                                        {card.cta_text}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
