const WEEKDAYS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

interface MonthCalendarProps {
  currentDate: Date
  selectedDate: Date
  workDays: number[]
  onSelectDate: (date: Date) => void
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const days: { day: number; currentMonth: boolean }[] = []

  for (let i = offset - 1; i >= 0; i--)
    days.push({ day: daysInPrev - i, currentMonth: false })
  for (let i = 1; i <= daysInMonth; i++)
    days.push({ day: i, currentMonth: true })
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++)
    days.push({ day: i, currentMonth: false })

  return days
}

export default function MonthCalendar({
  currentDate, selectedDate, workDays, onSelectDate
}: MonthCalendarProps) {
  const today = new Date()
  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth())

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
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {monthDays.map((cell, i) => {
          const cellDate = new Date(
            currentDate.getFullYear(),
            cell.currentMonth
              ? currentDate.getMonth()
              : i < 7 ? currentDate.getMonth() - 1 : currentDate.getMonth() + 1,
            cell.day
          )
          const todayCell = isToday(cellDate)
          const selectedCell = isSelected(cellDate)
          const work = cell.currentMonth && workDays.includes(cell.day)

          return (
            <button
              key={i}
              onClick={() => cell.currentMonth && onSelectDate(cellDate)}
              className="flex flex-col items-center py-0.5"
            >
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs transition-colors ${
                todayCell ? 'bg-[#0F6E56] text-white font-medium' :
                selectedCell ? 'bg-[#E1F5EE] text-[#085041] font-medium' :
                cell.currentMonth ? 'text-gray-700' : 'text-gray-300'
              }`}>
                {cell.day}
              </span>
              {work && !todayCell && (
                <div className="w-1 h-1 rounded-full bg-[#0F6E56] mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}