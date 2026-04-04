'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  completed_lessons: number;
}

interface Module {
  id: number;
  title: string;
  description: string;
  position: number;
  lesson_count: number;
  is_published: boolean;
}

interface Lesson {
  id: number;
  module_id: number;
  module_title: string;
  title: string;
  description: string;
  video_embed: string;
  position: number;
  is_published: boolean;
  duration: string;
}

type Tab = 'users' | 'modules' | 'lessons';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AdminClient({ user: _user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);

  // Forms
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '123456', isAdmin: false });
  const [newLesson, setNewLesson] = useState({ moduleId: '', title: '', description: '', videoEmbed: '', duration: '', isFree: false });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [u, m, l] = await Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/modules').then(r => r.json()),
      fetch('/api/admin/lessons').then(r => r.json()),
    ]);
    setUsers(Array.isArray(u) ? u : []);
    setModules(Array.isArray(m) ? m : []);
    setLessons(Array.isArray(l) ? l : []);
    setLoading(false);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function toggleUserActive(userId: number, isActive: boolean) {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: isActive } : u));
  }

  async function deleteUser(userId: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== userId));
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const u = await res.json();
      setUsers(prev => [u, ...prev]);
      setNewUser({ name: '', email: '', password: '123456', isAdmin: false });
      setShowAddUser(false);
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLesson),
    });
    if (res.ok) {
      await loadAll();
      setNewLesson({ moduleId: '', title: '', description: '', videoEmbed: '', duration: '', isFree: false });
      setShowAddLesson(false);
    }
  }

  async function updateLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!editLesson) return;
    await fetch(`/api/admin/lessons/${editLesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editLesson.title,
        description: editLesson.description,
        videoEmbed: editLesson.video_embed,
        duration: editLesson.duration,
        isPublished: editLesson.is_published,
      }),
    });
    await loadAll();
    setEditLesson(null);
  }

  async function deleteLesson(lessonId: number) {
    if (!confirm('¿Eliminar esta clase?')) return;
    await fetch(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' });
    setLessons(prev => prev.filter(l => l.id !== lessonId));
  }

  const tabStyle = (t: Tab) => ({
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: tab === t ? '#E63946' : 'transparent',
    color: tab === t ? 'white' : '#999',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      {/* Header */}
      <header style={{ background: '#111', borderBottom: '1px solid #222', padding: '12px 16px' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" style={{ color: '#999', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Dashboard
            </Link>
            <span style={{ color: '#333' }}>|</span>
            <h1 style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '16px', color: 'white' }}>
              Panel Admin
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '13px' }}
          >
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Usuarios', value: users.length, icon: '👥' },
            { label: 'Módulos', value: modules.length, icon: '📚' },
            { label: 'Clases', value: lessons.length, icon: '🎬' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-inter)' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6" style={{ background: '#1A1A1A', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
          <button style={tabStyle('users')} onClick={() => setTab('users')}>Usuarios</button>
          <button style={tabStyle('modules')} onClick={() => setTab('modules')}>Módulos</button>
          <button style={tabStyle('lessons')} onClick={() => setTab('lessons')}>Clases</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Cargando...</div>
        ) : (
          <>
            {/* USERS TAB */}
            {tab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ color: 'white', fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '15px' }}>
                    Usuarios ({users.length})
                  </h2>
                  <button className="btn-red text-sm px-4 py-2" onClick={() => setShowAddUser(true)}>
                    + Agregar usuario
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #222' }}>
                        {['Nombre', 'Email', 'Clases', 'Estado', 'Acciones'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                          <td style={{ padding: '12px', color: 'white', fontSize: '13px' }}>
                            <div className="flex items-center gap-2">
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E63946', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{u.name}</span>
                              {u.is_admin && <span style={{ fontSize: '10px', background: 'rgba(230,57,70,0.15)', color: '#E63946', border: '1px solid rgba(230,57,70,0.3)', padding: '1px 6px', borderRadius: '4px' }}>Admin</span>}
                            </div>
                          </td>
                          <td style={{ padding: '12px', color: '#999', fontSize: '13px' }}>{u.email}</td>
                          <td style={{ padding: '12px', color: '#999', fontSize: '13px' }}>{u.completed_lessons}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: u.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: u.is_active ? '#22C55E' : '#666', border: `1px solid ${u.is_active ? 'rgba(34,197,94,0.3)' : '#333'}` }}>
                              {u.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleUserActive(u.id, !u.is_active)}
                                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: 'transparent', border: '1px solid #333', color: '#999', cursor: 'pointer' }}
                              >
                                {u.is_active ? 'Desactivar' : 'Activar'}
                              </button>
                              <button
                                onClick={() => deleteUser(u.id)}
                                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: 'transparent', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer' }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODULES TAB */}
            {tab === 'modules' && (
              <div>
                <h2 style={{ color: 'white', fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '15px', marginBottom: '16px' }}>
                  Módulos del Curso
                </h2>
                <div className="space-y-3">
                  {modules.map(m => (
                    <div key={m.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span style={{ background: '#E63946', color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                            #{m.position}
                          </span>
                          <div>
                            <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{m.title}</p>
                            <p style={{ color: '#666', fontSize: '12px' }}>{m.lesson_count} clases</p>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: m.is_published ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: m.is_published ? '#22C55E' : '#666', border: `1px solid ${m.is_published ? 'rgba(34,197,94,0.3)' : '#333'}` }}>
                          {m.is_published ? 'Publicado' : 'Oculto'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LESSONS TAB */}
            {tab === 'lessons' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ color: 'white', fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '15px' }}>
                    Clases ({lessons.length})
                  </h2>
                  <button className="btn-red text-sm px-4 py-2" onClick={() => setShowAddLesson(true)}>
                    + Agregar clase
                  </button>
                </div>

                <div className="space-y-2">
                  {lessons.map(lesson => (
                    <div key={lesson.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '14px 16px' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span style={{ fontSize: '10px', color: '#E63946', fontWeight: 600 }}>{lesson.module_title}</span>
                          </div>
                          <p style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>{lesson.title}</p>
                          {lesson.video_embed ? (
                            <p style={{ color: '#22C55E', fontSize: '11px', marginTop: '4px' }}>✓ Video configurado</p>
                          ) : (
                            <p style={{ color: '#E63946', fontSize: '11px', marginTop: '4px' }}>⚠ Sin video — haz clic en Editar para agregar el embed</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setEditLesson(lesson)}
                            style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '6px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteLesson(lesson.id)}
                            style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '6px', background: 'transparent', border: '1px solid #333', color: '#666', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: Add User */}
      {showAddUser && (
        <Modal title="Agregar Usuario" onClose={() => setShowAddUser(false)}>
          <form onSubmit={addUser} className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>Nombre</label>
              <input className="input-dark" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} required placeholder="Nombre completo" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>Email</label>
              <input className="input-dark" type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required placeholder="email@ejemplo.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>Contraseña</label>
              <input className="input-dark" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} required placeholder="123456" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isAdmin" checked={newUser.isAdmin} onChange={e => setNewUser(p => ({ ...p, isAdmin: e.target.checked }))} />
              <label htmlFor="isAdmin" style={{ fontSize: '13px', color: '#CCC', cursor: 'pointer' }}>Es administrador</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddUser(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'transparent', border: '1px solid #333', color: '#999', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button type="submit" className="btn-red" style={{ flex: 1, padding: '10px' }}>Agregar</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Add Lesson */}
      {showAddLesson && (
        <Modal title="Agregar Clase" onClose={() => setShowAddLesson(false)}>
          <form onSubmit={addLesson} className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>Módulo</label>
              <select className="input-dark" value={newLesson.moduleId} onChange={e => setNewLesson(p => ({ ...p, moduleId: e.target.value }))} required>
                <option value="">Seleccionar módulo...</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>Título</label>
              <input className="input-dark" value={newLesson.title} onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))} required placeholder="Título de la clase" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>Descripción (opcional)</label>
              <textarea className="input-dark" rows={2} value={newLesson.description} onChange={e => setNewLesson(p => ({ ...p, description: e.target.value }))} placeholder="Descripción breve..." style={{ resize: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>
                Embed del Video (Vturb / YouTube / Panda)
              </label>
              <textarea className="input-dark" rows={4} value={newLesson.videoEmbed} onChange={e => setNewLesson(p => ({ ...p, videoEmbed: e.target.value }))} placeholder='<iframe src="https://..." ...></iframe>' style={{ resize: 'none', fontFamily: 'monospace', fontSize: '12px' }} />
              <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>Pega aquí el código embed de Vturb, YouTube o cualquier plataforma de video.</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>Duración (ej: 15 min)</label>
              <input className="input-dark" value={newLesson.duration} onChange={e => setNewLesson(p => ({ ...p, duration: e.target.value }))} placeholder="15 min" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddLesson(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'transparent', border: '1px solid #333', color: '#999', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button type="submit" className="btn-red" style={{ flex: 1, padding: '10px' }}>Agregar</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Lesson */}
      {editLesson && (
        <Modal title="Editar Clase" onClose={() => setEditLesson(null)}>
          <form onSubmit={updateLesson} className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>Título</label>
              <input className="input-dark" value={editLesson.title} onChange={e => setEditLesson(p => p ? { ...p, title: e.target.value } : null)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>Descripción</label>
              <textarea className="input-dark" rows={2} value={editLesson.description || ''} onChange={e => setEditLesson(p => p ? { ...p, description: e.target.value } : null)} style={{ resize: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>
                🎬 Embed do Video (Vturb / YouTube / Panda)
              </label>
              <textarea
                className="input-dark"
                rows={5}
                value={editLesson.video_embed || ''}
                onChange={e => setEditLesson(p => p ? { ...p, video_embed: e.target.value } : null)}
                placeholder='<iframe src="https://..." width="100%" height="100%" frameborder="0" allowfullscreen></iframe>'
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
              />
              <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                Pega aquí el código embed de Vturb, YouTube, Panda Video o cualquier plataforma.
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px' }}>Duración</label>
              <input className="input-dark" value={editLesson.duration || ''} onChange={e => setEditLesson(p => p ? { ...p, duration: e.target.value } : null)} placeholder="15 min" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={editLesson.is_published}
                onChange={e => setEditLesson(p => p ? { ...p, is_published: e.target.checked } : null)}
              />
              <label htmlFor="isPublished" style={{ fontSize: '13px', color: '#CCC', cursor: 'pointer' }}>Publicada</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditLesson(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'transparent', border: '1px solid #333', color: '#999', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button type="submit" className="btn-red" style={{ flex: 1, padding: '10px' }}>Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#1A1A1A', border: '1px solid #333', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ color: 'white', fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '16px' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
