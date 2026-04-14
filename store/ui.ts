import { create } from 'zustand';

type AuthView = 'login' | 'register';

interface UIState {
    isAuthModalOpen: boolean;
    authView: AuthView;
    openAuthModal: (view?: AuthView) => void;
    closeAuthModal: () => void;
    setAuthView: (view: AuthView) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isAuthModalOpen: false,
    authView: 'login',
    openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, authView: view }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),
    setAuthView: (view) => set({ authView: view }),
}));
