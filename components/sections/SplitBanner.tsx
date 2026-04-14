import Link from 'next/link';

export default function SplitBanner({ data, isFluid, sectionBg }: { data: any; isFluid?: boolean; sectionBg?: string }) {
    if (!data?.image && !data?.title) return null;

    const imageOnRight = data.image_side === 'right';
    const fitClass = data.object_fit === 'contain' ? 'object-contain' : 'object-cover';
    const textBg = sectionBg || data.text_bg || data.text_bg_color || '#ffffff';

    const textSide = (
        <div
            className="flex flex-col justify-center px-8 py-14 md:px-16 md:py-20"
            style={{ backgroundColor: textBg }}
        >
            {data.badge && (
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-[var(--primary)] border border-[var(--primary)]/30 px-3 py-1 rounded-full mb-6 w-fit">
                    {data.badge}
                </span>
            )}
            {data.title && (
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight mb-4">
                    {data.title}
                </h2>
            )}
            {data.subtitle && (
                <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">{data.subtitle}</p>
            )}
            {data.cta_text && data.cta_link && (
                <Link
                    href={data.cta_link}
                    className="inline-flex items-center justify-center w-fit px-8 py-4 bg-[var(--primary)] text-[var(--secondary)] font-bold rounded-full hover:opacity-90 transition-opacity"
                >
                    {data.cta_text}
                </Link>
            )}
        </div>
    );

    const imageSide = (
        <div className="relative min-h-[380px] md:min-h-0 w-full">
            {data.image ? (
                <img src={data.image} alt={data.title || 'Banner'} className={`absolute inset-0 w-full h-full ${fitClass}`} />
            ) : (
                <div className="absolute inset-0 bg-gray-100" />
            )}
        </div>
    );

    return (
        <section className="w-full overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px] md:min-h-[580px]">
                {imageOnRight ? <>{textSide}{imageSide}</> : <>{imageSide}{textSide}</>}
            </div>
        </section>
    );
}
