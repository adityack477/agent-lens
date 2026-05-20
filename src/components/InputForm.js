'use client';
import { useState } from 'react';

export default function InputForm({ onAnalyze }) {
  const [storeUrl, setStoreUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [urlError, setUrlError] = useState('');

  function validate() {
    if (!storeUrl.trim()) { setUrlError('Store URL is required'); return false; }
    if (!storeUrl.includes('.myshopify.com') && !storeUrl.includes('shopify')) {
      setUrlError('Please enter a valid Shopify store URL (e.g. mystore.myshopify.com)');
      return false;
    }
    setUrlError('');
    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) onAnalyze({ storeUrl, apiToken });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#0a0a0f' }}>

      {/* Background grid */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

      {/* Glow blob */}
      <div className="absolute rounded-full pointer-events-none"
        style={{
          top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
            }}>🔍</div>
            <span style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: 'var(--font-syne, sans-serif)' }}>
              Agent<span style={{ color: '#818cf8' }}>Lens</span>
            </span>
          </div>
          <h1 style={{
            fontSize: '38px', fontWeight: '800', lineHeight: '1.15',
            marginBottom: '12px', fontFamily: 'var(--font-syne, sans-serif)', color: '#f0f0f5'
          }}>
            How does AI see<br />
            <span style={{ color: '#818cf8' }}>your Shopify store?</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '17px', lineHeight: '1.6' }}>
            Diagnose why AI shopping agents skip your products<br />
            and get a prioritized fix list in 30 seconds.
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '36px',
          backdropFilter: 'blur(10px)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                Shopify Store URL
              </label>
              <input
                type="text"
                value={storeUrl}
                onChange={e => { setStoreUrl(e.target.value); setUrlError(''); }}
                placeholder="yourstore.myshopify.com"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: urlError ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px', padding: '12px 16px', color: '#f0f0f5',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
              {urlError && <p style={{ color: '#f87171', fontSize: '13px', marginTop: '6px' }}>{urlError}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                Admin API Access Token
              </label>
              <input
                type="password"
                value={apiToken}
                onChange={e => setApiToken(e.target.value)}
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px', padding: '12px 16px', color: '#f0f0f5',
                  fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
              <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px' }}>
                Found in Shopify Partner Dashboard → Apps → API credentials. Never stored.
              </p>
            </div>

            <button
              type="submit"
              style={{
                width: '100%', padding: '15px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                border: 'none', borderRadius: '12px',
                color: 'white', fontSize: '17px', fontWeight: '600',
                cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: 'inherit'
              }}
              onMouseOver={e => e.target.style.opacity = '0.9'}
              onMouseOut={e => e.target.style.opacity = '1'}
            >
              Analyze My Store →
            </button>
          </form>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '24px', color: '#6b7280', fontSize: '13px' }}>
          <span>🔒 Token never stored</span>
          <span>⚡ Results in ~30s</span>
          <span>🆓 Free to use</span>
        </div>
      </div>
    </div>
  );
}
