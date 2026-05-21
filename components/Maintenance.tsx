'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Instagram, Twitter, Facebook, Youtube, Mail, Phone, MessageCircle, Clock, Music2, Pin } from 'lucide-react';

export default function Maintenance({ settings }: { settings?: any }) {
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [pulseColor, setPulseColor] = useState('bg-[var(--accent)]');

  const storeName = settings?.store_name || "Vyora";
  const logoRelPath = settings?.main_logo;

  const checkStatus = async () => {
    setIsChecking(true);
    setStatusMessage('Checking system status...');
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    
    try {
      const res = await fetch(`${apiUrl}/maintenance-status`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (!data.maintenance) {
          setStatusMessage('System is back online! Refreshing...');
          setPulseColor('bg-green-500 animate-ping');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }
      }
    } catch (error) {
      console.warn("Status check failed", error);
    }
    
    setTimeout(() => {
      setIsChecking(false);
      setStatusMessage('Still refining. We will be back very soon!');
      setPulseColor('bg-[var(--accent)]');
      
      setTimeout(() => {
        setStatusMessage('');
      }, 3000);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[var(--secondary)] text-[var(--primary)] font-sans overflow-hidden select-none">
      {/* Subtle Grid Lines Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header / Brand Logo */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-12 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3 group">
          {logoRelPath ? (
            <img src={`/${logoRelPath}`} alt={storeName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-xl sm:text-2xl font-bold tracking-[0.1em] text-[var(--primary)] uppercase transition-all duration-300" style={{ fontFamily: 'var(--font-heading)' }}>
              {storeName}
            </span>
          )}
        </div>
        <div className="text-xs uppercase tracking-widest text-[var(--primary)] opacity-60 font-medium">
          Scheduled Refinement
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 text-center max-w-3xl mx-auto z-10 w-full">
        {/* Animated Icon Container aligned with Brand */}
        <div className="relative mb-10 flex items-center justify-center w-28 h-28 rounded-full border border-[var(--primary)]/10 bg-[var(--primary)]/5 backdrop-blur-md shadow-sm group">
          <div className="absolute inset-0 rounded-full border border-[var(--accent)]/30 group-hover:border-[var(--accent)] transition-all duration-500 scale-[1.05]" />
          <svg 
            className="w-12 h-12 text-[var(--accent)] group-hover:scale-110 transition-all duration-500" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.2" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--primary)] mb-6 select-text leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          System is under <br className="hidden sm:inline" />
          <span className="text-[var(--accent)]">
            maintenance
          </span>
        </h1>

        {/* Subtitle description */}
        <p className="text-base sm:text-lg md:text-xl text-[var(--primary)] opacity-70 font-light max-w-xl mb-10 leading-relaxed select-text" style={{ fontFamily: 'var(--font-body)' }}>
          {storeName} is currently undergoing scheduled system updates to introduce new, premium features. We will be back online shortly.
        </p>

        {/* Dynamic Status / Interactive Area */}
        <div className="flex flex-col items-center justify-center space-y-5 w-full">
          {/* Status Indicator */}
          <div className="inline-flex items-center space-x-3.5 px-4 py-2 rounded-full bg-[var(--secondary)] border border-[var(--primary)]/10 shadow-sm">
            <span className={`relative flex h-2.5 w-2.5`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pulseColor}`}></span>
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--primary)] opacity-90">
              Refining Our Shopping Experience
            </span>
          </div>

          {/* Action button */}
          <div className="relative group mt-2">
            <button
              onClick={checkStatus}
              disabled={isChecking}
              className="relative px-8 py-3.5 bg-[var(--primary)] text-[var(--secondary)] border border-[var(--primary)] rounded-full font-medium tracking-wide text-sm flex items-center space-x-2.5 hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin text-[var(--accent)]' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              <span>{isChecking ? 'Checking System...' : 'Check Status'}</span>
            </button>
          </div>

          {/* Dynamic feedback message */}
          {statusMessage && (
            <p className="text-xs tracking-wider uppercase text-[var(--accent)] font-bold animate-fade-in">
              {statusMessage}
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-t border-[var(--primary)]/10 z-10 text-[var(--primary)]">
        {/* Left: Copyright & Hours */}
        <div className="flex flex-col items-center md:items-start space-y-2 opacity-60">
          <div className="text-xs tracking-wider font-light">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </div>
          {settings?.customer_support_hours && (
            <div className="flex items-center space-x-1.5 text-xs font-light">
              <Clock className="h-3.5 w-3.5" />
              <span>{settings.customer_support_hours}</span>
            </div>
          )}
        </div>
        
        {/* Center: GST / Tax ID */}
        <div className="flex flex-col items-center text-center opacity-60">
          {settings?.tax_id && (
            <span className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)]">
              GST: {settings.tax_id}
            </span>
          )}
        </div>

        {/* Right: Social & Contact Icons */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 opacity-70">
          {(settings?.support_email || settings?.store_email) && (
            <a href={`mailto:${settings?.support_email || settings?.store_email}`} className="hover:text-[var(--accent)] hover:opacity-100 transition-colors duration-300" title="Email Support">
              <Mail className="h-4 w-4" />
            </a>
          )}
          {settings?.support_phone && (
            <a href={`tel:${settings.support_phone}`} className="hover:text-[var(--accent)] hover:opacity-100 transition-colors duration-300" title="Phone Support">
              <Phone className="h-4 w-4" />
            </a>
          )}
          {settings?.whatsapp_number && (
            <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] hover:opacity-100 transition-colors duration-300" title="WhatsApp Support">
              <MessageCircle className="h-4 w-4" />
            </a>
          )}
          
          {/* Divider if both contact and social exist */}
          <span className="h-3 w-px bg-[var(--primary)] opacity-30 mx-1" />

          {settings?.social_instagram && (
            <a href={settings.social_instagram} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] hover:opacity-100 transition-colors duration-300" title="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {settings?.social_facebook && (
            <a href={settings.social_facebook} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] hover:opacity-100 transition-colors duration-300" title="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
          )}
          {settings?.social_twitter && (
            <a href={settings.social_twitter} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] hover:opacity-100 transition-colors duration-300" title="Twitter (X)">
              <Twitter className="h-4 w-4" />
            </a>
          )}
          {settings?.social_youtube && (
            <a href={settings.social_youtube} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] hover:opacity-100 transition-colors duration-300" title="YouTube">
              <Youtube className="h-4 w-4" />
            </a>
          )}
          {settings?.social_tiktok && (
            <a href={settings.social_tiktok} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] hover:opacity-100 transition-colors duration-300" title="TikTok">
              <Music2 className="h-4 w-4" />
            </a>
          )}
          {settings?.social_pinterest && (
            <a href={settings.social_pinterest} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] hover:opacity-100 transition-colors duration-300" title="Pinterest">
              <Pin className="h-4 w-4" />
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
