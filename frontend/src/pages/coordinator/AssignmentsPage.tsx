import { useState, useEffect } from 'react'
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout'
import NewAssignmentDrawer from '../../components/coordinator/NewAssignmentDrawer'
import { getAllAssignments } from '../../api/coordinator'
import type { AssignmentDetail } from '../../api/assignments'
import AssignmentDetailDrawer from '../../components/coordinator/AssignmentDetailDrawer'


export default function CoordinatorAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [showDrawer, setShowDrawer] = useState(false)
  const [detailAssignment, setDetailAssignment] = useState<AssignmentDetail | null>(null)


  const loadAssignments = () => {
    setLoading(true)
    getAllAssignments()
      .then(setAssignments)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAssignments() }, [])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ca-ES', {
      day: 'numeric', month: 'short', year: 'numeric'
    })

  const isActive = (endDate: string) =>
    new Date(endDate) >= new Date()

  return (
    <CoordinatorLayout
      title="Assignacions"
      action={
        <button
          onClick={() => setShowDrawer(true)}
          className="h-9 px-4 bg-[#0F6E56] text-white text-sm font-medium rounded-lg hover:bg-[#0a5a45] transition-colors"
        >
          + Nova assignació
        </button>
      }
    >
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Capçalera taula */}
        <div className="grid grid-cols-5 px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estudiant</p>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tutor clínic</p>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Àrea</p>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Període</p>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estat</p>
        </div>

        {/* Files */}
        {loading ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400">Carregant...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-400">No hi ha assignacions creades</p>
          </div>
        ) : (
          assignments.map(a => (
            <div
              key={a.id}
              onClick={() => setDetailAssignment(a)}
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
          ))
        )}
      </div>

      {showDrawer && (
        <NewAssignmentDrawer
          onClose={() => setShowDrawer(false)}
          onCreated={loadAssignments}
        />
      )}
      {detailAssignment && (
        <AssignmentDetailDrawer
          assignment={detailAssignment}
          onClose={() => setDetailAssignment(null)}
          onChanged={loadAssignments}
        />
      )}
    </CoordinatorLayout>
  )
}