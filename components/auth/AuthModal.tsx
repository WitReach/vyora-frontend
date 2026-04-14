'use client';

import { useUIStore } from '@/store/ui';
import { useSettings } from '@/contexts/SettingsContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AuthModal() {
    const { isAuthModalOpen, authView, closeAuthModal, setAuthView } = useUIStore();
    const settings = useSettings();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAuthModal();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeAuthModal]);

    if (!mounted || !isAuthModalOpen) return null;

    // Parse appearance for the card styling
    const parse = (val: any) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch { return {}; }
        }
        return val || {};
    };
    const authAppearance = parse(settings.auth_appearance);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={closeAuthModal}
            ></div>

            {/* Modal Card */}
            <div 
                className="relative w-full max-w-[440px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
                style={{ 
                    borderRadius: authAppearance.border_radius ? `${authAppearance.border_radius}px` : '24px',
                    borderColor: authAppearance.border_color,
                    borderWidth: authAppearance.border_color ? '1px' : '0px'
                }}
            >
                {/* Close Button */}
                <button 
                    onClick={closeAuthModal}
                    className="absolute top-5 right-5 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 max-h-[90vh] overflow-y-auto">
                    {authView === 'login' ? (
                        <LoginForm 
                            settings={settings} 
                            isModal={true}
                            onSuccess={closeAuthModal}
                            onSwitchToRegister={() => setAuthView('register')}
                        />
                    ) : (
                        <RegisterForm 
                            settings={settings} 
                            isModal={true}
                            onSuccess={closeAuthModal}
                            onSwitchToLogin={() => setAuthView('login')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
