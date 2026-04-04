'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User { id: number; name: string; email: string; is_admin: boolean; is_active: boolean; created_at: string; }
interface Module { id: number; title: string; description: string; thumbnail_url: string; position: number; is_published: boolean; lesson_count: number; }
interface Lesson { id: number; module_id: number; title: string; description: string; video_embed: string; position: number; is_published: boolean; is_free: boolean; duration: string; module_title: string; }

export default function AdminClient({ userName, userEmail }: { userName: string; userEmail: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<'settings' | 'users' | 'modules' | 'lessons'>('settings');
  const [users, setUsers] = useState<User[]>([]);
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
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [editModule, setEditModule] = useState<Module | null>(null);

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '123456', isAdmin: false });
  const [newLesson, setNewLesson] = useState({ moduleId: '', title: '', description: '', videoEmbed: '', duration: '' });
  const [newModule, setNewModule] = useState({ title: '', description: '', thumbnailUrl: '' });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [uRes, mRes, lRes, sRes] = await Promise.all([
      fetch('/api/admin/users'), fetch('/api/admin/modules'), fetch('/api/admin/lessons'), fetch('/api/admin/settings')
    ]);
    if (uRes.ok) setUsers(await uRes.json());
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

  async function deleteUser(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/lessons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newLesson) });
    if (res.ok) { setShowAddLesson(false); setNewLesson({ moduleId: '', title: '', description: '', videoEmbed: '', duration: '' }); loadAll(); }
  }

  async function updateLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!editLesson) return;
    await fetch(`/api/admin/lessons/${editLesson.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editLesson.title, description: editLesson.description, videoEmbed: editLesson.video_embed, isPublished: editLesson.is_published, isFree: editLesson.is_free, duration: editLesson.duration }) });
    setEditLesson(null);
    loadAll();
  }

  async function deleteLesson(id: number) {
    if (!confirm('¿Eliminar esta clase?')) return;
    await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newModule) });
    if (res.ok) { setShowAddModule(false); setNewModule({ title: '', description: '', thumbnailUrl: '' }); loadAll(); }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const tabs = [
    { id: 'settings' as const, label: 'Configuración', icon: '⚙️' },
    { id: 'users' as const, label: 'Usuarios', icon: '👥' },
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

                {/* Banner Preview + URL */}
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '8px', fontWeight: 600 }}>
                    Banner / Imagen de Portada
                  </label>
                  {bannerUrl && (
                    <div className="mb-3 rounded-lg overflow-hidden" style={{ background: '#000' }}>
                      <img src={bannerUrl} alt="Banner preview" style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }} />
                    </div>
                  )}
                  <input
                    className="input-dark"
                    value={bannerUrl}
                    onChange={e => setBannerUrl(e.target.value)}
                    placeholder="URL de la imagen del banner (ej: https://...)"
                  />
                  <p style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>
                    Pega la URL de la imagen que quieres usar como banner principal. Recomendado: 1500x400px.
                  </p>
                </div>

                {/* Logo */}
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '8px', fontWeight: 600 }}>
                    Logo
                  </label>
                  {logoUrl && (
                    <div className="mb-3 p-4 rounded-lg" style={{ background: '#111' }}>
                      <img src={logoUrl} alt="Logo preview" style={{ height: '40px', objectFit: 'contain' }} />
                    </div>
                  )}
                  <input
                    className="input-dark"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="URL del logo (ej: https://...)"
                  />
                </div>

                {/* Site Title */}
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#CCC', marginBottom: '8px', fontWeight: 600 }}>
                    Título del Sitio
                  </label>
                  <input
                    className="input-dark"
                    value={siteTitle}
                    onChange={e => setSiteTitle(e.target.value)}
                    placeholder="Código V"
                  />
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3">
                  <button onClick={saveSettings} disabled={savingSettings} className="btn-red px-6 py-3" style={{ opacity: savingSettings ? 0.6 : 1 }}>
                    {savingSettings ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                  {settingsSaved && (
                    <span className="text-sm animate-fade-in" style={{ color: '#22C55E' }}>✓ Guardado correctamente</span>
                  )}
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {tab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Usuarios ({users.length})</h2>
                  <button className="btn-red text-sm px-4 py-2" onClick={() => setShowAddUser(true)}>+ Agregar</button>
                </div>
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '14px 16px' }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: u.is_admin ? '#E63946' : '#333', color: 'white' }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate" style={{ color: 'white' }}>{u.name}</p>
                              {u.is_admin && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(230,57,70,0.15)', color: '#E63946', fontSize: '10px' }}>Admin</span>}
                            </div>
                            <p className="text-xs truncate" style={{ color: '#666' }}>{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: u.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: u.is_active ? '#22C55E' : '#666' }}>
                            {u.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                          <button onClick={() => toggleUser(u.id, u.is_active)} className="text-xs px-2 py-1 rounded" style={{ background: 'transparent', border: '1px solid #333', color: '#999', cursor: 'pointer' }}>
                            {u.is_active ? 'Desactivar' : 'Activar'}
                          </button>
                          <button onClick={() => deleteUser(u.id)} className="text-xs px-2 py-1 rounded" style={{ background: 'transparent', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODULES TAB */}
            {tab === 'modules' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Módulos ({modules.length})</h2>
                  <button className="btn-red text-sm px-4 py-2" onClick={() => setShowAddModule(true)}>+ Agregar</button>
                </div>
                <div className="space-y-2">
                  {modules.map(m => (
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
                            <p className="text-xs" style={{ color: '#666' }}>{m.lesson_count} clases</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: m.is_published ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: m.is_published ? '#22C55E' : '#666' }}>
                            {m.is_published ? 'Publicado' : 'Oculto'}
                          </span>
                          <button onClick={() => setEditModule(m)} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#E63946', cursor: 'pointer' }}>
                            Editar
                          </button>
                        </div>
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
                  <h2 style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Clases ({lessons.length})</h2>
                  <button className="btn-red text-sm px-4 py-2" onClick={() => setShowAddLesson(true)}>+ Agregar</button>
                </div>
                <div className="space-y-2">
                  {lessons.map(lesson => (
                    <div key={lesson.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '14px 16px' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold" style={{ color: '#E63946' }}>{lesson.module_title}</span>
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

      {/* Modal: Add Module */}
      {showAddModule && (
        <Modal title="Agregar Módulo" onClose={() => setShowAddModule(false)}>
          <form onSubmit={addModule} className="space-y-4">
            <Field label="Título"><input className="input-dark" value={newModule.title} onChange={e => setNewModule(p => ({ ...p, title: e.target.value }))} required placeholder="Módulo #7: Título" /></Field>
            <Field label="Descripción"><textarea className="input-dark" rows={2} value={newModule.description} onChange={e => setNewModule(p => ({ ...p, description: e.target.value }))} placeholder="Descripción del módulo..." style={{ resize: 'none' }} /></Field>
            <Field label="URL de la Thumbnail"><input className="input-dark" value={newModule.thumbnailUrl} onChange={e => setNewModule(p => ({ ...p, thumbnailUrl: e.target.value }))} placeholder="https://..." /></Field>
            <ModalButtons onCancel={() => setShowAddModule(false)} submitLabel="Agregar" />
          </form>
        </Modal>
      )}

      {/* Modal: Edit Module */}
      {editModule && (
        <Modal title="Editar Módulo" onClose={() => setEditModule(null)}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            await fetch(`/api/admin/modules/${editModule.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: editModule.title,
                description: editModule.description,
                thumbnailUrl: editModule.thumbnail_url,
                isPublished: editModule.is_published,
              }),
            });
            setEditModule(null);
            loadAll();
          }} className="space-y-4">
            <Field label="Título">
              <input className="input-dark" value={editModule.title} onChange={e => setEditModule(p => p ? { ...p, title: e.target.value } : null)} required />
            </Field>
            <Field label="Descripción">
              <textarea className="input-dark" rows={2} value={editModule.description || ''} onChange={e => setEditModule(p => p ? { ...p, description: e.target.value } : null)} style={{ resize: 'none' }} />
            </Field>
            <Field label="URL de la Foto de Capa">
              <input className="input-dark" value={editModule.thumbnail_url || ''} onChange={e => setEditModule(p => p ? { ...p, thumbnail_url: e.target.value } : null)} placeholder="https://..." />
              {editModule.thumbnail_url && (
                <div className="mt-3 rounded-lg overflow-hidden" style={{ background: '#000' }}>
                  <img src={editModule.thumbnail_url} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                </div>
              )}
              <p style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>Pega la URL de la nueva imagen de capa del módulo.</p>
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editModule.is_published} onChange={e => setEditModule(p => p ? { ...p, is_published: e.target.checked } : null)} />
              <span className="text-sm" style={{ color: '#CCC' }}>Publicado</span>
            </label>
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
