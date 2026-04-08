export default function FeatureHighlights({ data, isFluid, sectionBg }: { data: any; isFluid?: boolean; sectionBg?: string }) {
    if (!data?.items || data.items.length === 0) return null;

    const containerClass = isFluid ? 'w-full px-4 md:px-8' : 'max-w-7xl mx-auto px-4 md:px-8';
    const count = data.items.length;
    const gridCols = count <= 2 ? 'grid-cols-2' : count === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4';
    
    // Fallback to text classes if no generic text format is specified
    const textColor = data.text_color || '#000000';
    const labelColor = data.text_color ? textColor : undefined;
    const descColor = data.text_color ? textColor : undefined;

    return (
        <section className="py-10 md:py-14 border-y border-gray-100" style={{ backgroundColor: sectionBg || '#ffffff' }}>
            <div className={containerClass}>
                <div className={`grid ${gridCols} gap-6 md:gap-10`}>
                    {data.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center text-center gap-3">
                            <span className="text-3xl md:text-4xl leading-none">{item.icon}</span>
                            <div>
                                <p className={`font-bold text-sm md:text-base ${labelColor ? '' : 'text-gray-900'}`} style={labelColor ? { color: labelColor } : undefined}>{item.label}</p>
                                {item.description && (
                                    <p className={`text-xs md:text-sm mt-1 leading-relaxed ${descColor ? 'opacity-80' : 'text-gray-500'}`} style={descColor ? { color: descColor } : undefined}>{item.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
