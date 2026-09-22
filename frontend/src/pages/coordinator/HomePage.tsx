import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout'
import { getStats, getAllAssignments } from '../../api/coordinator'
import type { CoordinatorStats } from '../../api/coordinator'
import type { AssignmentDetail } from '../../api/assignments'

export default function CoordinatorHomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<CoordinatorStats | null>(null)
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getAllAssignments()])
      .then(([s, a]) => {
        setStats(s)
        setAssignments(a.slice(0, 5)) // últimes 5
      })
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ca-ES', {
      day: 'numeric', month: 'short', year: 'numeric'
    })

  const isActive = (endDate: string) => new Date(endDate) >= new Date()

  return (
    <CoordinatorLayout title="Inici">

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Estudiants"
          value={stats?.studentCount}
          loading={loading}
          icon={<StudentsIcon />}
          onClick={() => navigate('/coordinator/users')}
        />
        <StatCard
          label="Tutors clínics"
          value={stats?.clinicalTutorCount}
          loading={loading}
          icon={<TutorIcon />}
          onClick={() => navigate('/coordinator/users')}
        />
        <StatCard
          label="Tutors acadèmics"
          value={stats?.academicTutorCount}
          loading={loading}
          icon={<TutorIcon />}
          onClick={() => navigate('/coordinator/users')}
        />
        <StatCard
          label="Assignacions"
          value={stats?.assignmentCount}
          loading={loading}
          icon={<AssignmentsIcon />}
          onClick={() => navigate('/coordinator/assignments')}
        />
        <StatCard
          label="Rúbriques"
          value={stats?.rubricCount}
          loading={loading}
          icon={<RubricsIcon />}
          onClick={() => navigate('/coordinator/rubrics')}
        />
      </div>

      {/* Últimes assignacions */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <p className="text-sm font-medium text-gray-900">Últimes assignacions</p>
          <button
            onClick={() => navigate('/coordinator/assignments')}
            className="text-xs text-[#0F6E56] font-medium hover:underline"
          >
            Veure totes →
          </button>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400">Carregant...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400">No hi ha assignacions creades</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estudiant</p>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tutor clínic</p>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Àrea</p>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Període</p>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estat</p>
            </div>
            {assignments.map(a => (
              <div
                key={a.id}
                className="grid grid-cols-5 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center"
              >
                <p className="text-sm font-medium text-gray-900">{a.studentName}</p>
                <p className="text-sm text-gray-500">{a.clinicalTutorName}</p>
                <div>
                  <p className="text-sm text-gray-900">{a.area}</p>
                  <p className="text-xs text-gray-400">{a.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{formatDate(a.startDate.toString())}</p>
                  <p className="text-xs text-gray-400">{formatDate(a.endDate.toString())}</p>
                </div>
                <div>
                  {isActive(a.endDate.toString()) ? (
                    <span className="inline-flex items-center gap-1.5 bg-[#E1F5EE] text-[#085041] text-xs font-medium px-2.5 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
                      Finalitzada
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

    </CoordinatorLayout>
  )
}

function StatCard({ label, value, loading, icon, onClick }: {
  label: string
  value?: number
  loading: boolean
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-[#0F6E56] hover:shadow-sm transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center mb-3 group-hover:bg-[#0F6E56] transition-colors">
        <span className="text-[#0F6E56] group-hover:text-white transition-colors">
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold text-gray-900 mb-1">
        {loading ? '—' : value ?? 0}
      </p>
      <p className="text-xs text-gray-400">{label}</p>
    </button>
  )
}

function StudentsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}

function TutorIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}

function AssignmentsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
}

function RubricsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}