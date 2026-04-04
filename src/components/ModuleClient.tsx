'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lesson {
  id: number;
  title: string;
  description: string;
  video_embed: string;
  position: number;
  completed: boolean;
  duration: string;
  is_free: boolean;
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
  module,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setLessonList(prev =>
      prev.map(l => l.id === lessonId ? { ...l, completed } : l)
    );
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

  const nextLesson = activeLesson
    ? lessonList.find(l => l.position === activeLesson.position + 1) || null
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(10,10,10,0.97)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #222',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Back + Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm transition-colors hover:text-white"
              style={{ color: '#999', textDecoration: 'none' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className="hidden sm:inline">Volver</span>
            </Link>
            <div
              className="w-px h-4"
              style={{ background: '#333' }}
            />
            <span
              className="text-sm font-semibold truncate max-w-[160px] sm:max-w-xs"
              style={{ color: 'white', fontFamily: 'var(--font-inter)' }}
            >
              {module.title}
            </span>
          </div>

          {/* Right: Sidebar toggle (mobile) + User */}
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              className="lg:hidden flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: '#1A1A1A', border: '1px solid #333', color: '#CCC', cursor: 'pointer' }}
              onClick={() => setSidebarOpen(true)}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Clases
            </button>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: '#E63946', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden"
                  style={{ background: '#1A1A1A', border: '1px solid #333', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 100 }}
                >
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-[#242424]"
                      style={{ color: '#E63946', textDecoration: 'none' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-[#242424]"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', textAlign: 'left' }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video + Comments Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Video Player */}
          <div style={{ background: '#000', borderBottom: '1px solid #1A1A1A' }}>
            {activeLesson?.video_embed ? (
              <div
                className="video-container"
                style={{ maxHeight: '70vh' }}
                dangerouslySetInnerHTML={{ __html: activeLesson.video_embed }}
              />
            ) : (
              <div
                className="flex items-center justify-center"
                style={{ aspectRatio: '16/9', maxHeight: '70vh', background: '#111' }}
              >
                <div className="text-center px-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(230,57,70,0.1)', border: '2px solid rgba(230,57,70,0.3)' }}
                  >
                    <svg width="32" height="32" fill="none" stroke="#E63946" strokeWidth="1.5" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                  <p className="text-sm mb-1" style={{ color: '#999' }}>
                    {activeLesson ? 'Video próximamente disponible' : 'Selecciona una clase para comenzar'}
                  </p>
                  {activeLesson && (
                    <p className="text-xs" style={{ color: '#555' }}>
                      El administrador aún no ha agregado el video
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          {activeLesson && (
            <div className="px-4 py-5 max-w-4xl">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs" style={{ color: '#666' }}>
                      Clase {activeLesson.position}
                    </span>
                    {activeLesson.duration && (
                      <>
                        <span style={{ color: '#444' }}>·</span>
                        <span className="text-xs" style={{ color: '#666' }}>{activeLesson.duration}</span>
                      </>
                    )}
                  </div>
                  <h1
                    className="text-xl md:text-2xl font-bold mb-2"
                    style={{ fontFamily: 'var(--font-playfair)', color: 'white', lineHeight: 1.3 }}
                  >
                    {activeLesson.title}
                  </h1>
                  {activeLesson.description && (
                    <p className="text-sm" style={{ color: '#999', lineHeight: 1.6 }}>
                      {activeLesson.description}
                    </p>
                  )}
                </div>

                {/* Mark Complete Button */}
                <button
                  onClick={() => markComplete(activeLesson.id, !activeLesson.completed)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeLesson.completed ? 'rgba(34,197,94,0.15)' : 'rgba(230,57,70,0.15)',
                    border: `1px solid ${activeLesson.completed ? 'rgba(34,197,94,0.4)' : 'rgba(230,57,70,0.4)'}`,
                    color: activeLesson.completed ? '#22C55E' : '#E63946',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeLesson.completed ? (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Completada
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                      Marcar completa
                    </>
                  )}
                </button>
              </div>

              {/* Next Lesson */}
              {nextLesson && (
                <div
                  className="flex items-center justify-between p-3 rounded-xl mb-6"
                  style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(230,57,70,0.1)' }}
                    >
                      <svg width="14" height="14" fill="none" stroke="#E63946" strokeWidth="2" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: '#666' }}>Siguiente clase</p>
                      <p className="text-sm font-medium" style={{ color: '#CCC' }}>{nextLesson.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveLesson(nextLesson)}
                    className="btn-red text-xs px-3 py-2"
                  >
                    Continuar →
                  </button>
                </div>
              )}

              {/* Comments Section */}
              <div>
                <h3 className="text-base font-semibold mb-4" style={{ color: 'white', fontFamily: 'var(--font-inter)' }}>
                  Comentarios ({comments.length})
                </h3>

                {/* Comment Form */}
                <form onSubmit={submitComment} className="mb-6">
                  <div className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                      style={{ background: '#E63946', color: 'white' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Escribe un comentario..."
                        rows={3}
                        className="input-dark resize-none"
                        style={{ fontSize: '14px' }}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={loadingComment || !newComment.trim()}
                          className="btn-red text-sm px-4 py-2"
                          style={{ opacity: loadingComment || !newComment.trim() ? 0.6 : 1 }}
                        >
                          Comentar
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: '#555' }}>
                      Sé el primero en comentar esta clase
                    </p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: '#2A2A2A', color: '#CCC' }}
                        >
                          {comment.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium" style={{ color: 'white' }}>{comment.user_name}</span>
                            <span className="text-xs" style={{ color: '#555' }}>
                              {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                            {user.isAdmin && (
                              <button
                                onClick={() => deleteComment(comment.id)}
                                className="ml-auto text-xs"
                                style={{ color: '#E63946', background: 'none', border: 'none', cursor: 'pointer' }}
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: '#CCC', lineHeight: 1.6 }}>{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — Desktop */}
        <aside
          className="hidden lg:flex flex-col"
          style={{
            width: '320px',
            background: '#111',
            borderLeft: '1px solid #222',
            height: 'calc(100vh - 57px)',
            position: 'sticky',
            top: '57px',
            overflowY: 'auto',
          }}
        >
          <SidebarContent
            module={module}
            lessons={lessonList}
            activeLesson={activeLesson}
            completedCount={completedCount}
            progress={progress}
            onSelectLesson={setActiveLesson}
            onClose={() => {}}
          />
        </aside>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 'min(320px, 90vw)',
              background: '#111',
              borderLeft: '1px solid #222',
              overflowY: 'auto',
            }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#222' }}>
              <span className="font-semibold text-sm" style={{ color: 'white' }}>Clases del módulo</span>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <SidebarContent
              module={module}
              lessons={lessonList}
              activeLesson={activeLesson}
              completedCount={completedCount}
              progress={progress}
              onSelectLesson={(lesson) => { setActiveLesson(lesson); setSidebarOpen(false); }}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </>
      )}
    </div>
  );
}

function SidebarContent({
  module,
  lessons,
  activeLesson,
  completedCount,
  progress,
  onSelectLesson,
}: {
  module: Module;
  lessons: Lesson[];
  activeLesson: Lesson | null;
  completedCount: number;
  progress: number;
  onSelectLesson: (lesson: Lesson) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Module Header */}
      <div className="p-4 border-b" style={{ borderColor: '#222' }}>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ background: '#E63946', color: 'white' }}
          >
            Módulo {module.position}
          </span>
        </div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'white', fontFamily: 'var(--font-inter)', lineHeight: 1.4 }}>
          {module.title}
        </h3>
        {/* Progress */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: '#666' }}>{completedCount}/{lessons.length} clases</span>
            <span className="text-xs font-medium" style={{ color: progress === 100 ? '#22C55E' : '#E63946' }}>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%`, background: progress === 100 ? '#22C55E' : '#E63946' }}
            />
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson)}
            className="w-full text-left p-3 rounded-xl transition-all"
            style={{
              background: activeLesson?.id === lesson.id ? 'rgba(230,57,70,0.12)' : 'transparent',
              border: `1px solid ${activeLesson?.id === lesson.id ? 'rgba(230,57,70,0.4)' : 'transparent'}`,
              cursor: 'pointer',
            }}
          >
            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: lesson.completed
                    ? 'rgba(34,197,94,0.2)'
                    : activeLesson?.id === lesson.id
                    ? 'rgba(230,57,70,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${lesson.completed ? '#22C55E' : activeLesson?.id === lesson.id ? '#E63946' : '#333'}`,
                }}
              >
                {lesson.completed ? (
                  <svg width="10" height="10" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : activeLesson?.id === lesson.id ? (
                  <svg width="8" height="8" fill="#E63946" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                ) : (
                  <span className="text-xs" style={{ color: '#555' }}>{lesson.position}</span>
                )}
              </div>

              {/* Lesson Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium leading-tight"
                  style={{
                    color: activeLesson?.id === lesson.id ? 'white' : lesson.completed ? '#888' : '#CCC',
                    lineHeight: 1.4,
                  }}
                >
                  {lesson.title}
                </p>
                {lesson.duration && (
                  <p className="text-xs mt-0.5" style={{ color: '#555' }}>{lesson.duration}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
