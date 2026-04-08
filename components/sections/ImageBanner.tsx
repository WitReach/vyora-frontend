import Link from 'next/link';

export default function ImageBanner({ data }: { data: any }) {
    if (!data?.image) return null;

    const fitClass: any = {
        cover: 'object-cover',
        contain: 'object-contain',
        fill: 'object-fill',
        auto: 'object-none'
    };
    
    const selectedFit = fitClass[data.object_fit || 'cover'] || 'object-cover';

    const positionClass: any = {
        center: 'absolute inset-0 flex items-center justify-center text-center px-4',
        bottom: 'absolute inset-x-0 bottom-0 p-8 pt-24 text-center bg-gradient-to-t from-black/80 to-transparent',
        top: 'absolute inset-x-0 top-0 p-8 pb-24 text-center bg-gradient-to-b from-black/80 to-transparent',
        below: 'relative p-8 text-center bg-white'
    };
    
    const selectedPosition = positionClass[data.text_position || 'center'] || positionClass.center;

    return (
        <section className="w-full relative">
            <div className={`w-full relative ${data.text_position === 'below' ? 'h-[500px]' : 'h-[500px] md:h-[600px] lg:h-[700px]'}`}>
                <img 
                    src={data.image} 
                    alt="Banner" 
                    className={`w-full h-full ${selectedFit}`}
                />
                
                {data.text && data.text_position !== 'below' && (
                    <div className={selectedPosition}>
                        <div className="max-w-3xl mx-auto">
                            <p className="text-white text-2xl md:text-5xl font-bold leading-tight drop-shadow-lg">
                                {data.text}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {data.text && data.text_position === 'below' && (
                <div className={selectedPosition}>
                    <div className="max-w-4xl mx-auto">
                        <p className="text-gray-900 text-xl md:text-3xl font-medium leading-relaxed">
                            {data.text}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
