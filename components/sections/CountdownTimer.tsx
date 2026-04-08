"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

function useCountdown(endDate: string) {
    const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

    useEffect(() => {
        const calc = () => {
            const diff = new Date(endDate).getTime() - Date.now();
            if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }); return; }
            setTime({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
                expired: false,
            });
        };
        calc();
        const t = setInterval(calc, 1000);
        return () => clearInterval(t);
    }, [endDate]);

    return time;
}

export default function CountdownTimer({ data, isFluid, sectionBg }: { data: any; isFluid?: boolean; sectionBg?: string }) {
    const time = useCountdown(data?.end_date || '');
    if (!data?.end_date || time.expired) return null;

    const isDark = data?.bg_style === 'dark';
    const bg = sectionBg || (isDark ? '#111111' : '#ffffff');
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const mutedColor = isDark ? 'text-white/50' : 'text-gray-400';
    const boxBg = isDark ? 'bg-white/10' : 'bg-gray-50 border border-gray-100';

    const pad = (n: number) => String(n).padStart(2, '0');
    const units = [
        { label: 'Days', value: pad(time.days) },
        { label: 'Hours', value: pad(time.hours) },
        { label: 'Mins', value: pad(time.minutes) },
        { label: 'Secs', value: pad(time.seconds) },
    ];

    return (
        <section className="py-16 md:py-20 w-full" style={{ backgroundColor: bg }}>
            <div className="max-w-3xl mx-auto px-4 text-center">
                {data.title && (
                    <h2 className={`text-3xl md:text-5xl font-black tracking-tight mb-3 ${textColor}`}>{data.title}</h2>
                )}
                {data.description && (
                    <p className={`text-base md:text-lg mb-10 ${mutedColor}`}>{data.description}</p>
                )}
                <div className="flex items-center justify-center gap-3 md:gap-6 mb-10">
                    {units.map(u => (
                        <div key={u.label} className="flex flex-col items-center">
                            <div className={`${boxBg} rounded-2xl px-5 py-4 md:px-8 md:py-6 min-w-[70px] md:min-w-[110px]`}>
                                <span className={`text-4xl md:text-6xl font-black tabular-nums ${textColor}`}>{u.value}</span>
                            </div>
                            <span className={`text-xs font-semibold uppercase tracking-widest mt-2 ${mutedColor}`}>{u.label}</span>
                        </div>
                    ))}
                </div>
                {data.cta_text && data.cta_link && (
                    <Link
                        href={data.cta_link}
                        className={`inline-block px-10 py-4 rounded-full font-bold transition-opacity hover:opacity-90 ${isDark ? 'bg-white text-black' : 'bg-[var(--primary)] text-[var(--secondary)]'}`}
                    >
                        {data.cta_text}
                    </Link>
                )}
            </div>
        </section>
    );
}
