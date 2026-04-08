"use client";

export default function AnnouncementMarquee({ data, isFluid, sectionBg }: { data: any; isFluid?: boolean; sectionBg?: string }) {
    if (!data?.items || data.items.length === 0) return null;

    const speed = data.speed === 'slow' ? '50s' : data.speed === 'fast' ? '18s' : '30s';
    const bg = sectionBg || data.bg_color || '#000000';
    const textColor = data.text_color || '#ffffff';
    // Triple items for seamless looping
    const looped = [...data.items, ...data.items, ...data.items];

    return (
        <div className="w-full overflow-hidden" style={{ backgroundColor: bg, color: textColor }}>
            <div className="flex py-3" style={{ animation: `marquee-scroll ${speed} linear infinite`, whiteSpace: 'nowrap' }}>
                {looped.map((item: any, idx: number) => (
                    <span key={idx} className="inline-flex items-center shrink-0">
                        {item.link ? (
                            <a href={item.link} className="text-sm font-semibold tracking-wide hover:opacity-70 transition-opacity px-8">
                                {item.text}
                            </a>
                        ) : (
                            <span className="text-sm font-semibold tracking-wide px-8">{item.text}</span>
                        )}
                        <span className="opacity-30 text-xs">·</span>
                    </span>
                ))}
            </div>
            <style>{`
                @keyframes marquee-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
            `}</style>
        </div>
    );
}
