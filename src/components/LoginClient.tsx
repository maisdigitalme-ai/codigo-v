'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SocialProofCompact } from './SocialProof';

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Error al conectar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      {/* Left: Hero Image */}
      <div
        className="hidden md:flex md:w-1/2 relative items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1a0505 50%, #0A0A0A 100%)',
        }}
      >
        {/* Background overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663514395106/RNwrdS82oyF4Jnnd33FcWg/hero-banner-dvtwkHSwhqvSHUEfotBVnb.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.5,
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, #0A0A0A 100%)' }} />
        <div className="relative z-10 text-center px-8">
          <div className="mb-6">
            <h1
              className="text-6xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-playfair)', color: 'white', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
            >
              Código V
            </h1>
            <div
              className="text-sm font-semibold tracking-[0.3em] uppercase"
              style={{ color: '#E63946' }}
            >
              Domina el Placer Femenino
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="md:hidden text-center mb-8">
            <h1
              className="text-4xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-playfair)', color: 'white' }}
            >
              Código V
            </h1>
            <p className="text-xs tracking-widest uppercase" style={{ color: '#E63946' }}>
              Domina el Placer Femenino
            </p>
          </div>

          {/* Logo desktop */}
          <div className="hidden md:block text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)' }}
            >
              <span className="text-2xl" style={{ fontFamily: 'var(--font-playfair)', color: '#E63946', fontWeight: 700 }}>V</span>
            </div>
            <p className="text-sm" style={{ color: '#999' }}>Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#CCCCCC', fontFamily: 'var(--font-inter)' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="input-dark"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-2" style={{ color: '#CCCCCC', fontFamily: 'var(--font-inter)' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="input-dark pr-12"
                  style={{ fontSize: '16px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="text-sm px-4 py-3 rounded-lg"
                style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946' }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-red w-full py-3 text-base"
              style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Accediendo...
                </span>
              ) : 'Acceder'}
            </button>
          </form>

          {/* Prova social */}
          <div className="mt-6">
            <SocialProofCompact />
          </div>

          <p className="text-center text-xs mt-4" style={{ color: '#555' }}>
            Copyright © 2025 – Código V. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
