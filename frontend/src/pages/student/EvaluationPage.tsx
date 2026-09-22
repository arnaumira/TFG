import { useState, useEffect } from 'react'
import BottomNav from '../../components/BottomNav'
import { studentNav } from '../../config/navConfig'
import { getEvaluationsByAssignment } from '../../api/evaluations'
import { getCurrentAssignment } from '../../api/assignments'
import type { EvaluationDetail } from '../../api/evaluations'

export default function StudentEvaluationPage() {
  const [evaluations, setEvaluations] = useState<EvaluationDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getCurrentAssignment()
      .then(a => getEvaluationsByAssignment(a.id))
      .then(setEvaluations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ca-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

  const getAverage = (eval_: EvaluationDetail) => {
    if (eval_.scores.length === 0) return 0
    const total = eval_.scores.reduce((a, s) => a + s.score, 0)
    const max = eval_.scores.reduce((a, s) => a + s.maxScore, 0)
    return Math.round((total / max) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <p className="text-sm text-gray-400">Carregant...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="max-w-md mx-auto px-5 pt-12 pb-28">

        <h1 className="text-xl font-semibold text-gray-900 mb-6">Avaluacions</h1>

        {evaluations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Sense avaluacions</p>
            <p className="text-xs text-gray-400">
              El tutor clínic encara no t'ha avaluat
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {evaluations.map(e => {
              const avg = getAverage(e)
              const isExpanded = expanded === e.id

              return (
                <div key={e.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : e.id)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{e.rubricTitle}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(e.evaluatedAt)} · {e.evaluatedByName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-sm font-semibold ${
                        avg >= 70 ? 'text-[#0F6E56]' :
                        avg >= 50 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {avg}%
                      </div>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="#bbb" strokeWidth="2" strokeLinecap="round"
                        className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      >
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-50 px-4 pb-4">
                      <div className="space-y-3 mt-3">
                        {e.scores.map(s => (
                          <div key={s.criteriaId}>
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-xs text-gray-600">{s.criterionName}</p>
                              <p className="text-xs font-medium text-gray-900">
                                {s.score} / {s.maxScore}
                              </p>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full">
                              <div
                                className="h-1.5 bg-[#0F6E56] rounded-full transition-all"
                                style={{ width: `${(s.score / s.maxScore) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {e.comments && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">Comentaris</p>
                          <p className="text-sm text-gray-700">{e.comments}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
      <BottomNav items={studentNav} />
    </div>
  )
}