"use client";

export default function TextBlock({ data, isFluid }: { data: any; isFluid?: boolean }) {
    if (!data.content) return null;

    return (
        <section className="py-12 bg-white">
            <div
                className={`${isFluid ? 'w-full' : 'container mx-auto'} px-4 prose max-w-4xl`}
                dangerouslySetInnerHTML={{ __html: data.content }}
            />
        </section>
    );
}
