import Link from 'next/link';

export default function VerticalScrollCards({ data }: { data: any }) {
    if (!data?.cards || data.cards.length === 0) return null;

    return (
        <section className="py-12 md:py-16 px-4 md:px-8 max-w-7xl mx-auto">
            {data.title && (
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-8 md:mb-12">
                    {data.title}
                </h2>
            )}
            
            <div className="flex overflow-x-auto pb-8 space-x-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 px-2 -mx-2">
                {data.cards.map((card: any, idx: number) => (
                    <div key={idx} className="snap-center shrink-0 w-[85vw] md:w-[400px] bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        {card.image && (
                            <div className="w-full h-56 relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                <img src={card.image} alt={card.headline || 'Card image'} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="flex flex-col flex-1 whitespace-normal">
                            {card.headline && <h3 className="text-xl font-bold text-gray-900 mb-3">{card.headline}</h3>}
                            {card.paragraph && <p className="text-gray-600 text-base mb-6 leading-relaxed flex-1">{card.paragraph}</p>}
                            {card.cta_text && card.cta_link && (
                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <Link href={card.cta_link} className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors py-2">
                                        {card.cta_text}
                                        <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
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
