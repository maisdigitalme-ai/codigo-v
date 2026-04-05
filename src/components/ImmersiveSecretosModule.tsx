'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AvatarIcon from './AvatarIcon';

/* ─── CDN base ─── */
const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663514395106/RNwrdS82oyF4Jnnd33FcWg';

/* ─── PDF Sections Data ─── */
const PDF_SECTIONS = [
  {
    title: 'Los 17 Mayores Excitantes Femeninos',
    subtitle: 'De todos los tiempos — los secretos que ella desea que descubras',
    icon: '💋',
    color: '#E63946',
    gradient: 'linear-gradient(135deg, #E63946, #FF6B6B)',
    pages: [
      `${CDN}/ss1-1_9a9440d7.jpg`, `${CDN}/ss1-2_39b9408a.jpg`,
      `${CDN}/ss1-3_903cde82.jpg`, `${CDN}/ss1-4_0596cc81.jpg`,
      `${CDN}/ss1-5_f538d974.jpg`, `${CDN}/ss1-6_d5d8f388.jpg`,
      `${CDN}/ss1-7_534d6551.jpg`,
    ],
  },
  {
    title: 'Cómo Tener un Gran Sexo',
    subtitle: '40 reglas de oro que transformarán tu vida íntima',
    icon: '🔥',
    color: '#FF8C00',
    gradient: 'linear-gradient(135deg, #FF8C00, #FFB347)',
    pages: [
      `${CDN}/ss2-1_ad606a8d.jpg`, `${CDN}/ss2-2_1b45c575.jpg`,
      `${CDN}/ss2-3_95400e36.jpg`, `${CDN}/ss2-4_dae69f8b.jpg`,
      `${CDN}/ss2-5_24aae496.jpg`, `${CDN}/ss2-6_6e41407c.jpg`,
      `${CDN}/ss2-7_f7258be0.jpg`, `${CDN}/ss2-8_ab496d17.jpg`,
    ],
  },
  {
    title: '25 Super Sex Tips',
    subtitle: 'Técnicas avanzadas que la dejarán sin aliento',
    icon: '⚡',
    color: '#9333EA',
    gradient: 'linear-gradient(135deg, #9333EA, #C084FC)',
    pages: [
      `${CDN}/ss3-01_5321ca1e.jpg`, `${CDN}/ss3-02_94dc8837.jpg`,
      `${CDN}/ss3-03_21a861f2.jpg`, `${CDN}/ss3-04_26753d4c.jpg`,
      `${CDN}/ss3-05_e2f2d4e8.jpg`, `${CDN}/ss3-06_dc304a2a.jpg`,
      `${CDN}/ss3-07_b0d8c072.jpg`, `${CDN}/ss3-08_f7bc61d7.jpg`,
      `${CDN}/ss3-09_284c4d5f.jpg`, `${CDN}/ss3-10_ae2e090c.jpg`,
      `${CDN}/ss3-11_ba39eb85.jpg`, `${CDN}/ss3-12_81692a97.jpg`,
      `${CDN}/ss3-13_dd8b6d69.jpg`, `${CDN}/ss3-14_83ce36a5.jpg`,
    ],
  },
  {
    title: 'Virilidad Maximizada',
    subtitle: 'Cambios dietéticos simples para erecciones duras como una roca',
    icon: '💪',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #34D399)',
    pages: [
      `${CDN}/ss4-1_c0073024.jpg`, `${CDN}/ss4-2_0566687f.jpg`,
      `${CDN}/ss4-3_4f8628de.jpg`, `${CDN}/ss4-4_92429273.jpg`,
      `${CDN}/ss4-5_ad3f0e9c.jpg`, `${CDN}/ss4-6_61488de1.jpg`,
      `${CDN}/ss4-7_d999181a.jpg`, `${CDN}/ss4-8_d462cd58.jpg`,
      `${CDN}/ss4-9_1afe67fd.jpg`,
    ],
  },
];

