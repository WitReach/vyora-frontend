'use client';

import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
    User, Lock, MapPin, Package, LogOut, ChevronRight,
    Eye, EyeOff, Check, AlertCircle, Plus, Trash2, Pencil,
    ArrowRight, Shield, Bell
} from 'lucide-react';

// ── Section tab ids ──────────────────────────────────────────────────────────
type Tab = 'profile' | 'security' | 'addresses' | 'orders';

// ── Reusable section card ────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-700" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h2>
            </div>
            <div className="px-6 py-6">{children}</div>
        </div>
    );
}

// ── Input field ─────────────────────────────────────────────────────────────
function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
            <input
                {...props}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all disabled:bg-gray-50 disabled:text-gray-400"
            />
        </div>
    );
}

// ── Profile section ──────────────────────────────────────────────────────────
function ProfileSection({ user, onSaved }: { user: any; onSaved: () => void }) {
    const [name, setName]   = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved]   = useState(false);
    const [error, setError]   = useState('');

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            await api.put('/api/account/profile', { name, email, phone });
            setSaved(true);
            onSaved();
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Could not save. Try again.');
        } finally { setSaving(false); }
    };

    return (
        <SectionCard title="Personal Details" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                <Field label="Email Address" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
                <Field label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
            {error && <p className="mt-3 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
            <div className="mt-6 flex items-center gap-3">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 active:scale-[0.98]">
                    {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </SectionCard>
    );
}

// ── Security section ─────────────────────────────────────────────────────────
function SecuritySection() {
    const [current, setCurrent]   = useState('');
    const [newPwd, setNewPwd]     = useState('');
    const [confirm, setConfirm]   = useState('');
    const [showCur, setShowCur]   = useState(false);
    const [showNew, setShowNew]   = useState(false);
    const [saving, setSaving]     = useState(false);
    const [success, setSuccess]   = useState('');
    const [error, setError]       = useState('');

    const handleChange = async () => {
        if (newPwd !== confirm) { setError('Passwords do not match.'); return; }
        if (newPwd.length < 8)  { setError('Password must be at least 8 characters.'); return; }
        setSaving(true); setError(''); setSuccess('');
        try {
            await api.put('/api/account/password', { current_password: current, password: newPwd, password_confirmation: confirm });
            setSuccess('Password changed successfully!');
            setCurrent(''); setNewPwd(''); setConfirm('');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Could not change password.');
        } finally { setSaving(false); }
    };

    return (
        <SectionCard title="Security" icon={Lock}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current password */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                    <div className="relative">
                        <input type={showCur ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                            placeholder="Enter current password" />
                        <button type="button" onClick={() => setShowCur(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                        <input type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                            placeholder="Min 8 characters" />
                        <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <Field label="Confirm New Password" type="password" value={confirm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)} placeholder="Repeat new password" />
            </div>
            {error   && <p className="mt-3 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
            {success && <p className="mt-3 text-xs text-green-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" />{success}</p>}
            <div className="mt-6">
                <button onClick={handleChange} disabled={saving}
                    className="flex items-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 active:scale-[0.98]">
                    {saving ? 'Updating…' : 'Update Password'}
                </button>
            </div>
        </SectionCard>
    );
}

// ── Addresses section ────────────────────────────────────────────────────────
interface Address {
    id: number;
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip_code: string;
    is_default: boolean;
}

function AddressCard({ addr, onDelete, onSetDefault }: { addr: Address; onDelete: (id: number) => void; onSetDefault: (id: number) => void }) {
    return (
        <div className={`relative p-4 rounded-xl border transition-all ${addr.is_default ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'}`}>
            {addr.is_default && (
                <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-gray-900 text-white px-2 py-0.5 rounded-full">Default</span>
            )}
            <p className="text-sm font-bold text-gray-900">{addr.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                {addr.city}, {addr.state} – {addr.zip_code}
            </p>
            <div className="flex items-center gap-3 mt-3">
                {!addr.is_default && (
                    <button onClick={() => onSetDefault(addr.id)} className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-2">
                        Set Default
                    </button>
                )}
                <button onClick={() => onDelete(addr.id)} className="text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors flex items-center gap-0.5 ml-auto">
                    <Trash2 className="w-3 h-3" /> Remove
                </button>
            </div>
        </div>
    );
}

function AddressesSection() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        try { const r = await api.get('/api/account/addresses'); setAddresses(r.data); }
        catch { setAddresses([]); } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const handleAdd = async () => {
        setSaving(true); setError('');
        try {
            await api.post('/api/account/addresses', form);
            setShowForm(false);
            setForm({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
            load();
        } catch (e: any) { setError(e.response?.data?.message || 'Could not save address.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Remove this address?')) return;
        try { await api.delete(`/api/account/addresses/${id}`); load(); } catch {}
    };
    const handleDefault = async (id: number) => {
        try { await api.put(`/api/account/addresses/${id}/default`); load(); } catch {}
    };

    const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    return (
        <SectionCard title="Saved Addresses" icon={MapPin}>
            {loading ? (
                <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 rounded-xl bg-gray-50 animate-pulse" />)}</div>
            ) : addresses.length === 0 && !showForm ? (
                <p className="text-sm text-gray-400 text-center py-6">No saved addresses yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map(a => (
                        <AddressCard key={a.id} addr={a} onDelete={handleDelete} onSetDefault={handleDefault} />
                    ))}
                </div>
            )}

            {showForm && (
                <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">New Address</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Full Name" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => f('name', e.target.value)} placeholder="Recipient name" />
                        <Field label="Phone" value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => f('phone', e.target.value)} placeholder="10-digit number" />
                        <Field label="Address Line 1" value={form.line1} onChange={(e: React.ChangeEvent<HTMLInputElement>) => f('line1', e.target.value)} placeholder="House / Flat / Street" />
                        <Field label="Address Line 2" value={form.line2} onChange={(e: React.ChangeEvent<HTMLInputElement>) => f('line2', e.target.value)} placeholder="Area / Landmark (optional)" />
                        <Field label="City" value={form.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => f('city', e.target.value)} placeholder="City" />
                        <Field label="State" value={form.state} onChange={(e: React.ChangeEvent<HTMLInputElement>) => f('state', e.target.value)} placeholder="State" />
                        <Field label="Pincode" value={form.pincode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => f('pincode', e.target.value)} placeholder="6-digit pincode" />
                    </div>
                    {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
                    <div className="flex gap-2 pt-1">
                        <button onClick={handleAdd} disabled={saving}
                            className="flex items-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
                            {saving ? 'Saving…' : 'Save Address'}
                        </button>
                        <button onClick={() => setShowForm(false)} className="text-xs text-gray-500 font-medium hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {!showForm && (
                <button onClick={() => setShowForm(true)}
                    className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 hover:border-gray-500 px-4 py-2.5 rounded-xl w-full justify-center transition-all">
                    <Plus className="w-4 h-4" /> Add New Address
                </button>
            )}
        </SectionCard>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AccountPage() {
    const { user, logout } = useAuthStore();
    const { openAuthModal } = useUIStore();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [userData, setUserData] = useState<any>(null);

    const authAppearance = { ux_mode: 'modal' };
    const isModalMode = true;

    useEffect(() => {
        setMounted(true);
        if (user) {
            api.get('/api/user').then(r => setUserData(r.data)).catch(() => setUserData(user));
        }
    }, [user]);

    if (!mounted) return <div className="min-h-[60vh]" />;

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
                <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
                    <User className="w-8 h-8 text-gray-300" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">Sign in to your account</h1>
                <p className="text-sm text-gray-500 mb-8">View your profile, orders, addresses and more.</p>
                <Link href="/login" className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
                    Sign In <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    const navTabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'profile',   label: 'Profile',   icon: User   },
        { id: 'security',  label: 'Security',  icon: Shield },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'orders',    label: 'Orders',    icon: Package },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white text-xl font-black shadow-lg">
                        {(userData?.name || user.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{userData?.name || user.name}</h1>
                        <p className="text-sm text-gray-500">{userData?.email || user.email}</p>
                    </div>
                </div>
                <button onClick={logout}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-all uppercase tracking-wider">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">

                {/* Sidebar Nav */}
                <aside className="md:w-52 shrink-0">
                    <nav className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden">
                        {navTabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all border-l-2
                                    ${activeTab === tab.id
                                        ? 'border-gray-900 bg-gray-50 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                                <tab.icon className="w-4 h-4 shrink-0" />
                                {tab.label}
                                {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 space-y-6 min-w-0">
                    {activeTab === 'profile'   && <ProfileSection user={userData || user} onSaved={() => api.get('/api/user').then(r => setUserData(r.data)).catch(() => {})} />}
                    {activeTab === 'security'  && <SecuritySection />}
                    {activeTab === 'addresses' && <AddressesSection />}
                    {activeTab === 'orders'    && (
                        <SectionCard title="My Orders" icon={Package}>
                            <div className="text-center py-8">
                                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 mb-4">View all your past orders.</p>
                                <Link href="/orders" className="inline-flex items-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all">
                                    Go to Orders <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </SectionCard>
                    )}
                </main>
            </div>
        </div>
    );
}
