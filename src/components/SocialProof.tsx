'use client';

import { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════
// CONTADOR CONSISTENTE — mesmo número em todas as páginas
// Base: 1890 em 05/04/2026, sobe 1-3 por dia (determinístico)
// ═══════════════════════════════════════════════════
function getMemberCount(): number {
  const baseDate = new Date('2026-04-05');
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let count = 1890;
  for (let i = 0; i < Math.max(0, diffDays); i++) {
    // Pseudo-random determinístico baseado no dia
    const seed = (i * 7 + 13) % 17;
    count += (seed % 3) + 1; // 1, 2 ou 3 por dia
  }
  return count;
}

// ═══════════════════════════════════════════════════
// DEPOIMENTOS
// ═══════════════════════════════════════════════════
const testimonials = [
  {
    name: 'Carlos M.',
    location: 'Madrid, España',
    avatar: '👨🏻',
    text: 'Llevaba años pensando que sabía todo, hasta que empecé este programa. Mi pareja notó la diferencia desde la primera semana. No exagero.',
    rating: 5,
    time: 'hace 3 días',
  },
  {
    name: 'Diego R.',
    location: 'Buenos Aires, Argentina',
    avatar: '👨🏽‍🦱',
    text: 'Lo mejor es que es directo, sin rodeos. Apliqué lo del módulo 3 y los resultados fueron inmediatos. Mi confianza cambió por completo.',
    rating: 5,
    time: 'hace 1 semana',
  },
  {
    name: 'Andrés L.',
    location: 'Bogotá, Colombia',
    avatar: '🧔🏽',
    text: 'Al principio dudé, pero después del primer módulo entendí que esto vale mucho más de lo que pagué. Información que nadie te enseña.',
    rating: 5,
    time: 'hace 5 días',
  },
  {
    name: 'Mateo S.',
    location: 'Santiago, Chile',
    avatar: '👨🏻‍🦳',
    text: 'Mi relación mejoró completamente. Ella misma me preguntó qué había cambiado. Este programa debería ser obligatorio.',
    rating: 5,
    time: 'hace 2 semanas',
  },
  {
    name: 'Javier P.',
    location: 'Lima, Perú',
    avatar: '👨🏾',
    text: 'Contenido de otro nivel. Ojalá hubiera encontrado esto antes. Cada módulo supera al anterior.',
    rating: 5,
    time: 'hace 4 días',
  },
  {
    name: 'Roberto F.',
    location: 'CDMX, México',
    avatar: '🧑🏽',
    text: 'Pensé que era solo teoría, pero todo es aplicable desde el día uno. Los resultados hablan por sí solos. 100% recomendado.',
    rating: 5,
    time: 'hace 1 semana',
  },
  {
    name: 'Fernando G.',
    location: 'Medellín, Colombia',
    avatar: '👨🏿‍🦱',
    text: 'Después de 12 años de relación, logré sorprender a mi esposa como si fuera la primera vez. Eso no tiene precio.',
    rating: 5,
    time: 'hace 6 días',
  },
  {
    name: 'Lucas T.',
    location: 'Montevideo, Uruguay',
    avatar: '👨🏼',
    text: 'Lo que más valoro es la calidad del contenido. No es el típico curso genérico. Se nota que hay investigación real detrás.',
    rating: 5,
    time: 'hace 2 semanas',
  },
  {
    name: 'Sebastián V.',
    location: 'Quito, Ecuador',
    avatar: '🧔🏻',
    text: 'Empecé por curiosidad y terminé aplicando todo. Mi vida íntima dio un giro de 180 grados. Gracias por este programa.',
    rating: 5,
    time: 'hace 3 días',
  },
  {
    name: 'Nicolás H.',
    location: 'San José, Costa Rica',
    avatar: '👨🏾‍🦳',
    text: 'El módulo sobre comunicación fue un antes y un después. Aprendí cosas que jamás me habían explicado. Increíble.',
    rating: 5,
    time: 'hace 1 semana',
  },
  {
    name: 'Alejandro D.',
    location: 'Caracas, Venezuela',
    avatar: '🧑🏻‍⚕️',
    text: 'Soy médico y aun así aprendí cosas nuevas. El enfoque práctico es lo que hace la diferencia con cualquier otro material.',
    rating: 5,
    time: 'hace 5 días',
  },
  {
    name: 'Gabriel C.',
    location: 'Barcelona, España',
    avatar: '👨🏼‍🦱',
    text: 'Mi novia me dijo que soy otro hombre. Literal. Este programa te transforma la mentalidad y la técnica al mismo tiempo.',
    rating: 5,
    time: 'hace 4 días',
  },
];

// ═══════════════════════════════════════════════════
// ESTRELAS
// ═══════════════════════════════════════════════════
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ANIMATED COUNTER
// ═══════════════════════════════════════════════════
function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {count.toLocaleString('es-ES')}
    </span>
  );
}