const TOTAL_PAGES = PDF_SECTIONS.reduce((a, s) => a + s.pages.length, 0);

/* ─── Intersection Observer Hook ─── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated PDF Page with parallax-like effect ─── */
function AnimatedPage({ url, index, sectionColor }: { url: string; index: number; sectionColor: string }) {
  const { ref, visible } = useInView(0.03);
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already cached/loaded on mount
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateY(0) scale(1) rotateX(0deg)'
          : 'translateY(60px) scale(0.94) rotateX(2deg)',
        transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 80, 300)}ms`,
        perspective: '1000px',
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: hovered
            ? `0 30px 70px rgba(0,0,0,0.6), 0 0 30px ${sectionColor}15`
            : '0 25px 60px rgba(0,0,0,0.5)',
          transition: 'box-shadow 0.4s ease, transform 0.4s ease',
          transform: hovered ? 'scale(1.005)' : 'scale(1)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Shimmer loading effect */}
        {!loaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: '#1A1A1A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '400px',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }} />
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '32px', height: '32px',
                border: `3px solid ${sectionColor}30`,
                borderTopColor: sectionColor,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 10px',
              }} />
              <span style={{ color: '#444', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>
                Cargando página {index + 1}...
              </span>
            </div>
          </div>
        )}
        <img
          ref={imgRef}
          src={url}
          alt={`Página ${index + 1}`}
          style={{ width: '100%', height: 'auto', display: 'block', position: 'relative', zIndex: 2 }}
          loading={index < 2 ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
        {/* Page number overlay */}
        <div style={{
          position: 'absolute', bottom: '12px', right: '12px',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          borderRadius: '8px', padding: '4px 10px',
          fontSize: '11px', color: '#888',
          fontFamily: 'Inter, sans-serif',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}>
          {index + 1}
        </div>
      </div>
    </div>
  );
}

/* ─── Enhanced Section Divider with animated counter ─── */
function SectionDivider({ title, subtitle, icon, color, gradient, pageCount, sectionNumber }: {
  title: string; subtitle: string; icon: string; color: string; gradient: string; pageCount: number; sectionNumber: number;
}) {
  const { ref, visible } = useInView(0.2);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        padding: '100px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(70px)',
        transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Background glow orb */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px', height: '400px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
        filter: 'blur(50px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.5s ease',
        pointerEvents: 'none',
      }} />

      {/* Animated line top */}
      <div style={{
        width: '2px', height: visible ? '60px' : '0px',
        background: `linear-gradient(to bottom, transparent, ${color}50, transparent)`,
        marginBottom: '28px',
        transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
      }} />

      {/* Section number badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: `${color}10`, border: `1px solid ${color}30`,
        borderRadius: '100px', padding: '4px 14px', marginBottom: '16px',
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.6s ease 0.15s',
      }}>
        <span style={{
          color, fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
        }}>
          Capítulo {sectionNumber}
        </span>
        <span style={{ color: `${color}80`, fontSize: '10px' }}>•</span>
        <span style={{
          color: `${color}90`, fontSize: '10px',
          fontFamily: 'Inter, sans-serif',
        }}>
          {pageCount} páginas
        </span>
      </div>

      {/* Icon with gradient background */}
      <div style={{
        width: '70px', height: '70px', borderRadius: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '32px', marginBottom: '20px',
        background: `linear-gradient(135deg, ${color}18, ${color}06)`,
        border: `1px solid ${color}35`,
        transform: visible ? 'scale(1) rotate(0deg)' : 'scale(0.4) rotate(-20deg)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s',
        boxShadow: `0 8px 30px ${color}15`,
      }}>
        {icon}
      </div>

      {/* Title with gradient text */}
      <h2 style={{
        fontSize: 'clamp(26px, 5.5vw, 40px)',
        fontWeight: 700,
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '10px',
        letterSpacing: '0.03em',
        fontFamily: "'Playfair Display', serif",
        transform: visible ? 'translateY(0)' : 'translateY(25px)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.8s ease 0.35s',
        lineHeight: 1.2,
      }}>
        {title}
      </h2>

      {/* Subtitle */}
      <p style={{
        color: '#777', fontSize: '14px', maxWidth: '420px',
        fontFamily: 'Inter, sans-serif', lineHeight: 1.6,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.8s ease 0.45s',
      }}>
        {subtitle}
      </p>

      {/* Animated dots */}
      <div style={{
        display: 'flex', gap: '6px', marginTop: '28px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease 0.55s',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '4px', height: '4px', borderRadius: '50%',
            background: color,
            animation: visible ? `pulse-dot 1.5s ease-in-out ${i * 0.2}s infinite` : 'none',
          }} />
        ))}
      </div>

      {/* Line bottom */}
      <div style={{
        width: '2px', height: visible ? '40px' : '0px',
        background: `linear-gradient(to bottom, transparent, ${color}20, transparent)`,
        marginTop: '28px',
        transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
      }} />
    </div>
  );
}

/* ─── Scroll Progress Bar ─── */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handle = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (top / height) * 100 : 0);
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
      height: '3px', background: 'rgba(255,255,255,0.03)',
    }}>
      <div style={{
        height: '100%',
        background: 'linear-gradient(90deg, #E63946, #FF8C00, #9333EA, #10B981)',
        backgroundSize: '300% 100%',
        animation: 'gradient-shift 3s ease infinite',
        width: `${progress}%`,
        transition: 'width 0.15s ease-out',
        boxShadow: '0 0 10px rgba(230,57,70,0.5)',
      }} />
    </div>
  );
}

/* ─── Back to Top ─── */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handle = () => setShow(window.scrollY > 800);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 50,
        width: '50px', height: '50px', borderRadius: '14px',
        background: 'linear-gradient(135deg, #E63946, #FF6B6B)',
        color: 'white', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(230,57,70,0.4)',
        transition: 'all 0.3s ease',
        animation: 'fadeInUp 0.4s ease-out',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; }}
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  );
}

/* ─── Section Nav Dots (Desktop) ─── */
function SectionNav({ activeIndex }: { activeIndex: number }) {
  return (
    <div style={{
      position: 'fixed', right: '20px', top: '50%', transform: 'translateY(-50%)',
      zIndex: 50, display: 'flex', flexDirection: 'column', gap: '16px',
    }}
    className="hidden-mobile"
    >
      {PDF_SECTIONS.map((section, i) => (
        <button
          key={i}
          onClick={() => {
            const el = document.getElementById(`secretos-section-${i}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          title={section.title}
          style={{
            width: '14px', height: '14px',
            borderRadius: '50%',
            border: `2px solid ${activeIndex === i ? section.color : '#333'}`,
            background: activeIndex === i ? section.color : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.4s ease',
            padding: 0,
            boxShadow: activeIndex === i ? `0 0 12px ${section.color}50` : 'none',
            position: 'relative',
          }}
        >
          {activeIndex === i && (
            <div style={{
              position: 'absolute', inset: '-4px',
              borderRadius: '50%',
              border: `1px solid ${section.color}40`,
              animation: 'pulse-ring 2s ease-in-out infinite',
            }} />
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Page Counter Widget ─── */
function PageCounter({ current, total }: { current: number; total: number }) {
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '24px', zIndex: 50,
      background: 'rgba(15,15,15,0.9)', backdropFilter: 'blur(12px)',
      borderRadius: '12px', padding: '8px 16px',
      border: '1px solid rgba(255,255,255,0.06)',
      fontFamily: 'Inter, sans-serif',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}
    className="hidden-mobile"
    >
      <svg width="14" height="14" fill="none" stroke="#E63946" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <span style={{ color: '#888', fontSize: '12px' }}>
        <span style={{ color: 'white', fontWeight: 600 }}>{current}</span> / {total} páginas
      </span>
    </div>
  );
}

