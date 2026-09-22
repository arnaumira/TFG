import { useState, useEffect } from 'react'
import type { Rubric } from '../../api/evaluations'
import { getRubricWithCriteria, updateRubric, createRubric } from '../../api/evaluations'
import RubricImportTab from './RubricImportTab'

interface RubricDrawerProps {
  rubricId?: string  // si és undefined, és creació nova
  onClose: () => void
  onSaved: () => void
}

interface LocalCriterion {
  tempId: string
  name: string
  description: string
  maxScore: number
}

export default function RubricDrawer({ rubricId, onClose, onSaved }: RubricDrawerProps) {
  const isEditing = !!rubricId
  const [tab, setTab] = useState<'manual' | 'excel'>('manual')
  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [criteria, setCriteria] = useState<LocalCriterion[]>([])
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!rubricId) {
      // Nova rúbrica amb un criteri buit per defecte
      setCriteria([newCriterion()])
      return
    }
    getRubricWithCriteria(rubricId).then(r => {
      setTitle(r.title)
      setDescription(r.description ?? '')
      setCriteria(r.criteria.map(c => ({
        tempId: c.id,
        name: c.name,
        description: c.description ?? '',
        maxScore: c.maxScore
      })))
    }).finally(() => setLoading(false))
  }, [rubricId])

  function newCriterion(): LocalCriterion {
    return { tempId: crypto.randomUUID(), name: '', description: '', maxScore: 10 }
  }

  const addCriterion = () => {
    const c = newCriterion()
    setCriteria(prev => [...prev, c])
    setExpandedCriterion(c.tempId)
  }

  const removeCriterion = (tempId: string) => {
    setCriteria(prev => prev.filter(c => c.tempId !== tempId))
    if (expandedCriterion === tempId) setExpandedCriterion(null)
  }

  const updateCriterion = (tempId: string, field: keyof LocalCriterion, value: string | number) => {
    setCriteria(prev => prev.map(c =>
      c.tempId === tempId ? { ...c, [field]: value } : c
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      const rubric: Rubric = {
        id: rubricId ?? '00000000-0000-0000-0000-000000000000',
        title,
        description: description || null,
        criteria: criteria.map((c, i) => ({
          id: '00000000-0000-0000-0000-000000000000',
          rubricId: rubricId ?? '00000000-0000-0000-0000-000000000000',
          name: c.name,
          description: c.description || null,
          maxScore: c.maxScore,
          orderIndex: i
        }))
      }

      if (isEditing) {
        await updateRubric(rubricId!, rubric)
      } else {
        await createRubric(rubric)
      }

      onSaved()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-white z-50 flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-medium text-gray-900">
            {isEditing ? 'Editar rúbrica' : 'Nova rúbrica'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs — només en mode creació */}
        {!isEditing && (
          <div className="px-6 pt-4">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTab('manual')}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setTab('excel')}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === 'excel' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Importar Excel
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === 'excel' && !isEditing ? (
            <RubricImportTab onImported={() => { onSaved(); onClose() }} />
          ) : loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Carregant...</p>
          ) : (
            <form id="rubric-form" onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Títol</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Competències clíniques bàsiques"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Descripció</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descripció de la rúbrica..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-gray-50 resize-none"
                />
              </div>

              {/* Criteris */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                  Criteris ({criteria.length})
                </p>

                <div className="space-y-2">
                  {criteria.map((c, i) => {
                    const isExpanded = expandedCriterion === c.tempId
                    return (
                      <div
                        key={c.tempId}
                        draggable
                        onDragStart={() => setDragIndex(i)}
                        onDragOver={e => {
                          e.preventDefault()
                          if (dragIndex === null || dragIndex === i) return
                          setCriteria(prev => {
                            const next = [...prev]
                            const [moved] = next.splice(dragIndex, 1)
                            next.splice(i, 0, moved)
                            return next
                          })
                          setDragIndex(i)
                        }}
                        onDragEnd={() => setDragIndex(null)}
                        className={`border border-gray-100 rounded-xl overflow-hidden transition-opacity ${
                          dragIndex === i ? 'opacity-50' : 'opacity-100'
                        }`}
                      >
                        {/* Fila principal */}
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50">
                          <span
                            className="text-gray-300 cursor-grab active:cursor-grabbing text-sm select-none"
                            title="Arrossega per reordenar"
                          >
                            ⠿
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedCriterion(isExpanded ? null : c.tempId)}
                            className="flex-1 text-left"
                          >
                            {c.name ? (
                              <span className="text-sm text-gray-900">{c.name}</span>
                            ) : (
                              <span className="text-sm text-gray-300">Criteri {i + 1}...</span>
                            )}
                          </button>
                          <span className="text-xs font-medium text-[#0F6E56] bg-[#E1F5EE] px-2 py-0.5 rounded-full">
                            / {c.maxScore}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCriterion(c.tempId)}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>

                        {/* Detall expandit */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-gray-100">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Nom</label>
                              <input
                                type="text"
                                value={c.name}
                                onChange={e => updateCriterion(c.tempId, 'name', e.target.value)}
                                placeholder="Ex: Higiene de mans"
                                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Descripció</label>
                              <textarea
                                value={c.description}
                                onChange={e => updateCriterion(c.tempId, 'description', e.target.value)}
                                placeholder="Ex: Correcta aplicació del protocol..."
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-white resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">
                                Puntuació màxima
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min={1}
                                  max={10}
                                  value={c.maxScore}
                                  onChange={e => updateCriterion(c.tempId, 'maxScore', Number(e.target.value))}
                                  className="flex-1 accent-[#0F6E56]"
                                />
                                <span className="text-sm font-medium text-[#0F6E56] w-6 text-right">
                                  {c.maxScore}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Afegir criteri */}
                <button
                  type="button"
                  onClick={addCriterion}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-200 rounded-xl text-sm text-[#0F6E56] hover:border-[#0F6E56] hover:bg-[#f8fffc] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Afegir criteri
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Footer — només a la tab manual */}
        {tab === 'manual' && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel·lar
            </button>
            <button
              form="rubric-form"
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 bg-[#0F6E56] text-white text-sm font-medium rounded-xl disabled:opacity-60"
            >
              {submitting ? 'Guardant...' : isEditing ? 'Guardar canvis' : 'Crear rúbrica'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}