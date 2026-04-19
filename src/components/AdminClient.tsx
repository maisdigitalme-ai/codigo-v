'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AvatarIcon from './AvatarIcon';

interface User { id: number; name: string; email: string; is_admin: boolean; is_active: boolean; status: string; created_at: string; }
interface Course { id: number; title: string; description: string; thumbnail_url: string; position: number; is_published: boolean; slug: string; content_type: string; module_count: number; drip_enabled: boolean; drip_days: number; }
interface Module { id: number; title: string; description: string; thumbnail_url: string; position: number; is_published: boolean; lesson_count: number; course_id: number | null; course_group: string; drip_enabled: boolean; drip_days: number; }
interface Lesson { id: number; module_id: number; title: string; description: string; video_embed: string; position: number; is_published: boolean; is_free: boolean; duration: string; module_title: string; drip_enabled: boolean; drip_days: number; }

export default function AdminClient({ userName, userEmail }: { userName: string; userEmail: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<'settings' | 'users' | 'courses' | 'modules' | 'lessons'>('settings');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings state
  const [bannerUrl, setBannerUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [siteTitle, setSiteTitle] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [editModule, setEditModule] = useState<Module | null>(null);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '123456', isAdmin: false });
  const [editUser, setEditUser] = useState<(User & { password?: string }) | null>(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnailUrl: '', contentType: 'video' });
  const [newModule, setNewModule] = useState({ title: '', description: '', thumbnailUrl: '', courseId: '' });
  const [newLesson, setNewLesson] = useState({ moduleId: '', title: '', description: '', videoEmbed: '', duration: '' });

  // Inline module title editing in Lessons tab
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [savingModuleTitle, setSavingModuleTitle] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [uRes, cRes, mRes, lRes, sRes] = await Promise.all([
      fetch('/api/admin/users'), fetch('/api/admin/courses'), fetch('/api/admin/modules'), fetch('/api/admin/lessons'), fetch('/api/admin/settings')
    ]);
    if (uRes.ok) setUsers(await uRes.json());
    if (cRes.ok) setCourses(await cRes.json());
    if (mRes.ok) setModules(await mRes.json());
    if (lRes.ok) setLessons(await lRes.json());
    if (sRes.ok) {
      const s = await sRes.json();
      setBannerUrl(s.banner_url || '');
      setLogoUrl(s.logo_url || '');
      setSiteTitle(s.site_title || '');
    }
    setLoading(false);
  }

  async function saveSettings() {
    setSavingSettings(true);
    await Promise.all([
      fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'banner_url', value: bannerUrl }) }),
      fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'logo_url', value: logoUrl }) }),
      fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'site_title', value: siteTitle }) }),
    ]);
    setSavingSettings(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
    if (res.ok) { setShowAddUser(false); setNewUser({ name: '', email: '', password: '123456', isAdmin: false }); loadAll(); }
  }

  async function toggleUser(id: number, isActive: boolean) {
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive }) });
    loadAll();
  }

  async function updateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    const body: any = { name: editUser.name, email: editUser.email, isAdmin: editUser.is_admin, isActive: editUser.is_active };
    if (editUser.password && editUser.password.trim() !== '') body.password = editUser.password;
    await fetch(`/api/admin/users/${editUser.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setEditUser(null);
    loadAll();
  }

  async function deleteUser(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function approveUser(id: number) {
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: true, status: 'approved' }) });
    loadAll();
  }

  async function rejectUser(id: number) {
    if (!confirm('¿Rechazar y eliminar esta solicitud de acceso?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    loadAll();
  }

  // ═══ COURSES ═══
  async function addCourse(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCourse) });
    if (res.ok) { setShowAddCourse(false); setNewCourse({ title: '', description: '', thumbnailUrl: '', contentType: 'video' }); loadAll(); }
  }

  async function updateCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!editCourse) return;
    await fetch(`/api/admin/courses/${editCourse.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editCourse.title, description: editCourse.description, thumbnailUrl: editCourse.thumbnail_url, isPublished: editCourse.is_published, contentType: editCourse.content_type, dripEnabled: editCourse.drip_enabled, dripDays: editCourse.drip_days }),
    });
    setEditCourse(null);
    loadAll();
  }

  async function deleteCourse(id: number) {
    if (!confirm('¿Eliminar este curso? Los módulos se desvinculan pero no se eliminan.')) return;
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
    loadAll();
  }

  // ═══ MODULES ═══
  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    const courseId = newModule.courseId ? parseInt(newModule.courseId) : null;
    const course = courses.find(c => c.id === courseId);
    const courseGroup = course?.slug || 'codigo-v';
    const res = await fetch('/api/admin/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newModule, courseId, courseGroup }) });
    if (res.ok) { setShowAddModule(false); setNewModule({ title: '', description: '', thumbnailUrl: '', courseId: '' }); loadAll(); }
  }

  async function updateModule(e: React.FormEvent) {
    e.preventDefault();
    if (!editModule) return;
    await fetch(`/api/admin/modules/${editModule.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editModule.title, description: editModule.description, thumbnailUrl: editModule.thumbnail_url, isPublished: editModule.is_published, courseId: editModule.course_id, dripEnabled: editModule.drip_enabled, dripDays: editModule.drip_days }),
    });
    setEditModule(null);
    loadAll();
  }

  async function deleteModule(id: number) {
    if (!confirm('¿Eliminar este módulo y todas sus clases?')) return;
    await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' });
    loadAll();
  }

  // ═══ LESSONS ═══
  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/lessons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newLesson) });
    if (res.ok) { setShowAddLesson(false); setNewLesson({ moduleId: '', title: '', description: '', videoEmbed: '', duration: '' }); loadAll(); }
  }

  async function updateLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!editLesson) return;
    await fetch(`/api/admin/lessons/${editLesson.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editLesson.title, description: editLesson.description, videoEmbed: editLesson.video_embed, isPublished: editLesson.is_published, isFree: editLesson.is_free, duration: editLesson.duration, dripEnabled: editLesson.drip_enabled, dripDays: editLesson.drip_days }) });
    setEditLesson(null);
    loadAll();
  }

  async function deleteLesson(id: number) {
    if (!confirm('¿Eliminar esta clase?')) return;
    await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
    loadAll();
  }

  // ═══ INLINE MODULE TITLE EDIT (from Lessons tab) ═══
  function startEditModuleTitle(moduleId: number, currentTitle: string) {
    setEditingModuleId(moduleId);
    setEditingModuleTitle(currentTitle);
  }

  async function saveModuleTitle(moduleId: number) {
    if (!editingModuleTitle.trim()) return;
    setSavingModuleTitle(true);
    await fetch(`/api/admin/modules/${moduleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editingModuleTitle.trim() }),
    });
    setSavingModuleTitle(false);
    setEditingModuleId(null);
    setEditingModuleTitle('');
    loadAll();
  }

  function cancelEditModuleTitle() {
    setEditingModuleId(null);
    setEditingModuleTitle('');
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const tabs = [
    { id: 'settings' as const, label: 'Configuración', icon: '⚙️' },
    { id: 'users' as const, label: 'Usuarios', icon: '👥' },
    { id: 'courses' as const, label: 'Cursos', icon: '📚' },
    { id: 'modules' as const, label: 'Módulos', icon: '📦' },
    { id: 'lessons' as const, label: 'Clases', icon: '🎬' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <span style={{ color: '#333' }}>/</span>
            <span style={{ color: '#E63946', fontSize: '14px', fontWeight: 600 }}>Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block" style={{ color: '#666' }}>{userName}</span>
            <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#999', cursor: 'pointer' }}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: tab === t.id ? 'rgba(230,57,70,0.1)' : 'transparent',
                border: `1px solid ${tab === t.id ? 'rgba(230,57,70,0.3)' : 'transparent'}`,
                color: tab === t.id ? '#E63946' : '#666',
                cursor: 'pointer',
              }}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E63946', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* SETTINGS TAB */}
            {tab === 'settings' && (
              <div className="space-y-6">
                <h2 style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Configuración del Sitio</h2>
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '8px', fontWeight: 600 }}>Banner / Imagen de Portada</label>
                  {bannerUrl && (
                    <div className="mb-3 rounded-lg overflow-hidden" style={{ background: '#000' }}>
                      <img src={bannerUrl} alt="Banner preview" style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }} />
                    </div>
                  )}
                  <input className="input-dark" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} placeholder="URL de la imagen del banner (ej: https://...)" />
                  <p style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>Pega la URL de la imagen que quieres usar como banner principal. Recomendado: 1500x400px.</p>
                </div>
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '8px', fontWeight: 600 }}>Logo</label>
                  {logoUrl && (
                    <div className="mb-3 p-4 rounded-lg" style={{ background: '#111' }}>
                      <img src={logoUrl} alt="Logo preview" style={{ height: '40px', objectFit: 'contain' }} />
                    </div>
                  )}
                  <input className="input-dark" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="URL del logo (ej: https://...)" />
                </div>
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '8px', fontWeight: 600 }}>Título del Sitio</label>
                  <input className="input-dark" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} placeholder="Código V" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={saveSettings} disabled={savingSettings} className="btn-red px-6 py-3" style={{ opacity: savingSettings ? 0.6 : 1 }}>
                    {savingSettings ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                  {settingsSaved && <span className="text-sm animate-fade-in" style={{ color: '#22C55E' }}>✓ Guardado correctamente</span>}
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {tab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Usuarios ({users.length})</h2>
                    {users.filter(u => u.status === 'pending').length > 0 && (
                      <p className="text-xs mt-0.5" style={{ color: '#F59E0B' }}>
                        ⚠️ {users.filter(u => u.status === 'pending').length} solicitud(es) pendiente(s) de aprobación
                      </p>
                    )}
                  </div>
                  <button className="btn-red text-sm px-4 py-2" onClick={() => setShowAddUser(true)}>+ Agregar</button>
                </div>
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} style={{
                      background: u.status === 'pending' ? 'rgba(245,158,11,0.05)' : '#1A1A1A',
                      border: u.status === 'pending' ? '1px solid rgba(245,158,11,0.3)' : '1px solid #2A2A2A',
                      borderRadius: '10px', padding: '14px 16px'
                    }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <AvatarIcon size={32} bgColor={u.is_admin ? '#E63946' : u.status === 'pending' ? '#7A5C00' : '#333'} iconColor="white" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate" style={{ color: 'white' }}>{u.name}</p>
                              {u.is_admin && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946', fontSize: '10px' }}>Admin</span>}
                              {u.status === 'pending' && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontSize: '10px' }}>⏳ Pendiente</span>}
                            </div>
                            <p className="text-xs truncate" style={{ color: '#666' }}>{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {u.status === 'pending' ? (
                            <>
                              <button onClick={() => approveUser(u.id)} className="text-xs px-3 py-1 rounded font-medium" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22C55E', cursor: 'pointer' }}>
                                ✓ Aprobar
                              </button>
                              <button onClick={() => rejectUser(u.id)} className="text-xs px-2 py-1 rounded" style={{ background: 'transparent', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer' }}>
                                ✕ Rechazar
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: u.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: u.is_active ? '#22C55E' : '#666' }}>
                                {u.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                              <button onClick={() => setEditUser({ ...u, password: '' })} className="text-xs px-2 py-1 rounded" style={{ background: 'transparent', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer' }}>
                                Editar
                              </button>
                              <button onClick={() => toggleUser(u.id, u.is_active)} className="text-xs px-2 py-1 rounded" style={{ background: 'transparent', border: '1px solid #333', color: '#999', cursor: 'pointer' }}>
                                {u.is_active ? 'Desactivar' : 'Activar'}
                              </button>
                              <button onClick={() => deleteUser(u.id)} className="text-xs px-2 py-1 rounded" style={{ background: 'transparent', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer' }}>
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════ */}
            {/* COURSES TAB */}
            {/* ═══════════════════════════════════════ */}
            {tab === 'courses' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Cursos ({courses.length})</h2>
                  <button className="btn-red text-sm px-4 py-2" onClick={() => setShowAddCourse(true)}>+ Nuevo Curso</button>
                </div>
                <p className="text-xs mb-4" style={{ color: '#666' }}>Los cursos agrupan módulos en el dashboard. Cada curso aparece como una sección separada.</p>
                <div className="space-y-3">
                  {courses.map(c => (
                    <div key={c.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px' }}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          {c.thumbnail_url ? (
                            <img src={c.thumbnail_url} alt={c.title} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                          ) : (
                            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '56px', height: '56px', borderRadius: '8px', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)' }}>
                              <span style={{ fontSize: '20px' }}>📚</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'white' }}>{c.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs" style={{ color: '#888' }}>{c.module_count} módulos</span>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: c.content_type === 'pdf' ? 'rgba(59,130,246,0.15)' : 'rgba(230,57,70,0.15)', color: c.content_type === 'pdf' ? '#3B82F6' : '#E63946', fontSize: '10px' }}>
                                {c.content_type === 'pdf' ? 'PDF' : 'Video'}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: c.is_published ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: c.is_published ? '#22C55E' : '#666', fontSize: '10px' }}>
                                {c.is_published ? 'Publicado' : 'Oculto'}
                              </span>
                            </div>
                            {c.description && <p className="text-xs mt-1 truncate" style={{ color: '#555' }}>{c.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => setEditCourse(c)} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer' }}>
                            Editar
                          </button>
                          <button onClick={() => deleteCourse(c.id)} className="text-xs px-2 py-1.5 rounded-lg" style={{ background: 'transparent', border: '1px solid #333', color: '#666', cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Modules in this course */}
                      {(() => {
                        const courseModules = modules.filter(m => m.course_id === c.id);
                        if (courseModules.length === 0) return (
                          <p className="text-xs mt-3 pt-3" style={{ color: '#555', borderTop: '1px solid #2A2A2A' }}>Sin módulos asignados. Ve a la pestaña "Módulos" para crear y asignar módulos a este curso.</p>
                        );
                        return (
                          <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid #2A2A2A' }}>
                            {courseModules.map(m => (
                              <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#111' }}>
                                <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#E63946', color: 'white', fontSize: '9px' }}>#{m.position}</span>
                                <span className="text-xs truncate" style={{ color: '#CCC' }}>{m.title}</span>
                                <span className="text-xs ml-auto" style={{ color: '#555' }}>{m.lesson_count} clases</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>

                {/* Unassigned modules */}
                {(() => {
                  const unassigned = modules.filter(m => !m.course_id);
                  if (unassigned.length === 0) return null;
                  return (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-3" style={{ color: '#E6A23C' }}>Módulos sin curso asignado ({unassigned.length})</h3>
                      <div className="space-y-2">
                        {unassigned.map(m => (
                          <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: '#1A1A1A', border: '1px dashed #E6A23C40' }}>
                            <span className="text-sm" style={{ color: '#CCC' }}>{m.title}</span>
                            <span className="text-xs" style={{ color: '#666' }}>Asigna un curso en "Módulos" → Editar</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ═══════════════════════════════════════ */}
            {/* MODULES TAB */}
            {/* ═══════════════════════════════════════ */}
            {tab === 'modules' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Módulos ({modules.length})</h2>
                  <button className="btn-red text-sm px-4 py-2" onClick={() => setShowAddModule(true)}>+ Agregar</button>
                </div>
                <div className="space-y-2">
                  {modules.map(m => {
                    const course = courses.find(c => c.id === m.course_id);
                    return (
                      <div key={m.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '14px 16px' }}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {m.thumbnail_url ? (
                              <img src={m.thumbnail_url} alt={m.title} style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                            ) : (
                              <span className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ background: '#E63946', color: 'white' }}>#{m.position}</span>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: 'white' }}>{m.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs" style={{ color: '#666' }}>{m.lesson_count} clases</p>
                                {course && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '10px' }}>{course.title}</span>}
                                {!course && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(230,163,60,0.1)', color: '#E6A23C', fontSize: '10px' }}>Sin curso</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: m.is_published ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: m.is_published ? '#22C55E' : '#666' }}>
                              {m.is_published ? 'Publicado' : 'Oculto'}
                            </span>
                            <button onClick={() => setEditModule(m)} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer' }}>
                              Editar
                            </button>
                            <button onClick={() => deleteModule(m.id)} className="text-xs px-2 py-1.5 rounded-lg" style={{ background: 'transparent', border: '1px solid #333', color: '#666', cursor: 'pointer' }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LESSONS TAB */}
            {tab === 'lessons' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Clases ({lessons.length})</h2>
                  <button className="btn-red text-sm px-4 py-2" onClick={() => setShowAddLesson(true)}>+ Agregar</button>
                </div>
                <div className="space-y-2">
                  {lessons.map(lesson => (
                    <div key={lesson.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '14px 16px' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {editingModuleId === lesson.module_id ? (
                            <div className="flex items-center gap-2 mb-1">
                              <input
                                className="input-dark"
                                value={editingModuleTitle}
                                onChange={e => setEditingModuleTitle(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') { e.preventDefault(); saveModuleTitle(lesson.module_id); }
                                  if (e.key === 'Escape') cancelEditModuleTitle();
                                }}
                                autoFocus
                                style={{ fontSize: '12px', padding: '4px 8px', height: '28px', maxWidth: '320px' }}
                              />
                              <button
                                onClick={() => saveModuleTitle(lesson.module_id)}
                                disabled={savingModuleTitle}
                                className="text-xs px-2 py-1 rounded"
                                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                {savingModuleTitle ? '...' : 'Guardar'}
                              </button>
                              <button
                                onClick={cancelEditModuleTitle}
                                className="text-xs px-2 py-1 rounded"
                                style={{ background: 'transparent', border: '1px solid #333', color: '#666', cursor: 'pointer' }}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <span
                              className="text-xs font-semibold inline-flex items-center gap-1.5 group"
                              style={{ color: '#E63946', cursor: 'pointer' }}
                              onClick={() => startEditModuleTitle(lesson.module_id, lesson.module_title)}
                              title="Haz clic para editar el nombre del módulo"
                            >
                              {lesson.module_title}
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: 0.5 }}>
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </span>
                          )}
                          <p className="text-sm font-medium mt-1" style={{ color: 'white' }}>{lesson.title}</p>
                          {lesson.video_embed ? (
                            <p className="text-xs mt-1" style={{ color: '#22C55E' }}>✓ Video configurado</p>
                          ) : (
                            <p className="text-xs mt-1" style={{ color: '#E63946' }}>⚠ Sin video — haz clic en Editar</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => setEditLesson(lesson)} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer' }}>
                            Editar
                          </button>
                          <button onClick={() => deleteLesson(lesson.id)} className="text-xs px-2 py-1.5 rounded-lg" style={{ background: 'transparent', border: '1px solid #333', color: '#666', cursor: 'pointer' }}>
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

      {/* ═══════════════════════════════════════ */}
      {/* MODALS */}
      {/* ═══════════════════════════════════════ */}

      {/* Modal: Add User */}
      {showAddUser && (
        <Modal title="Agregar Usuario" onClose={() => setShowAddUser(false)}>
          <form onSubmit={addUser} className="space-y-4">
            <Field label="Nombre"><input className="input-dark" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} required placeholder="Nombre completo" /></Field>
            <Field label="Email"><input className="input-dark" type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required placeholder="email@ejemplo.com" /></Field>
            <Field label="Contraseña"><input className="input-dark" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} required placeholder="123456" /></Field>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isAdmin" checked={newUser.isAdmin} onChange={e => setNewUser(p => ({ ...p, isAdmin: e.target.checked }))} />
              <label htmlFor="isAdmin" style={{ fontSize: '13px', color: '#CCC', cursor: 'pointer' }}>Es administrador</label>
            </div>
            <ModalButtons onCancel={() => setShowAddUser(false)} submitLabel="Agregar" />
          </form>
        </Modal>
      )}

      {/* Modal: Edit User */}
      {editUser && (
        <Modal title="Editar Usuario" onClose={() => setEditUser(null)}>
          <form onSubmit={updateUser} className="space-y-4">
            <Field label="Nombre"><input className="input-dark" value={editUser.name} onChange={e => setEditUser(p => p ? { ...p, name: e.target.value } : p)} required placeholder="Nombre completo" /></Field>
            <Field label="Email"><input className="input-dark" type="email" value={editUser.email} onChange={e => setEditUser(p => p ? { ...p, email: e.target.value } : p)} required placeholder="email@ejemplo.com" /></Field>
            <Field label="Nueva Contraseña">
              <input className="input-dark" type="password" value={editUser.password || ''} onChange={e => setEditUser(p => p ? { ...p, password: e.target.value } : p)} placeholder="Dejar vacío para no cambiar" />
              <p className="text-xs mt-1" style={{ color: '#666' }}>Solo rellena si deseas cambiar la contraseña actual.</p>
            </Field>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="editIsAdmin" checked={editUser.is_admin} onChange={e => setEditUser(p => p ? { ...p, is_admin: e.target.checked } : p)} />
              <label htmlFor="editIsAdmin" style={{ fontSize: '13px', color: '#CCC', cursor: 'pointer' }}>Es administrador</label>
            </div>
            <ModalButtons onCancel={() => setEditUser(null)} submitLabel="Guardar" />
          </form>
        </Modal>
      )}

      {/* Modal: Add Course */}
      {showAddCourse && (
        <Modal title="Nuevo Curso" onClose={() => setShowAddCourse(false)}>
          <form onSubmit={addCourse} className="space-y-4">
            <Field label="Nombre del Curso"><input className="input-dark" value={newCourse.title} onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))} required placeholder="Ej: Secretos Avanzados" /></Field>
            <Field label="Descripción"><textarea className="input-dark" rows={2} value={newCourse.description} onChange={e => setNewCourse(p => ({ ...p, description: e.target.value }))} placeholder="Descripción del curso..." style={{ resize: 'none' }} /></Field>
            <Field label="URL de la Thumbnail"><input className="input-dark" value={newCourse.thumbnailUrl} onChange={e => setNewCourse(p => ({ ...p, thumbnailUrl: e.target.value }))} placeholder="https://..." /></Field>
            <Field label="Tipo de Contenido">
              <select className="input-dark" value={newCourse.contentType} onChange={e => setNewCourse(p => ({ ...p, contentType: e.target.value }))}>
                <option value="video">Video (Módulos con clases de video)</option>
                <option value="pdf">PDF (Landing page con PDFs scrollables)</option>
              </select>
            </Field>
            <ModalButtons onCancel={() => setShowAddCourse(false)} submitLabel="Crear Curso" />
          </form>
        </Modal>
      )}

      {/* Modal: Edit Course */}
      {editCourse && (
        <Modal title="Editar Curso" onClose={() => setEditCourse(null)}>
          <form onSubmit={updateCourse} className="space-y-4">
            <Field label="Nombre del Curso">
              <input className="input-dark" value={editCourse.title} onChange={e => setEditCourse(p => p ? { ...p, title: e.target.value } : null)} required />
            </Field>
            <Field label="Descripción">
              <textarea className="input-dark" rows={2} value={editCourse.description || ''} onChange={e => setEditCourse(p => p ? { ...p, description: e.target.value } : null)} style={{ resize: 'none' }} />
            </Field>
            <Field label="URL de la Thumbnail">
              <input className="input-dark" value={editCourse.thumbnail_url || ''} onChange={e => setEditCourse(p => p ? { ...p, thumbnail_url: e.target.value } : null)} />
              {editCourse.thumbnail_url && (
                <div className="mt-3 rounded-lg overflow-hidden" style={{ background: '#000' }}>
                  <img src={editCourse.thumbnail_url} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                </div>
              )}
            </Field>
            <Field label="Tipo de Contenido">
              <select className="input-dark" value={editCourse.content_type} onChange={e => setEditCourse(p => p ? { ...p, content_type: e.target.value } : null)}>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editCourse.is_published} onChange={e => setEditCourse(p => p ? { ...p, is_published: e.target.checked } : null)} />
              <span className="text-sm" style={{ color: '#CCC' }}>Publicado</span>
            </label>
            {/* Drip Content Section */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '8px' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#F59E0B' }}>⏱ Liberación Programada</p>
                  <p className="text-xs" style={{ color: '#666' }}>Liberar este curso después de X días de la inscripción del alumno</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditCourse(p => p ? { ...p, drip_enabled: !p.drip_enabled } : null)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ background: editCourse.drip_enabled ? '#F59E0B' : '#333' }}
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" style={{ transform: editCourse.drip_enabled ? 'translateX(22px)' : 'translateX(4px)' }} />
                </button>
              </div>
              {editCourse.drip_enabled && (
                <Field label="Días después de la inscripción">
                  <input
                    type="number"
                    className="input-dark"
                    min="0"
                    value={editCourse.drip_days || 0}
                    onChange={e => setEditCourse(p => p ? { ...p, drip_days: parseInt(e.target.value) || 0 } : null)}
                    placeholder="Ej: 7"
                  />
                </Field>
              )}
            </div>
            <ModalButtons onCancel={() => setEditCourse(null)} submitLabel="Guardar" />
          </form>
        </Modal>
      )}

      {/* Modal: Add Module */}
      {showAddModule && (
        <Modal title="Agregar Módulo" onClose={() => setShowAddModule(false)}>
          <form onSubmit={addModule} className="space-y-4">
            <Field label="Curso">
              <select className="input-dark" value={newModule.courseId} onChange={e => setNewModule(p => ({ ...p, courseId: e.target.value }))} required>
                <option value="">Seleccionar curso...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </Field>
            <Field label="Título"><input className="input-dark" value={newModule.title} onChange={e => setNewModule(p => ({ ...p, title: e.target.value }))} required placeholder="Módulo #5: Título" /></Field>
            <Field label="Descripción"><textarea className="input-dark" rows={2} value={newModule.description} onChange={e => setNewModule(p => ({ ...p, description: e.target.value }))} placeholder="Descripción del módulo..." style={{ resize: 'none' }} /></Field>
            <Field label="URL de la Thumbnail"><input className="input-dark" value={newModule.thumbnailUrl} onChange={e => setNewModule(p => ({ ...p, thumbnailUrl: e.target.value }))} placeholder="https://..." /></Field>
            <ModalButtons onCancel={() => setShowAddModule(false)} submitLabel="Agregar" />
          </form>
        </Modal>
      )}

      {/* Modal: Edit Module */}
      {editModule && (
        <Modal title="Editar Módulo" onClose={() => setEditModule(null)}>
          <form onSubmit={updateModule} className="space-y-4">
            <Field label="Curso">
              <select className="input-dark" value={editModule.course_id || ''} onChange={e => setEditModule(p => p ? { ...p, course_id: e.target.value ? parseInt(e.target.value) : null } : null)}>
                <option value="">Sin curso asignado</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </Field>
            <Field label="Título">
              <input className="input-dark" value={editModule.title} onChange={e => setEditModule(p => p ? { ...p, title: e.target.value } : null)} required />
            </Field>
            <Field label="Descripción">
              <textarea className="input-dark" rows={2} value={editModule.description || ''} onChange={e => setEditModule(p => p ? { ...p, description: e.target.value } : null)} style={{ resize: 'none' }} />
            </Field>
            <Field label="URL de la Foto de Capa">
              <input className="input-dark" value={editModule.thumbnail_url || ''} onChange={e => setEditModule(p => p ? { ...p, thumbnail_url: e.target.value } : null)} />
              {editModule.thumbnail_url && (
                <div className="mt-3 rounded-lg overflow-hidden" style={{ background: '#000' }}>
                  <img src={editModule.thumbnail_url} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                </div>
              )}
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editModule.is_published} onChange={e => setEditModule(p => p ? { ...p, is_published: e.target.checked } : null)} />
              <span className="text-sm" style={{ color: '#CCC' }}>Publicado</span>
            </label>
            {/* ═══ DRIP CONTENT ═══ */}
            <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '16px', marginTop: '8px' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-sm font-medium" style={{ color: '#F59E0B' }}>Liberación Programada</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={editModule.drip_enabled || false} onChange={e => setEditModule(p => p ? { ...p, drip_enabled: e.target.checked } : null)} />
                  <div className="w-9 h-5 rounded-full peer transition-colors" style={{ background: editModule.drip_enabled ? '#F59E0B' : '#333' }}>
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform" style={{ background: 'white', transform: editModule.drip_enabled ? 'translateX(16px)' : 'translateX(0)' }} />
                  </div>
                </label>
              </div>
              {editModule.drip_enabled && (
                <div className="flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '12px' }}>
                  <span className="text-sm" style={{ color: '#CCC' }}>Liberar después de</span>
                  <input type="number" min="0" className="input-dark" style={{ width: '70px', textAlign: 'center' }} value={editModule.drip_days || 0} onChange={e => setEditModule(p => p ? { ...p, drip_days: parseInt(e.target.value) || 0 } : null)} />
                  <span className="text-sm" style={{ color: '#CCC' }}>días</span>
                </div>
              )}
              <p className="text-xs mt-2" style={{ color: '#555' }}>
                {editModule.drip_enabled
                  ? `Este módulo se desbloqueará ${editModule.drip_days || 0} días después de la inscripción del alumno.`
                  : 'Desactivado — el módulo está disponible inmediatamente.'}
              </p>
            </div>
            <ModalButtons onCancel={() => setEditModule(null)} submitLabel="Guardar" />
          </form>
        </Modal>
      )}

      {/* Modal: Add Lesson */}
      {showAddLesson && (
        <Modal title="Agregar Clase" onClose={() => setShowAddLesson(false)}>
          <form onSubmit={addLesson} className="space-y-4">
            <Field label="Módulo">
              <select className="input-dark" value={newLesson.moduleId} onChange={e => setNewLesson(p => ({ ...p, moduleId: e.target.value }))} required>
                <option value="">Seleccionar módulo...</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </Field>
            <Field label="Título"><input className="input-dark" value={newLesson.title} onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))} required placeholder="Título de la clase" /></Field>
            <Field label="Descripción (opcional)"><textarea className="input-dark" rows={2} value={newLesson.description} onChange={e => setNewLesson(p => ({ ...p, description: e.target.value }))} placeholder="Descripción breve..." style={{ resize: 'none' }} /></Field>
            <Field label="Embed del Video (Vturb / YouTube / Panda)">
              <textarea className="input-dark" rows={4} value={newLesson.videoEmbed} onChange={e => setNewLesson(p => ({ ...p, videoEmbed: e.target.value }))} placeholder='Cole aquí el código embed de Vturb...' style={{ resize: 'none', fontFamily: 'monospace', fontSize: '12px' }} />
              <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>Pega aquí el código embed completo de Vturb, YouTube o cualquier plataforma.</p>
            </Field>
            <Field label="Duración"><input className="input-dark" value={newLesson.duration} onChange={e => setNewLesson(p => ({ ...p, duration: e.target.value }))} placeholder="15 min" /></Field>
            <ModalButtons onCancel={() => setShowAddLesson(false)} submitLabel="Agregar" />
          </form>
        </Modal>
      )}

      {/* Modal: Edit Lesson */}
      {editLesson && (
        <Modal title="Editar Clase" onClose={() => setEditLesson(null)}>
          <form onSubmit={updateLesson} className="space-y-4">
            <Field label="Título"><input className="input-dark" value={editLesson.title} onChange={e => setEditLesson(p => p ? { ...p, title: e.target.value } : null)} required /></Field>
            <Field label="Descripción"><textarea className="input-dark" rows={2} value={editLesson.description || ''} onChange={e => setEditLesson(p => p ? { ...p, description: e.target.value } : null)} style={{ resize: 'none' }} /></Field>
            <Field label="Embed del Video (Vturb / YouTube / Panda)">
              <textarea className="input-dark" rows={5} value={editLesson.video_embed || ''} onChange={e => setEditLesson(p => p ? { ...p, video_embed: e.target.value } : null)} placeholder='Cole aquí el código embed de Vturb...' style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }} />
              <p style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>Pega aquí el código embed completo de Vturb, YouTube, Panda Video o cualquier plataforma.</p>
            </Field>
            <Field label="Duración"><input className="input-dark" value={editLesson.duration || ''} onChange={e => setEditLesson(p => p ? { ...p, duration: e.target.value } : null)} placeholder="15 min" /></Field>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editLesson.is_published} onChange={e => setEditLesson(p => p ? { ...p, is_published: e.target.checked } : null)} />
                <span className="text-sm" style={{ color: '#CCC' }}>Publicada</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editLesson.is_free} onChange={e => setEditLesson(p => p ? { ...p, is_free: e.target.checked } : null)} />
                <span className="text-sm" style={{ color: '#CCC' }}>Gratuita</span>
              </label>
            </div>
            {/* ═══ DRIP CONTENT ═══ */}
            <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '16px', marginTop: '8px' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-sm font-medium" style={{ color: '#F59E0B' }}>Liberación Programada</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={editLesson.drip_enabled || false} onChange={e => setEditLesson(p => p ? { ...p, drip_enabled: e.target.checked } : null)} />
                  <div className="w-9 h-5 rounded-full peer transition-colors" style={{ background: editLesson.drip_enabled ? '#F59E0B' : '#333' }}>
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform" style={{ background: 'white', transform: editLesson.drip_enabled ? 'translateX(16px)' : 'translateX(0)' }} />
                  </div>
                </label>
              </div>
              {editLesson.drip_enabled && (
                <div className="flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '12px' }}>
                  <span className="text-sm" style={{ color: '#CCC' }}>Liberar después de</span>
                  <input type="number" min="0" className="input-dark" style={{ width: '70px', textAlign: 'center' }} value={editLesson.drip_days || 0} onChange={e => setEditLesson(p => p ? { ...p, drip_days: parseInt(e.target.value) || 0 } : null)} />
                  <span className="text-sm" style={{ color: '#CCC' }}>días</span>
                </div>
              )}
              <p className="text-xs mt-2" style={{ color: '#555' }}>
                {editLesson.drip_enabled
                  ? `Esta clase se desbloqueará ${editLesson.drip_days || 0} días después de la inscripción del alumno.`
                  : 'Desactivado — la clase está disponible inmediatamente.'}
              </p>
            </div>
            <ModalButtons onCancel={() => setEditLesson(null)} submitLabel="Guardar" />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '6px', fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

function ModalButtons({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'transparent', border: '1px solid #333', color: '#999', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
      <button type="submit" className="btn-red" style={{ flex: 1, padding: '10px' }}>{submitLabel}</button>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#1A1A1A', border: '1px solid #333', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
