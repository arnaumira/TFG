type AttendanceStatus = 'present' | 'absent' | 'pending'

interface AttendanceBadgeProps {
  status: AttendanceStatus
}

const CONFIG = {
  present: { label: 'Present',  bg: 'bg-[#E1F5EE]', text: 'text-[#085041]', dot: 'bg-green-500' },
  absent:  { label: 'Absent',   bg: 'bg-red-50',    text: 'text-red-700',   dot: 'bg-red-500'   },
  pending: { label: 'Pendent',  bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400' },
}

export default function AttendanceBadge({ status }: AttendanceBadgeProps) {
  const c = CONFIG[status]
  return (
    <div className={`flex items-center gap-1.5 ${c.bg} rounded-full px-2.5 py-1`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`text-xs font-medium ${c.text}`}>{c.label}</span>
    </div>
  )
}