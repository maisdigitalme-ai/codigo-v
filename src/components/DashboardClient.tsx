'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Module {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  position: number;
  lesson_count: number;
  completed_count: number;
}

interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}

interface Settings {
  banner_url?: string;
  logo_url?: string;
  site_title?: string;
}

export default function DashboardClient({
  modules,
  user,
  settings,
}: {
  modules: Module[];
  user: User;
  settings: Settings;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const totalLessons = modules.reduce((a, m) => a + Number(m.lesson_count), 0);
  const totalCompleted = modules.reduce((a, m) => a + Number(m.completed_count), 0);
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const bannerUrl = settings.banner_url || '';
  const logoUrl = settings.logo_url || '';
  const siteTitle = settings.site_title || 'Código V';

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      {/* Header - Sticky */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(10,10,10,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteTitle}
                width={100}
                height={40}
                style={{ objectFit: 'contain', height: '36px', width: 'auto' }}
                priority
              />
            ) : (
              <span style={{ color: 'white', fontWeight: 700, fontSize: '18px', fontFamily: 'var(--font-playfair)' }}>
                {siteTitle}
              </span>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: '#E63946', color: 'white' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm" style={{ color: '#AAA' }}>{user.name}</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#666' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden z-50 animate-fade-in"
                  style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid #2A2A2A' }}>
                    <p className="text-sm font-medium" style={{ color: 'white' }}>{user.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#666' }}>{user.email}</p>
                  </div>
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-3 text-sm transition-colors"
                      style={{ color: '#E63946', textDecoration: 'none' }}
                      onClick={() => setMenuOpen(false)}
                      onMouseEnter={e => (e.currentTarget.style.background = '#242424')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Panel de Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#242424')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner - Full width, sem corte */}
      {bannerUrl && (
        <div className="relative w-full" style={{ background: '#000' }}>
          <img
            src={bannerUrl}
            alt={siteTitle}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              maxHeight: '300px',
              objectFit: 'contain',
              objectPosition: 'center',
              background: '#0A0A0A',
            }}
          />
        </div>
      )}

      {/* Progress Bar Section */}
      <div style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: '#999' }}>
                {totalCompleted} de {totalLessons}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                {overallProgress}%
              </span>
            </div>
            <div style={{ flex: 1, maxWidth: '300px' }}>
              <div className="progress-bar" style={{ height: '6px' }}>
                <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Title */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <h2 style={{ color: 'white', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
          {siteTitle}
        </h2>
      </div>

      {/* Modules - Horizontal scroll on mobile, grid on desktop */}
      <main className="max-w-7xl mx-auto px-4 py-4 pb-12">
        {/* Desktop: Grid layout */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden overflow-x-auto pb-4" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {modules.map((module) => (
              <div key={module.id} style={{ width: '160px', scrollSnapAlign: 'start', flexShrink: 0 }}>
                <ModuleCard module={module} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ModuleCard({ module }: { module: Module }) {
  const progress = Number(module.lesson_count) > 0
    ? Math.round((Number(module.completed_count) / Number(module.lesson_count)) * 100)
    : 0;

  return (
    <Link href={`/dashboard/modulo/${module.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="rounded-xl overflow-hidden transition-all duration-300 group"
        style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer',
          position: 'relative',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.03)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,57,70,0.15)';
          e.currentTarget.style.borderColor = 'rgba(230,57,70,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        }}
      >
        {/* Thumbnail - Vertical aspect ratio like Cademi */}
        <div
          className="relative"
          style={{
            aspectRatio: '3/4',
            background: 'linear-gradient(135deg, #1a0505 0%, #0A0A0A 100%)',
            overflow: 'hidden',
          }}
        >
          {module.thumbnail_url ? (
            <Image
              src={module.thumbnail_url}
              alt={module.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 160px, 250px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(230,57,70,0.1)', border: '2px solid rgba(230,57,70,0.3)' }}
              >
                <svg width="28" height="28" fill="none" stroke="#E63946" strokeWidth="1.5" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
            </div>
          )}

          {/* Bottom gradient overlay for title */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)',
          }} />

          {/* Module title overlay at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px' }}>
            <p style={{ color: '#E63946', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Módulo #{module.position}
            </p>
            <h3 style={{
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              lineHeight: 1.3,
              fontFamily: 'var(--font-inter)',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}>
              {module.title.replace(/^Módulo #\d+:\s*/, '')}
            </h3>
          </div>

          {/* Progress indicator */}
          {progress > 0 && (
            <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
              {progress === 100 ? (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#22C55E', boxShadow: '0 2px 8px rgba(34,197,94,0.4)' }}
                >
                  <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              ) : (
                <div
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#22C55E', backdropFilter: 'blur(4px)', fontSize: '10px' }}
                >
                  {progress}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom progress bar */}
        <div style={{ height: '3px', background: '#1A1A1A' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: progress === 100 ? '#22C55E' : '#E63946',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
    </Link>
  );
}
