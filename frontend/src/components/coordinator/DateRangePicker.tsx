import { useState, useRef, useEffect } from 'react'
import MonthCalendar from '../MonthCalendar'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChangeStart: (date: string) => void
  onChangeEnd: (date: string) => void
}

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatLabel(dateStr: string) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('ca-ES', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function DateRangePicker({
  startDate, endDate, onChangeStart, onChangeEnd
}: DateRangePickerProps) {
  const [open, setOpen] = useState<'start' | 'end' | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelectDate = (date: Date) => {
    const str = toDateStr(date)
    if (open === 'start') {
      onChangeStart(str)
      setOpen('end')
    } else {
      onChangeEnd(str)
      setOpen(null)
    }
  }

  // Dies marcats al calendari
  const workDays: number[] = []
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const cur = new Date(start)
    while (cur <= end) {
      if (cur.getMonth() === currentDate.getMonth())
        workDays.push(cur.getDate())
      cur.setDate(cur.getDate() + 1)
    }
  }

  const selectedDate = open === 'end' && endDate
    ? new Date(endDate)
    : startDate
      ? new Date(startDate)
      : new Date()

  return (
    <div ref={ref}>
      {/* Triggers */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <button
          type="button"
          onClick={() => setOpen(open === 'start' ? null : 'start')}
          className={`flex flex-col items-start px-3 py-2.5 rounded-xl border transition-colors ${
            open === 'start'
              ? 'border-[#0F6E56] bg-[#f8fffc]'
              : startDate
                ? 'border-[#0F6E56] bg-[#f8fffc]'
                : 'border-gray-200 bg-gray-50'
          }`}
        >
          <span className="text-xs text-gray-400 mb-0.5">Data inici</span>
          {startDate ? (
            <span className="text-sm font-medium text-gray-900">
              {formatLabel(startDate)}
            </span>
          ) : (
            <span className="text-sm text-gray-300">Selecciona...</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setOpen(open === 'end' ? null : 'end')}
          className={`flex flex-col items-start px-3 py-2.5 rounded-xl border transition-colors ${
            open === 'end'
              ? 'border-[#0F6E56] bg-[#f8fffc]'
              : endDate
                ? 'border-[#0F6E56] bg-[#f8fffc]'
                : 'border-gray-200 bg-gray-50'
          }`}
        >
          <span className="text-xs text-gray-400 mb-0.5">Data fi</span>
          {endDate ? (
            <span className="text-sm font-medium text-gray-900">
              {formatLabel(endDate)}
            </span>
          ) : (
            <span className="text-sm text-gray-300">Selecciona...</span>
          )}
        </button>
      </div>

      {/* Calendari */}
      {open && (
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 pt-3 pb-1 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                const d = new Date(currentDate)
                d.setMonth(d.getMonth() - 1)
                setCurrentDate(d)
              }}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {currentDate.toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => {
                const d = new Date(currentDate)
                d.setMonth(d.getMonth() + 1)
                setCurrentDate(d)
              }}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400"
            >
              ›
            </button>
          </div>
          <div className="px-3 pb-3">
            <MonthCalendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              workDays={workDays}
              onSelectDate={handleSelectDate}
            />
          </div>
          <div className="px-4 py-2 border-t border-gray-50 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
              {open === 'start' ? 'Selecciona la data d\'inici' : 'Selecciona la data de fi'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}