interface InfoRow {
  label: string
  value: string
  icon: React.ReactNode
}

interface InfoCardProps {
  title: string
  rows: InfoRow[]
}

export default function ProfileInfoCard({ title, rows }: InfoCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-4">
      <div className="px-5 py-3">
        <p className="text-xs font-medium text-gray-900">{title}</p>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
            {row.icon}
          </div>
          <div>
            <p className="text-xs text-gray-400">{row.label}</p>
            <p className="text-sm font-medium text-gray-900">{row.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}