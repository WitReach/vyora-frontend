import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WishlistItem {
    productId: number;
    name: string;
    slug: string;
    price: number;
    mrp: number;
    discount_percentage: number;
    image: string | null;
    video?: string | null;
    brand: string | null;
    category: string;
    addedAt: string; // ISO timestamp
}

interface WishlistState {
    items: WishlistItem[];
    addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
    removeItem: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (newItem) => set((state) => {
                const existing = state.items.find(i => i.productId === newItem.productId);
                if (existing) return state; // Already in wishlist
                return {
                    items: [{ ...newItem, addedAt: new Date().toISOString() }, ...state.items]
                };
            }),

            removeItem: (productId) => set((state) => ({
                items: state.items.filter(i => i.productId !== productId)
            })),

            isInWishlist: (productId) => {
                return get().items.some(i => i.productId === productId);
            },

            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'dope-wishlist-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
