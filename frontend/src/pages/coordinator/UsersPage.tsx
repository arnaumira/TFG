import { useState, useEffect } from 'react'
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout'
import { getAllUsers } from '../../api/coordinator'
import type { UserDetail } from '../../api/coordinator'

type RoleFilter = 'all' | 'student' | 'clinical_tutor' | 'academic_tutor'

const ROLE_LABELS: Record<string, string> = {
  student: 'Estudiant',
  clinical_tutor: 'Tutor clínic',
  academic_tutor: 'Tutor acadèmic',
}

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-indigo-50 text-indigo-700',
  clinical_tutor: 'bg-orange-50 text-orange-700',
  academic_tutor: 'bg-green-50 text-green-700',
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ca-ES', {
    month: 'short', year: 'numeric'
  })
}

export default function CoordinatorUsersPage() {
  const [users, setUsers] = useState<UserDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<RoleFilter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<UserDetail | null>(null)

  useEffect(() => {
  getAllUsers().then(data => {
    // Elimina duplicats per id (evita claus de React repetides)
    const unique = Array.from(new Map(data.map(u => [u.id, u])).values())
    setUsers(unique)
  }).finally(() => setLoading(false))
}, [])

  const filtered = users.filter(u => {
  const matchRole = filter === 'all' || u.role === filter
  const matchSearch = search === '' ||
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  return matchRole && matchSearch  // les dues condicions han de ser true
})

  const FILTERS: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: 'Tots' },
    { value: 'student', label: 'Estudiants' },
    { value: 'clinical_tutor', label: 'Tutors clínics' },
    { value: 'academic_tutor', label: 'Tutors acadèmics' },
  ]

  return (
    <CoordinatorLayout
      title="Usuaris"
      action={
        <span className="text-sm text-gray-400">{filtered.length} usuaris</span>
      }
    >
      <div className="flex gap-6">

        {/* Contingut principal */}
        <div className="flex-1 min-w-0">

          {/* Filtres de rol */}
          <div className="flex gap-2 mb-3">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-[#0F6E56] text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cerca */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#bbb" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cerca per nom o email..."
              className="flex-1 text-sm focus:outline-none text-gray-700 placeholder:text-gray-300"
            />
          </div>

          {/* Taula */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-5 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider col-span-2">
                Usuari
              </p>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rol</p>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Especialitat / Curs
              </p>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Assignació
              </p>
            </div>

            {loading ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-gray-400">Carregant...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-gray-400">No s'han trobat usuaris</p>
              </div>
            ) : (
              filtered.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelected(u.id === selected?.id ? null : u)}
                  className={`w-full grid grid-cols-5 px-5 py-3 border-b border-gray-50 transition-colors items-center text-left ${
                    selected?.id === u.id ? 'bg-[#f8fffc]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 col-span-2">
                    <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-[#0F6E56]">
                        {u.fullName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {u.role === 'student'
                      ? u.currentCourse ? `${u.currentCourse}r curs` : '—'
                      : u.specialty ?? u.faculty ?? '—'
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {u.role === 'student'
                      ? u.area ?? 'Sense assignació'
                      : u.studentCount
                        ? `${u.studentCount} alumne${u.studentCount !== 1 ? 's' : ''}`
                        : 'Sense alumnes'
                    }
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Panel de detall */}
        {selected && (
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

              {/* Header */}
              <div className="px-4 py-4 border-b border-gray-50 flex items-center justify-between">
                <p className="text-xs font-medium text-gray-900">Detall</p>
                <button
                  onClick={() => setSelected(null)}
                  className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="px-4 py-4">

                {/* Avatar i nom */}
                <div className="flex flex-col items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-2">
                    <span className="text-lg font-medium text-[#0F6E56]">
                      {selected.fullName.charAt(0)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center">{selected.fullName}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${ROLE_COLORS[selected.role]}`}>
                    {ROLE_LABELS[selected.role]}
                  </span>
                </div>

                {/* Dades personals */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Dades personals
                  </p>
                  <div className="space-y-1.5">
                    <DetailRow label="Email" value={selected.email} />
                    {selected.niu && <DetailRow label="NIU" value={selected.niu} />}
                    {selected.university && <DetailRow label="Universitat" value={selected.university} />}
                    {selected.currentCourse && <DetailRow label="Curs" value={`${selected.currentCourse}r curs`} />}
                    {selected.degree && <DetailRow label="Grau" value={selected.degree} />}
                    {selected.specialty && <DetailRow label="Especialitat" value={selected.specialty} />}
                    {selected.department && <DetailRow label="Departament" value={selected.department} />}
                    {selected.faculty && <DetailRow label="Facultat" value={selected.faculty} />}
                    {selected.officeLocation && <DetailRow label="Despatx" value={selected.officeLocation} />}
                    {selected.licenseNumber && <DetailRow label="Núm. col·legiat" value={selected.licenseNumber} />}
                  </div>
                </div>

                {/* Assignació (estudiants) */}
                {selected.role === 'student' && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Assignació activa
                    </p>
                    {selected.assignmentId ? (
                      <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                        <p className="text-xs font-medium text-gray-900">
                          {selected.area} · {selected.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selected.building} · {selected.floor}
                        </p>
                        {selected.clinicalTutorName && (
                          <p className="text-xs text-gray-500">
                            Tutor clínic: {selected.clinicalTutorName}
                          </p>
                        )}
                        {selected.academicTutorName && (
                          <p className="text-xs text-gray-500">
                            Tutor acadèmic: {selected.academicTutorName}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {formatDate(selected.assignmentStartDate)} – {formatDate(selected.assignmentEndDate)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Sense assignació activa</p>
                    )}
                  </div>
                )}

                {/* Resum alumnes (tutors) */}
                {selected.role !== 'student' && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Alumnes
                    </p>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-semibold text-[#0F6E56]">
                        {selected.studentCount ?? 0}
                      </p>
                      <p className="text-xs text-gray-400">
                        alumne{(selected.studentCount ?? 0) !== 1 ? 's' : ''} assignat{(selected.studentCount ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </CoordinatorLayout>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}