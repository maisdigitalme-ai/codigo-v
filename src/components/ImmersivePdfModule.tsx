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
    title: 'Abriendo la Puerta Trasera',
    subtitle: 'Descubre los secretos que ella nunca te contó',
    icon: '🔥',
    color: '#E63946',
    pages: [
      `${CDN}/page_01_914937e2.jpg`, `${CDN}/page_02_5ad6bf36.jpg`,
      `${CDN}/page_03_e38da84b.jpg`, `${CDN}/page_04_4b54b783.jpg`,
      `${CDN}/page_05_cd3e1a91.jpg`, `${CDN}/page_06_84540958.jpg`,
      `${CDN}/page_07_b8b7f58c.jpg`, `${CDN}/page_08_84757f08.jpg`,
      `${CDN}/page_09_e4afec2c.jpg`, `${CDN}/page_10_da2d3d84.jpg`,
      `${CDN}/page_11_872c36bd.jpg`,
    ],
  },
  {
    title: 'La Extraña Técnica del Orgasmo Squirt',
    subtitle: 'La técnica que cambiará todo para siempre',
    icon: '⚡',
    color: '#FF8C00',
    pages: [
      `${CDN}/page_01_207e254a.jpg`, `${CDN}/page_02_090f3d11.jpg`,
      `${CDN}/page_03_1b159c34.jpg`, `${CDN}/page_04_c9f73b24.jpg`,
      `${CDN}/page_05_55b42550.jpg`, `${CDN}/page_06_03671ed5.jpg`,
      `${CDN}/page_07_d3b17267.jpg`, `${CDN}/page_08_bdc95519.jpg`,
      `${CDN}/page_09_a81308db.jpg`, `${CDN}/page_10_f4cbac3b.jpg`,
    ],
  },
  {
    title: 'Posiciones Sexuales Maestras',
    subtitle: 'Domina las posiciones que la volverán loca',
    icon: '🚀',
    color: '#9333EA',
    pages: [
      `${CDN}/page_01_6b292a32.jpg`, `${CDN}/page_02_873ce722.jpg`,
      `${CDN}/page_03_10dabc6d.jpg`, `${CDN}/page_04_af44cfce.jpg`,
      `${CDN}/page_05_576a6714.jpg`, `${CDN}/page_06_897e6ced.jpg`,
      `${CDN}/page_07_5acab649.jpg`, `${CDN}/page_08_8239c932.jpg`,
      `${CDN}/page_09_48db16fa.jpg`, `${CDN}/page_10_d4dc405f.jpg`,
      `${CDN}/page_11_a5627396.jpg`, `${CDN}/page_12_0392872d.jpg`,
      `${CDN}/page_13_df2a6d38.jpg`, `${CDN}/page_14_3c1a5ca5.jpg`,
      `${CDN}/page_15_ce2e26f8.jpg`, `${CDN}/page_16_8a372aa2.jpg`,
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

/* ─── Animated PDF Page ─── */
function AnimatedPage({ url, index }: { url: string; index: number }) {
  const { ref, visible } = useInView(0.05);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.96)',
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 60, 250)}ms`,
      }}
    >
      <div style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        {!loaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: '#1A1A1A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '300px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '28px', height: '28px',
                border: '3px solid rgba(230,57,70,0.2)',
                borderTopColor: '#E63946',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 8px',
              }} />
              <span style={{ color: '#444', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>
                Cargando...
              </span>
            </div>
          </div>
        )}
        <img
          src={url}
          alt={`Página ${index + 1}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          loading={index < 3 ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}

