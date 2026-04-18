import { ProductListing } from '@/components/product/ProductListing';

export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const resolvedParams = await searchParams;
    const category = resolvedParams.category as string;
    const collection = resolvedParams.collection as string;

    return (
        <ProductListing 
            title={category || collection || "All Products"} 
            baseEndpoint="/api/products" 
        />
    );
}
