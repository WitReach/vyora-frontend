'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone } from 'lucide-react';

interface RegisterFormProps {
    settings: any;
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
    isModal?: boolean;
}

export default function RegisterForm({ settings, onSuccess, onSwitchToLogin, isModal }: RegisterFormProps) {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    // Parse structured settings
    const parse = (val: any) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch { return {}; }
        }
        return val || {};
    };

    const rawFields = parse(settings.auth_fields);
    
    // Normalize fields for frontend
    const normalize = (field: any, defaultVisible = true) => {
        if (typeof field === 'object' && field !== null) return field;
        return { visible: !!field, auth_type: 'data_entry' };
    };

    const authFields = {
        name: normalize(rawFields.name, true),
        email: normalize(rawFields.email, true),
        phone: normalize(rawFields.phone, false),
    };

    const authHeader = parse(settings.auth_header);
    const authFooter = parse(settings.auth_footer);
    const authAppearance = parse(settings.auth_appearance);
    const authSocial = parse(settings.auth_social);

    const isPhoneVisible = authFields.phone.visible || authFields.phone.auth_type !== 'data_entry';
    const isNameVisible = authFields.name.visible !== false;

    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/api/register', form);
            login(res.data.access_token, res.data.user);
            if (onSuccess) onSuccess();
            else router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
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
                                {authHeader.text || 'Create Account'}
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
                    {isNameVisible && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="text" 
                                    required={authFields.name?.required !== false}
                                    placeholder="Enter your full name"
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:border-black focus:bg-white transition-all outline-none"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input
                                type="email" required
                                placeholder="name@example.com"
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:border-black focus:bg-white transition-all outline-none"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {isPhoneVisible && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                                Phone 
                                {authFields.phone.auth_type === 'sms_otp' && <span className="text-[10px] text-gray-300 ml-2">(SMS OTP)</span>}
                                {authFields.phone.auth_type === 'whatsapp_otp' && <span className="text-[10px] text-gray-300 ml-2">(WhatsApp OTP)</span>}
                            </label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="tel"
                                    required={authFields.phone.required}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:border-black focus:bg-white transition-all outline-none"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="password" required
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 focus:border-black focus:bg-white transition-all outline-none"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Confirm</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="password" required
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 focus:border-black focus:bg-white transition-all outline-none"
                                    value={form.password_confirmation}
                                    onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-black/10 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>Create account</span>}
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
                        Already have an account? 
                        <button 
                            type="button"
                            onClick={() => onSwitchToLogin ? onSwitchToLogin() : router.push('/login')}
                            className="text-black font-black ml-2 hover:underline underline-offset-4 decoration-2"
                        >
                            Sign in
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
