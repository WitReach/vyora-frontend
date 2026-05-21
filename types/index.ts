export interface ProductList {
    id: number;
    name: string;
    slug: string;
    brand: string | null;
    price: number;
    price_formatted: string;
    mrp: number;
    discount_percentage: number;
    image: string | null;
    video?: string | null;
    category: string;
    is_new: boolean;
    hover_image?: string | null;
    coupon_price?: number;
}

export interface ProductDetail extends ProductList {
    short_description: string;
    long_description: string | null;
    product_type: string;
    categories: { id: number; name: string; slug: string }[];
    images: { id: number; url: string; is_primary: boolean; color_id: number | null }[];
    variants: Variant[];
    seo: { title: string; description: string };
    size_chart: {
        id: number;
        name: string;
        description: string;
        measurements: any[];
    } | null;
    tax_class?: string;
}

export interface Variant {
    id: number;
    code: string;
    price: number;
    mrp: number;
    stock: number;
    attributes: { name: string; value: string; code: string; meta: string | null }[];
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}
