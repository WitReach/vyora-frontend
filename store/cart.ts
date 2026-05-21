import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    skuId: number;
    productId: number;
    name: string;
    slug: string;
    variant: string; // "Black - L"
    price: number;
    mrp?: number;
    image: string;
    quantity: number;
    tax_class?: string;
    colorName?: string;
    colorHex?: string;
    sizeName?: string;
    size?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (skuId: number) => void;
    updateQuantity: (skuId: number, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
    appliedCoupon: { code: string; discountAmount: number } | null;
    setAppliedCoupon: (coupon: { code: string; discountAmount: number } | null) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            appliedCoupon: null,

            setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),

            addItem: (newItem) => set((state) => {
                const existing = state.items.find(i => i.skuId === newItem.skuId);
                if (existing) {
                    return {
                        items: state.items.map(i =>
                            i.skuId === newItem.skuId
                                ? { ...i, quantity: i.quantity + newItem.quantity, price: newItem.price, mrp: newItem.mrp }
                                : i
                        )
                    };
                }
                return { items: [...state.items, newItem] };
            }),

            removeItem: (skuId) => set((state) => ({
                items: state.items.filter(i => i.skuId !== skuId)
            })),

            updateQuantity: (skuId, quantity) => set((state) => ({
                items: state.items.map(i =>
                    i.skuId === skuId ? { ...i, quantity } : i
                )
            })),

            clearCart: () => set({ items: [], appliedCoupon: null }),

            total: () => {
                return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }
        }),
        {
            name: 'dope-cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
