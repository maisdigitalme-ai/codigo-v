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

export default function DashboardClient({ modules, user }: { modules: Module[]; user: User }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const totalLessons = modules.reduce((a, m) => a + Number(m.lesson_count), 0);
  const totalCompleted = modules.reduce((a, m) => a + Number(m.completed_count), 0);
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #222',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)' }}
            >
              <span style={{ fontFamily: 'var(--font-playfair)', color: '#E63946', fontWeight: 700, fontSize: '18px' }}>V</span>
            </div>
            <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '18px', color: 'white' }}>
              Código V
            </span>
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
              <span className="hidden sm:block text-sm" style={{ color: '#CCC' }}>{user.name}</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#999' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden"
                style={{ background: '#1A1A1A', border: '1px solid #333', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: '#333' }}>
                  <p className="text-sm font-medium" style={{ color: 'white' }}>{user.name}</p>
                  <p className="text-xs" style={{ color: '#999' }}>{user.email}</p>
                </div>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-[#242424] transition-colors"
                    style={{ color: '#E63946', textDecoration: 'none' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-[#242424] transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', textAlign: 'left' }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a0505 0%, #0A0A0A 60%)',
          borderBottom: '1px solid #222',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-semibold px-2 py-1 rounded"
                  style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946', border: '1px solid rgba(230,57,70,0.3)', letterSpacing: '0.05em' }}
                >
                  ÁREA DE MIEMBROS
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-playfair)', color: 'white', lineHeight: 1.2 }}
              >
                Bienvenido, {user.name.split(' ')[0]}
              </h1>
              <p className="text-sm md:text-base" style={{ color: '#999' }}>
                Continúa tu aprendizaje donde lo dejaste
              </p>
            </div>

            {/* Progress Card */}
            <div
              className="rounded-xl p-4 min-w-[200px]"
              style={{ background: 'rgba(26,26,26,0.8)', border: '1px solid #333' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: '#999' }}>Progreso general</span>
                <span className="text-sm font-bold" style={{ color: '#22C55E' }}>{overallProgress}%</span>
              </div>
              <div className="progress-bar mb-2">
                <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }} />
              </div>
              <p className="text-xs" style={{ color: '#666' }}>
                {totalCompleted} de {totalLessons} clases completadas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold mb-6" style={{ color: '#CCC', fontFamily: 'var(--font-inter)' }}>
          Módulos del Curso
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => {
            const progress = Number(module.lesson_count) > 0
              ? Math.round((Number(module.completed_count) / Number(module.lesson_count)) * 100)
              : 0;

            return (
              <Link
                key={module.id}
                href={`/dashboard/modulo/${module.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl"
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    cursor: 'pointer',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative"
                    style={{
                      height: '160px',
                      background: 'linear-gradient(135deg, #1a0505 0%, #2a0a0a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {module.thumbnail_url ? (
                      <Image
                        src={module.thumbnail_url}
                        alt={module.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="text-center">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2"
                          style={{ background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.3)' }}
                        >
                          <svg width="24" height="24" fill="none" stroke="#E63946" strokeWidth="2" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </div>
                      </div>
                    )}
                    {/* Module number badge */}
                    <div
                      className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded"
                      style={{ background: '#E63946', color: 'white' }}
                    >
                      Módulo {module.position}
                    </div>
                    {progress === 100 && (
                      <div
                        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: '#22C55E' }}
                      >
                        <svg width="12" height="12" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3
                      className="font-semibold text-sm mb-1 line-clamp-2"
                      style={{ color: 'white', fontFamily: 'var(--font-inter)', lineHeight: 1.4 }}
                    >
                      {module.title}
                    </h3>
                    <p className="text-xs mb-3" style={{ color: '#666' }}>
                      {module.lesson_count} clases
                    </p>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: '#666' }}>Progreso</span>
                        <span className="text-xs font-medium" style={{ color: progress === 100 ? '#22C55E' : '#E63946' }}>
                          {progress}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${progress}%`,
                            background: progress === 100 ? '#22C55E' : '#E63946',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
