import { useState, useEffect } from 'react'
import {
  getSchedulesByAssignment, createSchedule, updateSchedule, deleteSchedule,
  getAssignmentSessions, updateSession
} from '../../api/coordinator'
import type { Schedule } from '../../api/coordinator'
import type { SessionDetail } from '../../api/sessions'
import type { AssignmentDetail } from '../../api/assignments'
import MonthCalendar from '../MonthCalendar'

interface Props {
  assignment: AssignmentDetail
  onClose: () => void
  onChanged: () => void
}

const DAYS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

export default function AssignmentDetailDrawer({ assignment, onClose, onChanged }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [sessions, setSessions] = useState<SessionDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [creatingSchedule, setCreatingSchedule] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionDetail | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const load = () => {
    setLoading(true)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    Promise.all([
      getSchedulesByAssignment(assignment.id),
      getAssignmentSessions(assignment.id, year, month),
    ]).then(([sch, sess]) => {
      setSchedules(sch)
      setSessions(sess)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [assignment.id, currentDate.getMonth(), currentDate.getFullYear()])

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Segur que vols eliminar aquest horari? S\'esborraran les sessions futures associades.')) return
    await deleteSchedule(assignment.id, id)
    load()
    onChanged()
  }

  const handleSelectDay = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const session = sessions.find(s => s.sessionDate.startsWith(dateStr))
    if (session) setEditingSession(session)
  }

  const workDays = sessions.map(s => new Date(s.sessionDate).getDate())
  const formatDay = (d: number) => DAYS[d] ?? '?'

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-white z-50 flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-medium text-gray-900">{assignment.studentName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {assignment.area} · {assignment.unit} · {assignment.clinicalTutorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Carregant...</p>
          ) : (
            <>
              {/* Horaris setmanals */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Horaris setmanals
                </p>
                <button
                  onClick={() => setCreatingSchedule(true)}
                  className="text-xs font-medium text-[#0F6E56] hover:underline"
                >
                  + Afegir
                </button>
              </div>

              {schedules.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-4 text-center mb-6">
                  <p className="text-sm text-gray-400">Sense horaris definits</p>
                </div>
              ) : (
                <div className="space-y-2 mb-6">
                  {schedules.map(s => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <span className="text-xs font-medium text-[#0F6E56] bg-[#E1F5EE] px-2 py-0.5 rounded-full">
                        {formatDay(s.dayOfWeek)}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {s.startTime.substring(0, 5)} – {s.endTime.substring(0, 5)}
                        </p>
                        {(s.building || s.unit) && (
                          <p className="text-xs text-gray-400">
                            {[s.building, s.floor, s.unit].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setEditingSchedule(s)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="#555" strokeWidth="2" strokeLinecap="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(s.id)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 group"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="#bbb" strokeWidth="2" strokeLinecap="round"
                          className="group-hover:stroke-red-400">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Sessions — calendari */}
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Sessions
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Clica un dia amb sessió per modificar-la
              </p>

              {/* Navegació mes */}
              <div className="flex justify-between items-center mb-2">
                <button
                  onClick={() => {
                    const d = new Date(currentDate)
                    d.setMonth(d.getMonth() - 1)
                    setCurrentDate(d)
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50"
                >‹</button>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {currentDate.toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => {
                    const d = new Date(currentDate)
                    d.setMonth(d.getMonth() + 1)
                    setCurrentDate(d)
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50"
                >›</button>
              </div>

              <MonthCalendar
                currentDate={currentDate}
                selectedDate={currentDate}
                workDays={workDays}
                onSelectDate={handleSelectDay}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal crear/editar schedule */}
      {(editingSchedule || creatingSchedule) && (
        <ScheduleEditModal
          schedule={editingSchedule}
          assignmentId={assignment.id}
          onClose={() => { setEditingSchedule(null); setCreatingSchedule(false) }}
          onSaved={() => {
            setEditingSchedule(null)
            setCreatingSchedule(false)
            load()
            onChanged()
          }}
        />
      )}

      {/* Modal editar sessió */}
      {editingSession && (
        <SessionEditModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSaved={() => { setEditingSession(null); load(); onChanged() }}
        />
      )}
    </>
  )
}

// ---- Modal crear/editar schedule ----
function ScheduleEditModal({ schedule, assignmentId, onClose, onSaved }: {
  schedule: Schedule | null
  assignmentId: string
  onClose: () => void
  onSaved: () => void
}) {
  const isEditing = !!schedule
  const [dayOfWeek, setDayOfWeek] = useState(schedule?.dayOfWeek ?? 0)
  const [startTime, setStartTime] = useState(schedule?.startTime.substring(0, 5) ?? '08:00')
  const [endTime, setEndTime] = useState(schedule?.endTime.substring(0, 5) ?? '14:00')
  const [building, setBuilding] = useState(schedule?.building ?? '')
  const [floor, setFloor] = useState(schedule?.floor ?? '')
  const [unit, setUnit] = useState(schedule?.unit ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = {
        assignmentId,
        dayOfWeek,
        startTime: startTime + ':00',
        endTime: endTime + ':00',
        building: building || undefined,
        floor: floor || undefined,
        unit: unit || undefined,
      }
      if (isEditing && schedule) {
        await updateSchedule(schedule.id, data)
      } else {
        await createSchedule(assignmentId, data)
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-medium text-gray-900 mb-1">
          {isEditing ? 'Editar horari' : 'Nou horari'}
        </h3>
        {isEditing && (
          <p className="text-xs text-amber-600 mb-4">
            Es regeneraran les sessions futures (a partir d'avui)
          </p>
        )}
        {!isEditing && <div className="mb-4" />}

        <label className="block text-xs text-gray-500 mb-1.5">Dia de la setmana</label>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {DAYS.map((d, i) => (
            <button
              key={i}
              onClick={() => setDayOfWeek(i)}
              className={`h-9 rounded-lg text-xs font-medium ${
                dayOfWeek === i ? 'bg-[#0F6E56] text-white' : 'border border-gray-200 text-gray-500'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Entrada</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Sortida</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <input value={building} onChange={e => setBuilding(e.target.value)} placeholder="Edifici"
            className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
          <input value={floor} onChange={e => setFloor(e.target.value)} placeholder="Planta"
            className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
          <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unitat"
            className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-sm text-gray-600">
            Cancel·lar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-xl bg-[#0F6E56] text-white text-sm font-medium disabled:opacity-60">
            {saving ? 'Guardant...' : isEditing ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Modal editar sessió individual ----
function SessionEditModal({ session, onClose, onSaved }: {
  session: SessionDetail
  onClose: () => void
  onSaved: () => void
}) {
  const [startTime, setStartTime] = useState(session.startTime.substring(0, 5))
  const [endTime, setEndTime] = useState(session.endTime.substring(0, 5))
  const [building, setBuilding] = useState(session.building ?? '')
  const [floor, setFloor] = useState(session.floor ?? '')
  const [unit, setUnit] = useState(session.unit ?? '')
  const [saving, setSaving] = useState(false)

  const d = new Date(session.sessionDate)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSession(session.id, {
        startTime: startTime + ':00',
        endTime: endTime + ':00',
        building: building || undefined,
        floor: floor || undefined,
        unit: unit || undefined,
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-medium text-gray-900 mb-1">Modificar sessió</h3>
        <p className="text-xs text-gray-400 mb-4 capitalize">
          {d.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Entrada</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Sortida</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <input value={building} onChange={e => setBuilding(e.target.value)} placeholder="Edifici"
            className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
          <input value={floor} onChange={e => setFloor(e.target.value)} placeholder="Planta"
            className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
          <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unitat"
            className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#0F6E56]" />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-sm text-gray-600">
            Cancel·lar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-xl bg-[#0F6E56] text-white text-sm font-medium disabled:opacity-60">
            {saving ? 'Guardant...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}