// ═══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — versão compacta para login
// ═══════════════════════════════════════════════════
export function SocialProofCompact() {
  const memberCount = getMemberCount();

  return (
    <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Contador */}
      <div className="flex items-center justify-center gap-2 py-4">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.5)', animation: 'pulse 2s infinite' }}
        />
        <p className="text-xs" style={{ color: '#888' }}>
          <span style={{ color: '#E63946', fontWeight: 600 }}>+<AnimatedCounter target={memberCount} /></span> hombres ya transformaron su vida
        </p>
      </div>

      {/* Carrossel de depoimentos — 3 visíveis */}
      <div className="overflow-hidden pb-4 px-2">
        <div
          className="flex gap-3"
          style={{
            animation: 'scrollTestimonials 40s linear infinite',
            width: 'max-content',
          }}
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={i}
              className="rounded-lg p-3 flex-shrink-0"
              style={{
                width: '220px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Stars count={t.rating} />
              <p className="text-xs mt-2 leading-relaxed" style={{ color: '#BBB' }}>
                &ldquo;{t.text.substring(0, 80)}...&rdquo;
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{t.avatar}</span>
                <span className="text-xs font-medium" style={{ color: '#999' }}>{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollTestimonials {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — versão completa para dashboard
// ═══════════════════════════════════════════════════
export function SocialProofFull() {
  const memberCount = getMemberCount();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, []);

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header com contador */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(230,57,70,0.1) 0%, rgba(230,57,70,0.05) 100%)',
                border: '1px solid rgba(230,57,70,0.15)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.5)', animation: 'pulse 2s infinite' }}
              />
              <span className="text-sm font-semibold" style={{ color: '#E63946' }}>
                +<AnimatedCounter target={memberCount} />
              </span>
              <span className="text-sm" style={{ color: '#999' }}>miembros activos</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'white', fontFamily: 'var(--font-playfair)' }}>
            Lo que dicen nuestros miembros
          </h3>
          <p className="text-xs mt-1" style={{ color: '#666' }}>Resultados reales de hombres que decidieron dar el paso</p>
        </div>

        {/* Carrossel com setas */}
        <div className="relative">
          {/* Seta esquerda */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Seta direita */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Fade nas bordas */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-[5]" style={{ background: 'linear-gradient(to right, #0A0A0A, transparent)' }} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-[5]" style={{ background: 'linear-gradient(to left, #0A0A0A, transparent)' }} />

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 px-4"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-xl p-5 flex-shrink-0 transition-all duration-300"
                style={{
                  width: '300px',
                  scrollSnapAlign: 'start',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(230,57,70,0.2)';
                  e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)';
                }}
              >
                {/* Aspas decorativas */}
                <div className="mb-3" style={{ color: 'rgba(230,57,70,0.3)', fontSize: '28px', lineHeight: 1, fontFamily: 'Georgia, serif' }}>
                  &ldquo;
                </div>

                <p className="text-sm leading-relaxed mb-4" style={{ color: '#CCC' }}>
                  {t.text}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(230,57,70,0.12) 0%, rgba(230,57,70,0.05) 100%)',
                        border: '1px solid rgba(230,57,70,0.15)',
                        fontSize: '22px',
                        lineHeight: 1,
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'white' }}>{t.name}</p>
                      <p className="text-xs" style={{ color: '#666' }}>{t.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Stars count={t.rating} />
                    <p className="text-xs mt-0.5" style={{ color: '#555' }}>{t.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating geral */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Stars count={5} />
          <span className="text-sm" style={{ color: '#999' }}>4.9 de 5 — basado en +{memberCount.toLocaleString('es-ES')} miembros</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
