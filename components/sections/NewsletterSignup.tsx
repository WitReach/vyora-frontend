"use client";

import { useState } from 'react';

export default function NewsletterSignup({ data, isFluid, sectionBg }: { data: any; isFluid?: boolean; sectionBg?: string }) {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const isDark = data?.bg_style === 'dark';
    const hasBgImage = data?.bg_style === 'image' && data?.bg_image;
    const sectionStyle = sectionBg ? { backgroundColor: sectionBg } : {};

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        setSubmitted(true);
        setLoading(false);
    };

    return (
        <section
            className="relative w-full py-20 md:py-28 overflow-hidden"
            style={hasBgImage || sectionBg ? {} : { backgroundColor: isDark ? '#111111' : '#f9fafb' }}
        >
            {sectionBg && <div className="absolute inset-0" style={{ backgroundColor: sectionBg }} />}
            {hasBgImage && (
                <>
                    <img src={data.bg_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50" />
                </>
            )}
            {!hasBgImage && !sectionBg && (
                <div className="absolute inset-0" style={{ backgroundColor: isDark ? '#111111' : '#f9fafb' }} />
            )}

            <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
                {data?.title && (
                    <h2 className={`text-4xl md:text-5xl font-black tracking-tight mb-4 ${isDark || hasBgImage ? 'text-white' : 'text-gray-900'}`}>
                        {data.title}
                    </h2>
                )}
                {data?.description && (
                    <p className={`text-lg mb-10 leading-relaxed ${isDark || hasBgImage ? 'text-white/70' : 'text-gray-500'}`}>
                        {data.description}
                    </p>
                )}
                {submitted ? (
                    <p className={`text-xl font-bold ${isDark || hasBgImage ? 'text-white' : 'text-[var(--primary)]'}`}>
                        🎉 You're in! Thanks for subscribing.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={data?.placeholder || 'Enter your email'}
                            className="flex-1 px-5 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-gray-900 text-sm bg-white"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-[var(--primary)] text-[var(--secondary)] font-bold rounded-full hover:opacity-90 transition-opacity text-sm shrink-0 disabled:opacity-60"
                        >
                            {loading ? '...' : (data?.button_text || 'Subscribe')}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
