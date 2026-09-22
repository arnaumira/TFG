import { useState, useEffect } from 'react'
import { studentNav } from '../../config/navConfig'
import BottomNav from '../../components/BottomNav'
import DayInfoCard from '../../components/DayInfoCard'
import IncidentModal from '../../components/IncidentModal'
import MonthCalendar from '../../components/MonthCalendar'
import WeekCalendar from '../../components/WeekCalendar'
import { getWeekDays } from '../../components/WeekCalendar'
import { getCurrentAssignment } from '../../api/assignments'
import { getSessionsByMonth, getSessionByDate } from '../../api/sessions'
import { getMyChangeRequests } from '../../api/sessionChangeRequests'
import type { SessionDetail } from '../../api/sessions'
import type { SessionChangeRequestDetail } from '../../api/sessionChangeRequests'

type View = 'month' | 'week'

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending:  { label: 'Pendent',  bg: 'bg-amber-50',  text: 'text-amber-700'  },
    approved: { label: 'Aprovada', bg: 'bg-[#E1F5EE]', text: 'text-[#085041]' },
    rejected: { label: 'Denegada', bg: 'bg-red-50',    text: 'text-red-700'   },
  }[status] ?? { label: status, bg: 'bg-gray-50', text: 'text-gray-500' }

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

export default function CalendarPage() {
  const today = new Date()
  const [view, setView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState(new Date(today))
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [showModal, setShowModal] = useState(false)
  const [assignmentId, setAssignmentId] = useState<string | null>(null)
  const [workDays, setWorkDays] = useState<number[]>([])
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null)
  const [loadingSession, setLoadingSession] = useState(false)
  const [changeRequests, setChangeRequests] = useState<SessionChangeRequestDetail[]>([])

  // Carrega l'assignment i les sol·licituds
  useEffect(() => {
    getCurrentAssignment().then(a => {
      setAssignmentId(a.id)
      return getMyChangeRequests(a.id)
    }).then(setChangeRequests).catch(() => {})
  }, [])

  // Carrega les sessions del mes
  useEffect(() => {
    if (!assignmentId) return
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    getSessionsByMonth(assignmentId, year, month).then(sessions => {
      const days = sessions.map(s => new Date(s.sessionDate).getDate())
      setWorkDays(days)
    }).catch(() => {})
  }, [assignmentId, currentDate.getMonth(), currentDate.getFullYear()])

  // Carrega la sessió del dia seleccionat
  useEffect(() => {
    if (!assignmentId) return
    setLoadingSession(true)

    const dateStr = `${selectedDate.getFullYear()}-${
      String(selectedDate.getMonth() + 1).padStart(2, '0')}-${
      String(selectedDate.getDate()).padStart(2, '0')}`

    getSessionByDate(assignmentId, dateStr).then(session => {
      setSelectedSession(session)
    }).finally(() => setLoadingSession(false))
  }, [assignmentId, selectedDate])

  const navigateMonth = (dir: 1 | -1) => {
    setCurrentDate(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + dir)
      return d
    })
  }

  const navigateWeek = (dir: 1 | -1) => {
    setCurrentDate(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + dir * 7)
      return d
    })
  }

  const weekDays = getWeekDays(currentDate)
  const monthName = currentDate.toLocaleDateString('ca-ES', {
    month: 'long', year: 'numeric'
  })
  const weekLabel = `${weekDays[0].getDate()} – ${weekDays[6].getDate()} ${
    weekDays[6].toLocaleDateString('ca-ES', { month: 'long' })
  }`

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="max-w-md mx-auto px-5 pt-12 pb-28">

        {/* Capçalera */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Calendari</h1>
          <div className="flex bg-white rounded-xl border border-gray-100 p-1 gap-1">
            {(['month', 'week'] as View[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  view === v ? 'bg-[#0F6E56] text-white' : 'text-gray-400'
                }`}
              >
                {v === 'month' ? 'Mes' : 'Setmana'}
              </button>
            ))}
          </div>
        </div>

        {/* Navegació */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => view === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white transition-colors"
          >‹</button>
          <span className="text-sm font-medium text-gray-900 capitalize">
            {view === 'month' ? monthName : weekLabel}
          </span>
          <button
            onClick={() => view === 'month' ? navigateMonth(1) : navigateWeek(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white transition-colors"
          >›</button>
        </div>

        {/* Calendari */}
        {view === 'month' ? (
          <MonthCalendar
            currentDate={currentDate}
            selectedDate={selectedDate}
            workDays={workDays}
            onSelectDate={setSelectedDate}
          />
        ) : (
          <WeekCalendar
            currentDate={currentDate}
            selectedDate={selectedDate}
            workDays={workDays}
            onSelectDate={setSelectedDate}
          />
        )}

        {/* Detall del dia */}
        <p className="text-sm font-medium text-gray-900 mb-3">Detall del dia</p>

        {loadingSession ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-400 text-center">Carregant...</p>
          </div>
        ) : selectedSession ? (
          <DayInfoCard
            date={selectedDate}
            info={{
              hospital: 'Parc Taulí',
              building: selectedSession.building,
              floor: selectedSession.floor,
              unit: selectedSession.unit,
              clinicalTutor: selectedSession.clinicalTutorName,
              startTime: selectedSession.startTime,
              endTime: selectedSession.endTime,
            }}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-400 text-center">
              No hi ha sessió planificada per aquest dia
            </p>
          </div>
        )}

        {/* Botó sol·licitud — només si hi ha sessió */}
        {selectedSession && assignmentId && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full h-11 mt-4 rounded-xl border border-[#0F6E56] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span className="text-sm font-medium text-[#0F6E56]">Sol·licitar canvi de sessió</span>
          </button>
        )}

        {/* Sol·licituds de canvi */}
        {changeRequests.length > 0 && (
          <>
            <p className="text-sm font-medium text-gray-900 mt-6 mb-3">
              Les meves sol·licituds
            </p>
            <div className="space-y-3">
              {changeRequests.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-900">
                      {new Date(r.originalDate).toLocaleDateString('ca-ES', {
                        weekday: 'short', day: 'numeric', month: 'short'
                      })}
                      {' → '}
                      {new Date(r.proposedDate).toLocaleDateString('ca-ES', {
                        weekday: 'short', day: 'numeric', month: 'short'
                      })}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-gray-400">
                    {r.proposedStart.substring(0, 5)} – {r.proposedEnd.substring(0, 5)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{r.reason}</p>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      <BottomNav items={studentNav} />

      {showModal && selectedSession && assignmentId && (
        <IncidentModal
          sessionId={selectedSession.id}
          assignmentId={assignmentId}
          selectedDate={selectedDate}
          onClose={() => setShowModal(false)}
        />
      )}

    </div>
  )
}