/* ─── Main Component ─── */
interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}

export default function ImmersiveSecretosModule({ user }: { user: User }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [visiblePages, setVisiblePages] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { if (data.logo_url) setLogoUrl(data.logo_url); })
      .catch(() => {});
  }, []);

  // Track active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    PDF_SECTIONS.forEach((_, i) => {
      const el = document.getElementById(`secretos-section-${i}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveSection(i); },
        { threshold: 0.15 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  // Track visible pages for counter
  useEffect(() => {
    const handle = () => {
      const imgs = document.querySelectorAll('[data-secretos-page]');
      let count = 0;
      imgs.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight) count++;
      });
      setVisiblePages(count);
    };
    window.addEventListener('scroll', handle, { passive: true });
    handle();
    return () => window.removeEventListener('scroll', handle);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      <ScrollProgress />
      <BackToTop />
      <SectionNav activeIndex={activeSection} />
      <PageCounter current={Math.min(visiblePages, TOTAL_PAGES)} total={TOTAL_PAGES} />

      {/* Inline styles for animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(230,57,70,0.1); } 50% { box-shadow: 0 0 50px rgba(230,57,70,0.25); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.8); } }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.8); opacity: 0; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes text-glow { 0%, 100% { text-shadow: 0 0 20px rgba(230,57,70,0.3); } 50% { text-shadow: 0 0 40px rgba(230,57,70,0.5), 0 0 80px rgba(230,57,70,0.2); } }
        @keyframes border-glow { 0%, 100% { border-color: rgba(230,57,70,0.2); } 50% { border-color: rgba(230,57,70,0.5); } }
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50" style={{
        background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            <span style={{ color: '#333' }}>/</span>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ height: '28px', objectFit: 'contain' }} />
            ) : (
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Código V</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span style={{ color: '#555', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
              {TOTAL_PAGES} páginas
            </span>
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <AvatarIcon size={32} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', animation: 'fadeInUp 0.2s ease-out' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid #2A2A2A' }}>
                      <p className="text-sm font-medium" style={{ color: 'white' }}>{user.name}</p>
                      <p className="text-xs" style={{ color: '#666' }}>{user.email}</p>
                    </div>
                    {user.isAdmin && (
                      <Link href="/admin" className="block px-4 py-3 text-sm" style={{ color: '#E63946', textDecoration: 'none' }}>Panel de Admin</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>Cerrar sesión</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Enhanced */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Multiple background glows */}
        <div style={{
          position: 'absolute', top: '-80px', left: '30%', transform: 'translateX(-50%)',
          width: '500px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '-40px', right: '20%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147,51,234,0.06) 0%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: '900px', margin: '0 auto', padding: '70px 20px 50px',
          textAlign: 'center', position: 'relative',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
            borderRadius: '100px', padding: '6px 18px', marginBottom: '28px',
            animation: 'border-glow 3s ease-in-out infinite',
          }}>
            <span style={{ fontSize: '14px' }}>🔒</span>
            <span style={{
              color: '#E63946', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
            }}>
              Contenido Exclusivo
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(32px, 7vw, 58px)',
            fontWeight: 700, color: 'white', marginBottom: '8px',
            letterSpacing: '0.02em', lineHeight: 1.1,
            fontFamily: "'Playfair Display', serif",
            animation: 'text-glow 4s ease-in-out infinite',
          }}>
            Secretos{' '}
            <span style={{
              background: 'linear-gradient(135deg, #E63946, #FF6B6B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Sexuales
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 3vw, 22px)',
            color: '#999', fontWeight: 300,
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            marginBottom: '20px',
          }}>
            que Todo Hombre Debe Saber
          </p>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '32px',
            marginBottom: '12px', flexWrap: 'wrap',
          }}>
            {[
              { value: '4', label: 'Guías', color: '#E63946' },
              { value: String(TOTAL_PAGES), label: 'Páginas', color: '#FF8C00' },
              { value: '100+', label: 'Secretos', color: '#9333EA' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '28px', fontWeight: 700, color: stat.color,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '11px', color: '#555', textTransform: 'uppercase',
                  letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <p style={{
            color: '#666', fontSize: '14px', maxWidth: '480px', margin: '20px auto 0',
            lineHeight: 1.7, fontFamily: 'Inter, sans-serif',
          }}>
            4 guías completas con los secretos más poderosos para dominar el arte de la seducción y el placer.
            Desliza hacia abajo y descubre cada capítulo.
          </p>

          {/* Scroll indicator */}
          <div style={{
            marginTop: '44px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '8px',
            animation: 'float 2.5s ease-in-out infinite',
          }}>
            <span style={{
              color: '#444', fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '0.25em', fontFamily: 'Inter, sans-serif',
            }}>
              Desliza para descubrir
            </span>
            <div style={{
              width: '24px', height: '38px', borderRadius: '12px',
              border: '2px solid #333', display: 'flex',
              alignItems: 'flex-start', justifyContent: 'center', padding: '7px',
            }}>
              <div style={{
                width: '4px', height: '10px', borderRadius: '2px',
                background: 'linear-gradient(to bottom, #E63946, #FF6B6B)',
                animation: 'fadeInUp 1.5s ease-in-out infinite',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* PDF Content Sections */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 12px' }}>
        {PDF_SECTIONS.map((section, sectionIndex) => (
          <div key={sectionIndex} id={`secretos-section-${sectionIndex}`}>
            <SectionDivider
              title={section.title}
              subtitle={section.subtitle}
              icon={section.icon}
              color={section.color}
              gradient={section.gradient}
              pageCount={section.pages.length}
              sectionNumber={sectionIndex + 1}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {section.pages.map((url, pageIndex) => (
                <div key={`${sectionIndex}-${pageIndex}`} data-secretos-page>
                  <AnimatedPage url={url} index={pageIndex} sectionColor={section.color} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* End Section - Enhanced */}
      <div style={{
        maxWidth: '900px', margin: '0 auto', padding: '100px 20px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '2px', height: '70px', margin: '0 auto 36px',
          background: 'linear-gradient(to bottom, transparent, rgba(230,57,70,0.4), transparent)',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'linear-gradient(135deg, rgba(230,57,70,0.12), rgba(147,51,234,0.08))',
          border: '1px solid rgba(230,57,70,0.25)',
          borderRadius: '100px', padding: '10px 24px', marginBottom: '24px',
        }}>
          <span style={{ fontSize: '18px' }}>🏆</span>
          <span style={{
            color: '#E63946', fontSize: '13px', fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
          }}>
            ¡Lectura completada!
          </span>
        </div>

        <h2 style={{
          fontSize: 'clamp(30px, 6vw, 46px)',
          fontWeight: 700, color: 'white', marginBottom: '14px',
          letterSpacing: '0.03em',
          fontFamily: "'Playfair Display', serif",
        }}>
          Ahora tienes el{' '}
          <span style={{
            background: 'linear-gradient(135deg, #E63946, #9333EA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            poder
          </span>
        </h2>

        <p style={{
          color: '#777', fontSize: '15px', maxWidth: '440px', margin: '0 auto 36px',
          fontFamily: 'Inter, sans-serif', lineHeight: 1.7,
        }}>
          Aplica estos secretos y transforma tu vida íntima para siempre.
          El conocimiento sin acción no tiene valor.
        </p>

        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'linear-gradient(135deg, #E63946, #C62828)',
            color: 'white', padding: '16px 36px',
            borderRadius: '14px', fontWeight: 600, fontSize: '15px',
            textDecoration: 'none', fontFamily: 'Inter, sans-serif',
            boxShadow: '0 8px 30px rgba(230,57,70,0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 45px rgba(230,57,70,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,57,70,0.3)'; }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver a los módulos
        </Link>
      </div>
    </div>
  );
}