/* ─── Section Divider ─── */
function SectionDivider({ title, subtitle, icon, color, index }: {
  title: string; subtitle: string; icon: string; color: string; index: number;
}) {
  const { ref, visible } = useInView(0.25);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        padding: '80px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(60px)',
        transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px', height: '300px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        filter: 'blur(40px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s ease',
        pointerEvents: 'none',
      }} />

      {/* Line top */}
      <div style={{
        width: '1px', height: '50px',
        background: `linear-gradient(to bottom, transparent, ${color}40, transparent)`,
        marginBottom: '24px',
      }} />

      {/* Icon */}
      <div style={{
        width: '60px', height: '60px', borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px', marginBottom: '16px',
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        border: `1px solid ${color}40`,
        transform: visible ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-15deg)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
      }}>
        {icon}
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: 'clamp(24px, 5vw, 36px)',
        fontWeight: 700,
        color: 'white',
        marginBottom: '8px',
        letterSpacing: '0.04em',
        fontFamily: "'Playfair Display', serif",
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.8s ease 0.3s',
      }}>
        {title}
      </h2>

      {/* Subtitle */}
      <p style={{
        color: '#888', fontSize: '14px', maxWidth: '400px',
        fontFamily: 'Inter, sans-serif',
        transform: visible ? 'translateY(0)' : 'translateY(15px)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.8s ease 0.4s',
      }}>
        {subtitle}
      </p>

      {/* Line bottom */}
      <div style={{
        width: '1px', height: '50px',
        background: `linear-gradient(to bottom, transparent, ${color}20, transparent)`,
        marginTop: '24px',
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
      height: '3px', background: 'transparent',
    }}>
      <div style={{
        height: '100%',
        background: 'linear-gradient(90deg, #E63946, #ff6b6b, #E63946)',
        width: `${progress}%`,
        transition: 'width 0.15s ease-out',
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
        width: '48px', height: '48px', borderRadius: '50%',
        background: '#E63946', color: 'white', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(230,57,70,0.4)',
        transition: 'all 0.3s ease',
        animation: 'fadeInUp 0.3s ease-out',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
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
      position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)',
      zIndex: 50, display: 'flex', flexDirection: 'column', gap: '12px',
    }}
    className="hidden-mobile"
    >
      {PDF_SECTIONS.map((section, i) => (
        <button
          key={i}
          onClick={() => {
            const el = document.getElementById(`pdf-section-${i}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          title={section.title}
          style={{
            width: activeIndex === i ? '12px' : '10px',
            height: activeIndex === i ? '12px' : '10px',
            borderRadius: '50%',
            border: `2px solid ${activeIndex === i ? '#E63946' : '#444'}`,
            background: activeIndex === i ? '#E63946' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}

export default function ImmersivePdfModule({ user }: { user: User }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

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
      const el = document.getElementById(`pdf-section-${i}`);
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

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      <ScrollProgress />
      <BackToTop />
      <SectionNav activeIndex={activeSection} />

      {/* Inline styles for animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(230,57,70,0.1); } 50% { box-shadow: 0 0 40px rgba(230,57,70,0.2); } }
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

      {/* Hero Section */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: '900px', margin: '0 auto', padding: '60px 20px 40px',
          textAlign: 'center', position: 'relative',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)',
            borderRadius: '100px', padding: '6px 16px', marginBottom: '24px',
          }}>
            <span style={{ fontSize: '14px' }}>🚀</span>
            <span style={{
              color: '#E63946', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
            }}>
              Módulo Bônus
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(36px, 8vw, 64px)',
            fontWeight: 700, color: 'white', marginBottom: '12px',
            letterSpacing: '0.03em', lineHeight: 1.1,
            fontFamily: "'Playfair Display', serif",
          }}>
            Acelerador de{' '}
            <span style={{ color: '#E63946' }}>Resultados</span>
          </h1>

          {/* Description */}
          <p style={{
            color: '#888', fontSize: '15px', maxWidth: '500px', margin: '0 auto',
            lineHeight: 1.7, fontFamily: 'Inter, sans-serif',
          }}>
            3 guías exclusivas para llevar tu juego al siguiente nivel.
            Desliza hacia abajo y sumérgete en el contenido.
          </p>

          {/* Scroll indicator */}
          <div style={{
            marginTop: '40px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '8px',
            animation: 'float 2.5s ease-in-out infinite',
          }}>
            <span style={{
              color: '#555', fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif',
            }}>
              Desliza
            </span>
            <div style={{
              width: '22px', height: '34px', borderRadius: '11px',
              border: '2px solid #444', display: 'flex',
              alignItems: 'flex-start', justifyContent: 'center', padding: '6px',
            }}>
              <div style={{
                width: '4px', height: '8px', borderRadius: '2px',
                background: '#E63946', animation: 'fadeInUp 1.5s ease-in-out infinite',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* PDF Content Sections */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 12px' }}>
        {PDF_SECTIONS.map((section, sectionIndex) => (
          <div key={sectionIndex} id={`pdf-section-${sectionIndex}`}>
            <SectionDivider
              title={section.title}
              subtitle={section.subtitle}
              icon={section.icon}
              color={section.color}
              index={sectionIndex}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {section.pages.map((url, pageIndex) => (
                <AnimatedPage key={`${sectionIndex}-${pageIndex}`} url={url} index={pageIndex} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* End Section */}
      <div style={{
        maxWidth: '900px', margin: '0 auto', padding: '80px 20px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '1px', height: '60px', margin: '0 auto 32px',
          background: 'linear-gradient(to bottom, transparent, rgba(230,57,70,0.3), transparent)',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.25)',
          borderRadius: '100px', padding: '8px 20px', marginBottom: '20px',
        }}>
          <span style={{ fontSize: '16px' }}>🔥</span>
          <span style={{
            color: '#E63946', fontSize: '13px', fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
          }}>
            Contenido completado
          </span>
        </div>

        <h2 style={{
          fontSize: 'clamp(28px, 6vw, 42px)',
          fontWeight: 700, color: 'white', marginBottom: '12px',
          letterSpacing: '0.03em',
          fontFamily: "'Playfair Display', serif",
        }}>
          ¡Ahora es tu turno!
        </h2>

        <p style={{
          color: '#888', fontSize: '14px', maxWidth: '400px', margin: '0 auto 32px',
          fontFamily: 'Inter, sans-serif',
        }}>
          Aplica lo aprendido y transforma tu vida íntima para siempre.
        </p>

        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#E63946', color: 'white', padding: '14px 32px',
            borderRadius: '12px', fontWeight: 600, fontSize: '14px',
            textDecoration: 'none', fontFamily: 'Inter, sans-serif',
            boxShadow: '0 8px 30px rgba(230,57,70,0.25)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(230,57,70,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,57,70,0.25)'; }}
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
