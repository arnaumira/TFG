import { useState, useEffect } from 'react'
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout'
import RubricDrawer from '../../components/coordinator/RubricDrawer'
import { getRubrics, updateRubric } from '../../api/evaluations'
import type { Rubric } from '../../api/evaluations'

export default function CoordinatorRubricsPage() {
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRubricId, setEditingRubricId] = useState<string | undefined>()

  const loadRubrics = () => {
    setLoading(true)
    getRubrics().then(setRubrics).finally(() => setLoading(false))
  }

  useEffect(() => { loadRubrics() }, [])

  const handleNew = () => {
    setEditingRubricId(undefined)
    setDrawerOpen(true)
  }

  const handleEdit = (id: string) => {
    setEditingRubricId(id)
    setDrawerOpen(true)
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('Segur que vols desactivar aquesta rúbrica?')) return
    await fetch(`http://localhost:5099/api/rubric/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tauli_user') ?? '{}').token}`
      }
    })
    loadRubrics()
  }

  return (
    <CoordinatorLayout
      title="Rúbriques"
      action={
        <button
          onClick={handleNew}
          className="h-9 px-4 bg-[#0F6E56] text-white text-sm font-medium rounded-lg hover:bg-[#0a5a45] transition-colors"
        >
          + Nova rúbrica
        </button>
      }
    >
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">Carregant...</p>
        </div>
      ) : rubrics.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">No hi ha rúbriques creades</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rubrics.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-gray-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{r.title}</p>
                {r.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{r.description}</p>
                )}
              </div>

              <span className="text-xs font-medium text-[#0F6E56] bg-[#E1F5EE] px-2.5 py-1 rounded-full flex-shrink-0">
                {r.criteriaCount ?? r.criteria?.length ?? 0} criteris
              </span>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(r.id)}
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#555" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleDeactivate(r.id)}
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-red-50 transition-colors group"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#bbb" strokeWidth="2" strokeLinecap="round"
                    className="group-hover:stroke-red-400 transition-colors">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {drawerOpen && (
        <RubricDrawer
          rubricId={editingRubricId}
          onClose={() => setDrawerOpen(false)}
          onSaved={loadRubrics}
        />
      )}
    </CoordinatorLayout>
  )
}