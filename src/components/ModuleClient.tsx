'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AvatarIcon from './AvatarIcon';

interface Lesson {
  id: number;
  title: string;
  description: string;
  video_embed: string;
  position: number;
  completed: boolean;
  duration: string;
  is_free: boolean;
  is_locked?: boolean;
  days_remaining?: number;
}

interface Module {
  id: number;
  title: string;
  description: string;
  position: number;
}

interface Comment {
  id: number;
  content: string;
  user_name: string;
  created_at: string;
}

interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}

export default function ModuleClient({
  module: mod,
  lessons,
  initialLesson,
  user,
}: {
  module: Module;
  lessons: Lesson[];
  initialLesson: Lesson | null;
  user: User;
}) {
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(initialLesson);
  const [lessonList, setLessonList] = useState<Lesson[]>(lessons);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { if (data.logo_url) setLogoUrl(data.logo_url); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeLesson) loadComments(activeLesson.id);
  }, [activeLesson]);

  async function loadComments(lessonId: number) {
    const res = await fetch(`/api/comments?lessonId=${lessonId}`);
    if (res.ok) setComments(await res.json());
  }

  async function markComplete(lessonId: number, completed: boolean) {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, completed }),
    });
    setLessonList(prev => prev.map(l => l.id === lessonId ? { ...l, completed } : l));
    if (activeLesson?.id === lessonId) {
      setActiveLesson(prev => prev ? { ...prev, completed } : null);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !activeLesson) return;
    setLoadingComment(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: activeLesson.id, content: newComment }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
    setLoadingComment(false);
  }

  async function deleteComment(commentId: number) {
    await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const completedCount = lessonList.filter(l => l.completed).length;
  const progress = lessonList.length > 0 ? Math.round((completedCount / lessonList.length) * 100) : 0;
  const currentIndex = activeLesson ? lessonList.findIndex(l => l.id === activeLesson.id) : -1;
  const hasNext = currentIndex < lessonList.length - 1;
  const hasPrev = currentIndex > 0;

  function goToNext() {
    if (hasNext) {
      setActiveLesson(lessonList[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goToPrev() {
    if (hasPrev) {
      setActiveLesson(lessonList[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
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
          <div className="relative">
<button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <AvatarIcon size={32} />
              </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50 animate-fade-in" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
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
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Video + Info Section */}
          <div className="flex-1 flex flex-col">
            {/* Video Player */}
            <div style={{ background: '#000' }}>
              {activeLesson?.video_embed ? (
                <div className="video-container" dangerouslySetInnerHTML={{ __html: activeLesson.video_embed }} />
              ) : (
                <div className="flex items-center justify-center" style={{ aspectRatio: '16/9', background: '#111' }}>
                  <div className="text-center px-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(230,57,70,0.1)', border: '2px solid rgba(230,57,70,0.3)' }}>
                      <svg width="28" height="28" fill="none" stroke="#E63946" strokeWidth="1.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <p className="text-sm" style={{ color: '#666' }}>{activeLesson ? 'Video próximamente disponible' : 'Selecciona una clase'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Breadcrumb + Title */}
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 text-xs mb-2" style={{ color: '#666' }}>
                <Link href="/dashboard" style={{ color: '#888', textDecoration: 'none' }}>Inicio</Link>
                <span>&gt;</span>
                <span style={{ color: '#AAA' }}>{mod.title.replace(/^Módulo #\d+:\s*/, '')}</span>
              </div>
              <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-inter)', lineHeight: 1.4 }}>
                {activeLesson?.title || 'Selecciona una clase'}
              </h1>
              {activeLesson?.description && (
                <p className="mt-2" style={{ color: '#888', fontSize: '14px', lineHeight: 1.6 }}>{activeLesson.description}</p>
              )}
            </div>

            {/* Action Bar */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  {activeLesson && (
                    <button
                      onClick={() => markComplete(activeLesson.id, !activeLesson.completed)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: activeLesson.completed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${activeLesson.completed ? 'rgba(34,197,94,0.3)' : '#333'}`,
                        color: activeLesson.completed ? '#22C55E' : '#999',
                        cursor: 'pointer',
                      }}
                    >
                      {activeLesson.completed ? (
                        <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Completada</>
                      ) : (
                        <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>Marcar como vista</>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasPrev && (
                    <button onClick={goToPrev} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#999', cursor: 'pointer' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                      <span className="hidden sm:inline">Anterior</span>
                    </button>
                  )}
                  {hasNext && (
                    <button onClick={goToNext} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: '#E63946', border: 'none', color: 'white', cursor: 'pointer' }}>
                      Siguiente
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile: Lessons list (shown before comments on mobile) */}
            <div className="lg:hidden px-4 pb-4 order-first-mobile" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between pt-4 mb-3">
                <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
                  Clases del módulo
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', fontSize: '11px' }}>
                  {completedCount}/{lessonList.length}
                </span>
              </div>
              <div className="space-y-1">
                {lessonList.map((lesson, idx) => (
                  <LessonItem key={lesson.id} lesson={lesson} index={idx + 1} isActive={activeLesson?.id === lesson.id} onClick={() => { setActiveLesson(lesson); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                ))}
              </div>
            </div>

            {/* Comments Section */}
            {activeLesson && (
              <div className="px-4 pb-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="pt-4 mb-4" style={{ color: 'white', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>
                  Comentarios ({comments.length})
                </h3>
                <form onSubmit={submitComment} className="mb-6">
                  <div className="flex gap-3">
                    <AvatarIcon size={32} />
                    <div className="flex-1">
                      <textarea
                        className="input-dark w-full"
                        rows={2}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Escribe un comentario..."
                        style={{ resize: 'none', fontSize: '14px' }}
                      />
                      <div className="flex justify-end mt-2">
                        <button type="submit" disabled={loadingComment || !newComment.trim()} className="btn-red text-sm px-4 py-2" style={{ opacity: loadingComment || !newComment.trim() ? 0.5 : 1 }}>
                          {loadingComment ? 'Enviando...' : 'Comentar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <AvatarIcon size={32} bgColor="#333" iconColor="#999" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium" style={{ color: 'white' }}>{comment.user_name}</span>
                          <span className="text-xs" style={{ color: '#555' }}>{new Date(comment.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                        <p className="text-sm" style={{ color: '#AAA', lineHeight: 1.5 }}>{comment.content}</p>
                        {user.isAdmin && (
                          <button onClick={() => deleteComment(comment.id)} className="text-xs mt-1" style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center py-6" style={{ color: '#444', fontSize: '14px' }}>Sé el primero en comentar</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block" style={{ width: '320px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', background: '#0D0D0D' }}>
            <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>Clases</h3>
                <span className="text-xs" style={{ color: '#666' }}>{completedCount}/{lessonList.length}</span>
              </div>
              <div className="progress-bar" style={{ height: '4px' }}>
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
              {lessonList.map((lesson, idx) => (
                <LessonItem key={lesson.id} lesson={lesson} index={idx + 1} isActive={activeLesson?.id === lesson.id} onClick={() => { setActiveLesson(lesson); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              ))}
            </div>
          </aside>
        </div>


      </div>
    </div>
  );
}

function LessonItem({ lesson, index, isActive, onClick }: { lesson: Lesson; index: number; isActive: boolean; onClick: () => void }) {
  const isLocked = lesson.is_locked || false;
  const daysRemaining = lesson.days_remaining || 0;

  return (
    <button
      onClick={() => { if (!isLocked) onClick(); }}
      className="w-full text-left transition-all duration-200"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: isActive && !isLocked ? 'rgba(230,57,70,0.08)' : 'transparent',
        borderLeft: isActive && !isLocked ? '3px solid #E63946' : '3px solid transparent',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        border: 'none',
        borderRadius: '8px',
        opacity: isLocked ? 0.5 : 1,
      }}
      onMouseEnter={e => { if (!isActive && !isLocked) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={e => { if (!isActive && !isLocked) e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="flex-shrink-0">
        {isLocked ? (
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <svg width="10" height="10" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
        ) : lesson.completed ? (
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#22C55E' }}>
            <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: isActive ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.05)', color: isActive ? '#E63946' : '#666', border: `1px solid ${isActive ? 'rgba(230,57,70,0.4)' : '#333'}` }}>
            {index}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ color: isLocked ? '#666' : isActive ? '#E63946' : lesson.completed ? '#888' : 'white', fontSize: '13px', fontWeight: isActive && !isLocked ? 600 : 400, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lesson.title}
        </p>
        {isLocked ? (
          <p style={{ color: '#F59E0B', fontSize: '11px', marginTop: '2px' }}>Disponible en {daysRemaining} día{daysRemaining !== 1 ? 's' : ''}</p>
        ) : (
          lesson.duration && <p style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>{lesson.duration}</p>
        )}
      </div>
    </button>
  );
}
