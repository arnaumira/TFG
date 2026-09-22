import { useState, useEffect } from 'react'
import BottomNav from '../../components/BottomNav'
import MonthCalendar from '../../components/MonthCalendar'
import WeekCalendar from '../../components/WeekCalendar'
import AttendanceBadge from '../../components/AttendanceBadge'
import { getWeekDays } from '../../components/WeekCalendar'
import { academicTutorNav } from '../../config/navConfig'
import { getAcademicTutorSessionsByMonth } from '../../api/academicTutor'
import type { SessionDetail } from '../../api/sessions'

type View = 'month' | 'week'

export default function AcademicTutorCalendarPage() {
  const today = new Date()
  const [view, setView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState(new Date(today))
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [sessions, setSessions] = useState<SessionDetail[]>([])
  const [workDays, setWorkDays] = useState<number[]>([])

  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    getAcademicTutorSessionsByMonth(year, month).then(data => {
      setSessions(data)
      const days = [...new Set(data.map(s => new Date(s.sessionDate).getDate()))]
      setWorkDays(days)
    }).catch(() => {})
  }, [currentDate.getMonth(), currentDate.getFullYear()])

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

  const selectedDateStr = `${selectedDate.getFullYear()}-${
    String(selectedDate.getMonth() + 1).padStart(2, '0')}-${
    String(selectedDate.getDate()).padStart(2, '0')}`

  const selectedSessions = sessions.filter(s =>
    s.sessionDate.startsWith(selectedDateStr)
  )

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

        <p className="text-sm font-medium text-gray-900 mb-3 capitalize">
          {selectedDate.toLocaleDateString('ca-ES', {
            weekday: 'long', day: 'numeric', month: 'long'
          })}
        </p>

        {selectedSessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-400 text-center">
              No hi ha sessions per aquest dia
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {selectedSessions.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-[#0F6E56]">
                    {(s.studentName ?? '?').charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {s.studentName ?? '—'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {s.startTime.substring(0, 5)} – {s.endTime.substring(0, 5)} · {s.unit}
                  </p>
                </div>
                {s.attendanceStatus && (
                  <AttendanceBadge
                    status={s.attendanceStatus as 'present' | 'absent' | 'pending'}
                  />
                )}
              </div>
            ))}
          </div>
        )}

      </div>
      <BottomNav items={academicTutorNav} />
    </div>
  )
}