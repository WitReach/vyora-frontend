"use client";

import Link from 'next/link';

export default function VideoBanner({ data, isFluid, sectionBg }: { data: any; isFluid?: boolean; sectionBg?: string }) {
    if (!data?.video_url) return null;

    const heightMap: any = { small: 'h-[40vh]', medium: 'h-[60vh]', large: 'h-[80vh]', fullscreen: 'h-screen' };
    const heightClass = heightMap[data.height || 'medium'] || 'h-[60vh]';
    const overlayOpacity = data.overlay_opacity ? Number(data.overlay_opacity) / 100 : 0.4;

    return (
        <section className={`relative w-full overflow-hidden ${heightClass}`}>
            <video
                src={data.video_url}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />

            {(data.title || data.subtitle || data.cta_text) && (
                <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
                    <div className="text-center text-white max-w-4xl">
                        {data.title && (
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 drop-shadow-lg leading-tight">
                                {data.title}
                            </h2>
                        )}
                        {data.subtitle && (
                            <p className="text-lg md:text-xl mb-10 opacity-90 drop-shadow-md">{data.subtitle}</p>
                        )}
                        {data.cta_text && data.cta_link && (
                            <Link
                                href={data.cta_link}
                                className="inline-block px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors text-base"
                            >
                                {data.cta_text}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
