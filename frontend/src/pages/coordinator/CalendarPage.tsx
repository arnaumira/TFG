import { useState, useEffect } from 'react'
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout'
import MonthCalendar from '../../components/MonthCalendar'
import WeekCalendar from '../../components/WeekCalendar'
import AttendanceBadge from '../../components/AttendanceBadge'
import SearchSelect from '../../components/coordinator/SearchSelect'
import { getWeekDays } from '../../components/WeekCalendar'
import { getCoordinatorSessions, getAllStudents, getAllClinicalTutors } from '../../api/coordinator'
import type { StudentOption, ClinicalTutorOption } from '../../api/coordinator'
import type { SessionDetail } from '../../api/sessions'


type View = 'month' | 'week'

export default function CoordinatorCalendarPage() {
  const today = new Date()
  const [view, setView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState(new Date(today))
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [sessions, setSessions] = useState<SessionDetail[]>([])
  const [workDays, setWorkDays] = useState<number[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [clinicalTutors, setClinicalTutors] = useState<ClinicalTutorOption[]>([])
  const [filterStudent, setFilterStudent] = useState('')
  const [filterTutor, setFilterTutor] = useState('')

  useEffect(() => {
    Promise.all([getAllStudents(), getAllClinicalTutors()])
      .then(([s, t]) => { setStudents(s); setClinicalTutors(t) })
  }, [])

  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    getCoordinatorSessions(
      year, month,
      filterStudent || undefined,
      filterTutor || undefined
    ).then(data => {
      setSessions(data)
      const days = [...new Set(data.map(s => new Date(s.sessionDate).getDate()))]
      setWorkDays(days)
    })
  }, [currentDate, filterStudent, filterTutor])

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
    <CoordinatorLayout title="Calendari">
      <div className="flex gap-6">

        {/* Calendari esquerra */}
        <div className="flex-1">

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => view === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"
              >
                ‹
              </button>
              <span className="text-sm font-medium text-gray-900 capitalize min-w-32 text-center">
                {view === 'month' ? monthName : weekLabel}
              </span>
              <button
                onClick={() => view === 'month' ? navigateMonth(1) : navigateWeek(1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"
              >
                ›
              </button>
            </div>

            <div className="flex bg-white rounded-lg border border-gray-100 p-1 gap-1">
              {(['month', 'week'] as View[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    view === v ? 'bg-[#0F6E56] text-white' : 'text-gray-400'
                  }`}
                >
                  {v === 'month' ? 'Mes' : 'Setmana'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
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
          </div>

          {/* Sessions del dia */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3 capitalize">
              {selectedDate.toLocaleDateString('ca-ES', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </p>

            {selectedSessions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <p className="text-sm text-gray-400">No hi ha sessions per aquest dia</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {selectedSessions.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-[#0F6E56]">
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
                        <AttendanceBadge status={s.attendanceStatus as 'present' | 'absent' | 'pending'} />
                        )}
                    </div>
                    ))}
              </div>
            )}
          </div>
        </div>

        {/* Filtres dreta */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
              Filtres
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Estudiant</label>
                <SearchSelect
                  options={[
                    { id: '', label: 'Tots els estudiants' },
                    ...students.map(s => ({
                      id: s.id,
                      label: s.fullName,
                      sublabel: s.currentCourse
                        ? `${s.currentCourse}r curs`
                        : undefined
                    }))
                  ]}
                  value={filterStudent}
                  onChange={setFilterStudent}
                  placeholder="Tots els estudiants"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Tutor clínic</label>
                <SearchSelect
                  options={[
                    { id: '', label: 'Tots els tutors' },
                    ...clinicalTutors.map(t => ({
                      id: t.id,
                      label: t.fullName,
                      sublabel: t.specialty ?? undefined
                    }))
                  ]}
                  value={filterTutor}
                  onChange={setFilterTutor}
                  placeholder="Tots els tutors"
                />
              </div>

              {(filterStudent || filterTutor) && (
                <button
                  onClick={() => { setFilterStudent(''); setFilterTutor('') }}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Esborrar filtres
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </CoordinatorLayout>
  )
}