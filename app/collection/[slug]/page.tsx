import { ProductListing } from '@/components/product/ProductListing';

export default async function CollectionPage({ params }: { params: { slug: string } }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    
    const title = slug.split('-').join(' ');

    return (
        <ProductListing 
            title={title} 
            queryKey="collection" 
            queryValue={slug} 
        />
    );
}
