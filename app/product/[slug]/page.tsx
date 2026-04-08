import { ProductDetail } from "@/types";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic'; // Never cache — always fetch fresh from API

// Fetch product data
async function getProduct(slug: string): Promise<ProductDetail | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch (e) {
        return null;
    }
}

// Fetch global policy settings
async function getPolicies(): Promise<Record<string, string>> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
            cache: 'no-store'
        });
        if (!res.ok) return {};
        const json = await res.json();
        return json.policies ?? {};
    } catch (e) {
        return {};
    }
}

// Fetch active public coupons (show_on_product_page = true)
async function getProductCoupons(): Promise<any[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/public`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.product_coupons ?? [];
    } catch (e) {
        return [];
    }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;

    // Fetch product + policies + coupons in parallel
    const [product, policies, coupons] = await Promise.all([
        getProduct(resolvedParams.slug),
        getPolicies(),
        getProductCoupons(),
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div className="w-full pb-12">
            <ProductDetailClient product={product} policies={policies} coupons={coupons} />
        </div>
    );
}
