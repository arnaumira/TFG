import { useState, useEffect } from 'react'
import MonthCalendar from './MonthCalendar'
import { createChangeRequest, getWorkedDates } from '../api/sessionChangeRequests'

interface IncidentModalProps {
  onClose: () => void
  sessionId: string
  assignmentId: string
  selectedDate: Date
}

export default function IncidentModal({
  onClose, sessionId, assignmentId, selectedDate
}: IncidentModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [proposedDate, setProposedDate] = useState<Date | null>(null)
  const [proposedStart, setProposedStart] = useState('08:00')
  const [proposedEnd, setProposedEnd] = useState('14:00')
  const [reason, setReason] = useState('')
  const [workedDates, setWorkedDates] = useState<Set<string>>(new Set())
  const [workDaysOfMonth, setWorkDaysOfMonth] = useState<number[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getWorkedDates(assignmentId).then(dates => {
      const dateSet = new Set(dates.map(d => {
        const date = new Date(d)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      }))
      setWorkedDates(dateSet)
    }).catch(() => {})
  }, [assignmentId])

  useEffect(() => {
    const days = Array.from(workedDates)
      .filter(d => {
        const date = new Date(d)
        return date.getMonth() === currentDate.getMonth() &&
               date.getFullYear() === currentDate.getFullYear()
      })
      .map(d => new Date(d).getDate())
    setWorkDaysOfMonth(days)
  }, [workedDates, currentDate])

  const handleSelectDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${
      String(date.getMonth() + 1).padStart(2, '0')}-${
      String(date.getDate()).padStart(2, '0')}`

    if (workedDates.has(dateStr)) {
      setError('Aquest dia ja tens una sessió planificada. Tria un altre dia.')
      return
    }
    setError('')
    setProposedDate(date)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proposedDate) return
    if (!reason.trim()) {
      setError('Has d\'indicar el motiu del canvi.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const dateStr = `${proposedDate.getFullYear()}-${
        String(proposedDate.getMonth() + 1).padStart(2, '0')}-${
        String(proposedDate.getDate()).padStart(2, '0')}`

      await createChangeRequest({
        sessionId,
        proposedDate: dateStr,
        proposedStart: proposedStart + ':00',
        proposedEnd: proposedEnd + ':00',
        reason,
      })
      setSubmitted(true)
    } catch {
      setError('Error en enviar la sol·licitud. Torna-ho a intentar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl pb-10 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mt-4 mb-4 flex-shrink-0" />

        {submitted ? (
          <div className="flex flex-col items-center py-8 gap-3 px-6">
            <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <p className="text-base font-medium text-gray-900">Sol·licitud enviada</p>
            <p className="text-sm text-gray-400 text-center">
              El tutor acadèmic revisarà la teva sol·licitud aviat
            </p>
            <button
              onClick={onClose}
              className="mt-2 h-11 px-6 rounded-xl bg-[#0F6E56] text-white text-sm font-medium"
            >
              Tancar
            </button>
          </div>
        ) : (
          <>
            {/* Header fix */}
            <div className="px-6 pb-3 flex-shrink-0">
              <h2 className="text-base font-medium text-gray-900">
                Sol·licitar canvi de sessió
              </h2>
              <p className="text-sm text-gray-400 mt-0.5 capitalize">
                Sessió del {selectedDate.toLocaleDateString('ca-ES', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </p>

              {/* Steps */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step >= 1 ? 'bg-[#0F6E56] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > 1 ? '✓' : '1'}
                  </div>
                  <span className="text-xs text-gray-600">Nou dia</span>
                </div>
                <div className={`flex-1 h-px ${step > 1 ? 'bg-[#0F6E56]' : 'bg-gray-200'}`} />
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === 2 ? 'bg-[#0F6E56] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    2
                  </div>
                  <span className={`text-xs ${step === 2 ? 'text-gray-600' : 'text-gray-300'}`}>
                    Horari i motiu
                  </span>
                </div>
              </div>
            </div>

            {/* Body amb scroll */}
            <div className="flex-1 overflow-y-auto px-6">

              {error && (
                <div className="bg-red-50 rounded-xl px-4 py-3 mb-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {step === 1 && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">
                    Selecciona el dia que proposes. Els dies marcats amb punt ja tens sessió i no els pots triar.
                  </p>

                  {/* Navegació mes */}
                  <div className="flex justify-between items-center mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(currentDate)
                        d.setMonth(d.getMonth() - 1)
                        setCurrentDate(d)
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50"
                    >‹</button>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {currentDate.toLocaleDateString('ca-ES', {
                        month: 'long', year: 'numeric'
                      })}
                    </span>
                    <button
                      type="button"
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
                    selectedDate={proposedDate ?? selectedDate}
                    workDays={workDaysOfMonth}
                    onSelectDate={handleSelectDate}
                  />

                  {proposedDate && (
                    <div className="bg-[#E1F5EE] rounded-xl px-4 py-3 mt-2">
                      <p className="text-sm text-[#085041] font-medium">
                        Dia seleccionat: {proposedDate.toLocaleDateString('ca-ES', {
                          weekday: 'long', day: 'numeric', month: 'long'
                        })}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!proposedDate) {
                        setError('Selecciona un dia primer.')
                        return
                      }
                      setError('')
                      setStep(2)
                    }}
                    disabled={!proposedDate}
                    className="w-full h-11 bg-[#0F6E56] text-white text-sm font-medium rounded-xl mt-4 disabled:opacity-40"
                  >
                    Continuar →
                  </button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4 pb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Horari proposat
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Entrada</label>
                        <input
                          type="time"
                          value={proposedStart}
                          onChange={e => setProposedStart(e.target.value)}
                          required
                          className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Sortida</label>
                        <input
                          type="time"
                          value={proposedEnd}
                          onChange={e => setProposedEnd(e.target.value)}
                          required
                          className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">
                      Motiu del canvi
                    </label>
                    <textarea
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="Explica el motiu pel qual vols canviar aquesta sessió..."
                      rows={4}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-gray-50 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 h-11 rounded-xl border border-gray-200 text-sm text-gray-600"
                    >
                      ← Enrere
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 h-11 bg-[#0F6E56] text-white text-sm font-medium rounded-xl disabled:opacity-60"
                    >
                      {submitting ? 'Enviant...' : 'Enviar sol·licitud'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}