'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginFormProps {
    settings: any;
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
    isModal?: boolean;
}

export default function LoginForm({ settings, onSuccess, onSwitchToRegister, isModal }: LoginFormProps) {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Parse structured settings
    const parse = (val: any) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch { return {}; }
        }
        return val || {};
    };

    const authHeader = parse(settings.auth_header);
    const authFooter = parse(settings.auth_footer);
    const authAppearance = parse(settings.auth_appearance);
    const authSocial = parse(settings.auth_social);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/api/login', { email, password });
            login(res.data.access_token, res.data.user);
            if (onSuccess) onSuccess();
            else router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Dynamic Header Section */}
            <div className={`text-center mb-8 space-y-3 ${isModal ? 'pt-2' : ''}`}>
                {(authHeader.order || ['image', 'text']).map((item: string) => (
                    <div key={item}>
                        {item === 'image' && authHeader.image && (
                            <img 
                                src={authHeader.image} 
                                alt="Logo" 
                                className="mx-auto h-auto object-contain" 
                                style={{ width: authHeader.image_width ? `${authHeader.image_width}px` : '100px' }}
                            />
                        )}
                        {item === 'text' && (
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                                {authHeader.text || 'Sign In'}
                            </h1>
                        )}
                    </div>
                ))}
            </div>

            <div className={!isModal ? "bg-white p-8 rounded-2xl shadow-sm border border-gray-200" : ""}
                 style={!isModal ? { 
                     borderRadius: authAppearance.border_radius ? `${authAppearance.border_radius}px` : undefined,
                     borderColor: authAppearance.border_color
                 } : {}}>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                        <p className="text-sm font-medium text-red-800 leading-tight">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input
                                type="email" required
                                placeholder="name@example.com"
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:border-black focus:bg-white transition-all outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</label>
                            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-black transition-colors">Forgot?</button>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input
                                type="password" required
                                placeholder="••••••••"
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:border-black focus:bg-white transition-all outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-black/10 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>Sign in now</span>}
                    </button>
                </form>

                {/* Social Login Buttons */}
                {(authSocial.google?.enabled || authSocial.facebook?.enabled) && (
                    <div className="mt-8 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-white px-3 text-gray-300 font-black tracking-[0.2em] italic">Social Auth</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {authSocial.google?.enabled && (
                                <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
                                    <img src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" className="w-3.5 h-3.5" />
                                    <span>Google</span>
                                </button>
                            )}
                            {authSocial.facebook?.enabled && (
                                <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
                                    <img src="https://www.svgrepo.com/show/303114/facebook-3-logo.svg" className="w-3.5 h-3.5" />
                                    <span>Facebook</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        New here? 
                        <button 
                            type="button"
                            onClick={() => onSwitchToRegister ? onSwitchToRegister() : router.push('/register')}
                            className="text-black font-black ml-2 hover:underline underline-offset-4 decoration-2"
                        >
                            Create account
                        </button>
                    </p>
                </div>
            </div>

            {/* Dynamic Footer Section */}
            {!isModal && (
                <div className="mt-10 text-center space-y-4">
                    {(authFooter.order || ['image', 'text']).map((item: string) => (
                        <div key={item}>
                            {item === 'image' && authFooter.image && (
                                <img 
                                    src={authFooter.image} 
                                    alt="Footer Logo" 
                                    className="mx-auto h-auto object-contain" 
                                    style={{ width: authFooter.image_width ? `${authFooter.image_width}px` : '80px' }}
                                />
                            )}
                            {item === 'text' && (
                                <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] leading-relaxed italic">
                                    {authFooter.text}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
