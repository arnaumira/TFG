const WEEKDAYS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

interface WeekCalendarProps {
  currentDate: Date
  selectedDate: Date
  workDays: number[]
  onSelectDate: (date: Date) => void
}

export function getWeekDays(date: Date): Date[] {
  const day = date.getDay()
  const offset = day === 0 ? 6 : day - 1
  const monday = new Date(date)
  monday.setDate(date.getDate() - offset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function WeekCalendar({
  currentDate, selectedDate, workDays, onSelectDate
}: WeekCalendarProps) {
  const today = new Date()
  const weekDays = getWeekDays(currentDate)

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()

  const isSelected = (d: Date) =>
    d.getDate() === selectedDate.getDate() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getFullYear() === selectedDate.getFullYear()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((d, i) => {
          const todayCell = isToday(d)
          const selectedCell = isSelected(d)
          const work = workDays.includes(d.getDate())

          return (
            <button
              key={i}
              onClick={() => onSelectDate(d)}
              className="flex flex-col items-center gap-1 py-1"
            >
              <span className="text-xs text-gray-400">{WEEKDAYS[i]}</span>
              <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ${
                todayCell ? 'bg-[#0F6E56] text-white font-medium' :
                selectedCell ? 'bg-[#E1F5EE] text-[#085041] font-medium' :
                'text-gray-700'
              }`}>
                {d.getDate()}
              </span>
              {work && !todayCell && (
                <div className="w-1 h-1 rounded-full bg-[#0F6E56]" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}