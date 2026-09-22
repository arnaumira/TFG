import { useState, useEffect } from 'react'
import { getMyAnnouncements, getUnreadCount, markAnnouncementRead } from '../api/announcements'
import type { AnnouncementDetail } from '../api/announcements'

const TARGET_LABEL: Record<string, string> = {
  all: 'Tothom', student: 'Estudiants',
  clinical_tutor: 'Tutors clínics', academic_tutor: 'Tutors acadèmics',
}

export default function AnnouncementBell() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<AnnouncementDetail[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getUnreadCount().then(setUnread).catch(() => {})
  }, [])

  const handleOpen = async () => {
    setOpen(true)
    setLoading(true)
    try {
      const data = await getMyAnnouncements()
      setItems(data)
      const unreadItems = data.filter(a => !a.isRead)
      await Promise.all(unreadItems.map(a => markAnnouncementRead(a.id)))
      setUnread(0)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (s: string) => {
    const d = new Date(s)
    if (d.toDateString() === new Date().toDateString())
      return `Avui · ${d.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}`
    return d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'long' })
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center relative"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#555" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Avisos</h2>
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

            {/* Llista */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-gray-400 text-center py-10">Carregant...</p>
              ) : items.length === 0 ? (
                <div className="text-center py-12 px-5">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="#bbb" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">No tens cap avís</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {items.map(a => (
                    <div key={a.id} className="px-5 py-4">
                      <div className="flex items-start gap-2.5">
                        {!a.isRead && (
                          <div className="w-2 h-2 rounded-full bg-[#0F6E56] mt-2 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900">{a.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">
                            {a.body}
                          </p>
                          <p className="text-xs text-gray-300 mt-2">{formatDate(a.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}