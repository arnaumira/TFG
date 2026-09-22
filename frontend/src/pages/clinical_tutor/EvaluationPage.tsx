import { useState, useEffect } from 'react'
import BottomNav from '../../components/BottomNav'
import { clinicalTutorNav } from '../../config/navConfig'
import { getRubrics, getRubricWithCriteria, createEvaluation, getEvaluationByAssignmentAndRubric, updateEvaluation } from '../../api/evaluations'
import { getAssignedStudents } from '../../api/clinicalTutor'
import type { Rubric, EvaluationScore } from '../../api/evaluations'
import type { StudentSummary } from '../../api/clinicalTutor'


type Step = 'select_rubric' | 'score' | 'done'

export default function ClinicalTutorEvaluationPage() {
  const [step, setStep] = useState<Step>('select_rubric')
  const [student, setStudent] = useState<StudentSummary | null>(null)
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingEvaluationId, setExistingEvaluationId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getAssignedStudents(),
      getRubrics(),
    ]).then(([students, rubs]) => {
      setStudent(students[0] ?? null)
      setRubrics(rubs)
    }).finally(() => setLoading(false))
  }, [])


const handleSelectRubric = async (rubric: Rubric) => {
  const [full, existing] = await Promise.all([
    getRubricWithCriteria(rubric.id),
    student ? getEvaluationByAssignmentAndRubric(student.assignmentId, rubric.id) : null
  ])

  setSelectedRubric(full)

  if (existing) {
    const savedScores: Record<string, number> = {}
    existing.scores.forEach(s => { savedScores[s.criteriaId] = s.score })
    setScores(savedScores)
    setComments(existing.comments ?? '')
    setExistingEvaluationId(existing.id)
    } else {
    const initialScores: Record<string, number> = {}
    full.criteria.forEach(c => { initialScores[c.id] = 0 })
    setScores(initialScores)
    setComments('')
    setExistingEvaluationId(null)
    }
  setStep('score')
}

  const handleSubmit = async () => {
  if (!selectedRubric || !student) return
  setSubmitting(true)
  try {
    const payload = {
      assignmentId: student.assignmentId,
      rubricId: selectedRubric.id,
      comments,
      scores: Object.entries(scores).map(([criteriaId, score]) => ({
        criteriaId,
        score,
      })),
    }

    if (existingEvaluationId) {
      await updateEvaluation(existingEvaluationId, payload)
    } else {
      await createEvaluation(payload)
    }

    setStep('done')
  } finally {
    setSubmitting(false)
  }
}

  const totalScore = selectedRubric
    ? Object.values(scores).reduce((a, b) => a + b, 0)
    : 0
  const maxTotal = selectedRubric
    ? selectedRubric.criteria.reduce((a, c) => a + c.maxScore, 0)
    : 0

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

        <h1 className="text-xl font-semibold text-gray-900 mb-1">Avaluació</h1>
        {student && (
          <p className="text-sm text-gray-400 mb-6">{student.fullName}</p>
        )}

        {/* STEP 1 — Seleccionar rúbrica */}
        {step === 'select_rubric' && (
          <>
            <p className="text-sm font-medium text-gray-900 mb-3">
              Selecciona una rúbrica
            </p>
            {rubrics.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm text-gray-400 text-center">
                  No hi ha rúbriques disponibles
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rubrics.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRubric(r)}
                    className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left flex items-center justify-between active:scale-[0.98] transition-transform"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.title}</p>
                      {r.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
                      )}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#bbb" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* STEP 2 — Puntuar criteris */}
        {step === 'score' && selectedRubric && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setStep('select_rubric')}
                className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#555" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedRubric.title}</p>
                <p className="text-xs text-gray-400">
                  Puntuació total: {totalScore} / {maxTotal}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {selectedRubric.criteria.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-3">
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      {c.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[#0F6E56]">
                      {scores[c.id]} / {c.maxScore}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={c.maxScore}
                    value={scores[c.id] ?? 0}
                    onChange={e => setScores(prev => ({
                      ...prev,
                      [c.id]: Number(e.target.value)
                    }))}
                    className="w-full accent-[#0F6E56]"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-300">0</span>
                    <span className="text-xs text-gray-300">{c.maxScore}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <label className="block text-xs text-gray-500 mb-1.5">
                Comentaris (opcional)
              </label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Afegeix observacions sobre l'alumne..."
                rows={3}
                className="w-full text-sm text-gray-900 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-12 bg-[#0F6E56] text-white text-sm font-medium rounded-xl disabled:opacity-60 active:scale-[0.98] transition-transform"
            >
              {submitting ? 'Guardant...' : 'Guardar avaluació'}
            </button>
          </>
        )}

        {/* STEP 3 — Confirmació */}
        {step === 'done' && (
        <div className="flex flex-col items-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
            </div>
            <p className="text-base font-medium text-gray-900">
            {existingEvaluationId ? 'Avaluació actualitzada' : 'Avaluació guardada'}
            </p>
            <p className="text-sm text-gray-400 text-center">
            La puntuació ja és visible per a l'estudiant
            </p>
            <button
            onClick={() => {
                setStep('select_rubric')
                setSelectedRubric(null)
                setScores({})
                setComments('')
                setExistingEvaluationId(null)
            }}
            className="mt-4 h-11 px-6 rounded-xl border border-gray-200 text-sm text-gray-600"
            >
            Tornar a les rúbriques
            </button>
        </div>
        )}

      </div>
      <BottomNav items={clinicalTutorNav} />
    </div>
  )
}