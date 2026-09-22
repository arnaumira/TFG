import type { ReactNode } from 'react'

interface DayInfo {
  hospital: string
  building: string
  floor: string
  unit: string
  clinicalTutor: string
  startTime: string
  endTime: string
}

interface DayInfoCardProps {
  date: Date
  info: DayInfo
}

function formatTime(time: string) {
  return time.substring(0, 5)
}

export default function DayInfoCard({ date, info }: DayInfoCardProps) {
  const formattedDate = date.toLocaleDateString('ca-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
      <div className="px-5 py-3">
        <p className="text-xs font-medium text-gray-900 capitalize">{formattedDate}</p>
      </div>
      <InfoRow
        icon={<ClockIcon />}
        label="Horari"
        value={`${formatTime(info.startTime)} – ${formatTime(info.endTime)}`}
      />
      <InfoRow
        icon={<HospitalIcon />}
        label="Hospital"
        value={info.hospital}
      />
      <InfoRow
        icon={<BuildingIcon />}
        label="Edifici / Planta"
        value={`${info.building} · ${info.floor}`}
      />
      <InfoRow
        icon={<UnitIcon />}
        label="Unitat"
        value={info.unit}
      />
      <InfoRow
        icon={<PersonIcon />}
        label="Tutor clínic"
        value={info.clinicalTutor}
      />
    </div>
  )
}

function InfoRow({ icon, label, value }: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function HospitalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  )
}

function UnitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}