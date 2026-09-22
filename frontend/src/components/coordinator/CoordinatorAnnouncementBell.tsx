import { useState } from 'react'
import {
  createAnnouncement, getSentAnnouncements, deleteAnnouncement
} from '../../api/announcements'
import type { Announcement, AnnouncementTarget } from '../../api/announcements'

const TARGETS: { value: AnnouncementTarget; label: string }[] = [
  { value: 'all', label: 'Tothom' },
  { value: 'student', label: 'Estudiants' },
  { value: 'clinical_tutor', label: 'Tutors clínics' },
  { value: 'academic_tutor', label: 'Tutors acadèmics' },
]

const TARGET_LABEL: Record<string, string> = {
  all: 'Tothom', student: 'Estudiants',
  clinical_tutor: 'Tutors clínics', academic_tutor: 'Tutors acadèmics',
}

export default function CoordinatorAnnouncementBell() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'list' | 'create'>('list')
  const [sent, setSent] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [target, setTarget] = useState<AnnouncementTarget>('all')
  const [saving, setSaving] = useState(false)

  const loadSent = () => {
    setLoading(true)
    getSentAnnouncements().then(setSent).finally(() => setLoading(false))
  }

  const handleOpen = () => {
    setOpen(true)
    setView('list')
    loadSent()
  }

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) return
    setSaving(true)
    try {
      await createAnnouncement({ title, body, target })
      setTitle(''); setBody(''); setTarget('all')
      setView('list')
      loadSent()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar aquest avís?')) return
    await deleteAnnouncement(id)
    loadSent()
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#555" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {view === 'list' ? 'Avisos publicats' : 'Nou avís'}
              </h2>
              <div className="flex items-center gap-3">
                {view === 'list' ? (
                  <button
                    onClick={() => setView('create')}
                    className="text-sm font-medium text-white bg-[#0F6E56] px-3 py-1.5 rounded-lg"
                  >
                    + Nou avís
                  </button>
                ) : (
                  <button
                    onClick={() => setView('list')}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    Tornar
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {view === 'create' ? (
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Títol</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Títol de l'avís"
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Descripció</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)}
                    placeholder="Contingut de l'avís..." rows={6}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56] resize-none leading-relaxed" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Destinataris</label>
                  <div className="flex flex-wrap gap-2">
                    {TARGETS.map(t => (
                      <button key={t.value} onClick={() => setTarget(t.value)}
                        className={`text-sm px-3.5 py-2 rounded-full border transition-colors ${
                          target === t.value
                            ? 'bg-[#0F6E56] text-white border-[#0F6E56]'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handlePublish} disabled={saving || !title.trim() || !body.trim()}
                  className="w-full h-11 bg-[#0F6E56] text-white text-sm font-medium rounded-xl disabled:opacity-50">
                  {saving ? 'Publicant...' : 'Publicar avís'}
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-gray-400 text-center py-10">Carregant...</p>
                ) : sent.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="#bbb" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400">Cap avís publicat encara</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {sent.map(a => (
                      <div key={a.id} className="px-6 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900">{a.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">
                              {a.body}
                            </p>
                            <div className="flex items-center gap-2 mt-2.5">
                              <span className="text-xs font-medium text-[#0F6E56] bg-[#E1F5EE] px-2.5 py-1 rounded-full">
                                {TARGET_LABEL[a.target]}
                              </span>
                              <span className="text-xs text-gray-300">
                                {new Date(a.createdAt).toLocaleDateString('ca-ES', {
                                  day: 'numeric', month: 'long'
                                })}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => handleDelete(a.id)}
                            className="text-gray-300 hover:text-red-400 flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}