import { ProductListing } from '@/components/product/ProductListing';
import api from '@/lib/api';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
    // Actually, in app router, 'params' is a Promise in Latest Next.js versions (15+).
    // Let's await it to be safe.
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    
    // Convert slug to a human readable title for the header
    const title = slug.split('-').join(' ');

    return (
        <ProductListing 
            title={title} 
            queryKey="category" 
            queryValue={slug} 
        />
    );
}
