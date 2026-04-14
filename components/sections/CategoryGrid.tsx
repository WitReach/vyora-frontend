import Link from 'next/link';

export default function CategoryGrid({ data, isFluid, sectionBg }: { data: any; isFluid?: boolean; sectionBg?: string }) {
    const items = data?.categories || data?.items || [];
    if (items.length === 0) return null;

    const containerClass = isFluid ? 'w-full px-4 md:px-8' : 'max-w-7xl mx-auto px-4 md:px-8';
    const colMap: any = { '2': 'grid-cols-2', '3': 'grid-cols-2 md:grid-cols-3', '4': 'grid-cols-2 md:grid-cols-4' };
    const colClass = colMap[data.columns || '4'] || 'grid-cols-2 md:grid-cols-4';

    return (
        <section className="py-12 md:py-16" style={{ backgroundColor: sectionBg || '' }}>
            <div className={containerClass}>
                {data.title && (
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-8 md:mb-12">{data.title}</h2>
                )}
                <div className={`grid gap-4 md:gap-6 ${colClass}`}>
                    {items.map((item: any, idx: number) => (
                        <Link
                            key={idx}
                            href={item.link || '#'}
                            className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100 block"
                        >
                            {item.image && (
                                <img
                                    src={item.image}
                                    alt={item.name || `Category ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5 md:p-6">
                                <p className="text-white font-bold text-base md:text-xl tracking-tight">{item.name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
