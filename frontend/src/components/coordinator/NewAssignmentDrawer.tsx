import { useState, useEffect } from 'react'
import {
  getAllStudents, getAllClinicalTutors, getAllAcademicTutors, createAssignment
} from '../../api/coordinator'
import type { StudentOption, ClinicalTutorOption, AcademicTutorOption } from '../../api/coordinator'
import SearchSelect from './SearchSelect'
import DateRangePicker from './DateRangePicker'
import ExcelImportTab from './ExcelImportTab'

interface NewAssignmentDrawerProps {
  onClose: () => void
  onCreated: () => void
}

type Tab = 'manual' | 'excel'

export default function NewAssignmentDrawer({ onClose, onCreated }: NewAssignmentDrawerProps) {
  const [tab, setTab] = useState<Tab>('manual')
  const [students, setStudents] = useState<StudentOption[]>([])
  const [clinicalTutors, setClinicalTutors] = useState<ClinicalTutorOption[]>([])
  const [academicTutors, setAcademicTutors] = useState<AcademicTutorOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Camps del formulari
  const [studentId, setStudentId] = useState('')
  const [clinicalTutorId, setClinicalTutorId] = useState('')
  const [academicTutorId, setAcademicTutorId] = useState('')
  const [academicYear, setAcademicYear] = useState('2024-25')
  const [area, setArea] = useState('')
  const [building, setBuilding] = useState('')
  const [floor, setFloor] = useState('')
  const [unit, setUnit] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    Promise.all([
      getAllStudents(),
      getAllClinicalTutors(),
      getAllAcademicTutors(),
    ]).then(([s, ct, at]) => {
      setStudents(s)
      setClinicalTutors(ct)
      setAcademicTutors(at)
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !clinicalTutorId || !academicTutorId) {
      setError('Selecciona estudiant, tutor clínic i tutor acadèmic.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createAssignment({
        studentId, clinicalTutorId, academicTutorId,
        academicYear, area, building, floor, unit, startDate, endDate,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
        'Error en crear l\'assignació. Torna-ho a intentar.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-white z-50 flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-medium text-gray-900">Nova assignació</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === 'manual' ? (
            loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Carregant dades...</p>
            ) : (
              <form id="assignment-form" onSubmit={handleSubmit} className="space-y-5">

                {error && (
                  <div className="bg-red-50 rounded-xl px-4 py-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Estudiant */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Estudiant
                  </p>
                  <SearchSelect
                    options={students.map(s => ({
                      id: s.id,
                      label: s.fullName,
                      sublabel: s.currentCourse
                        ? `${s.currentCourse}r curs · ${s.university}`
                        : s.university
                    }))}
                    value={studentId}
                    onChange={setStudentId}
                    placeholder="Selecciona un estudiant..."
                  />
                </div>

                {/* Tutors */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Tutors
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">
                        Tutor clínic
                      </label>
                      <SearchSelect
                        options={clinicalTutors.map(t => ({
                          id: t.id,
                          label: t.fullName,
                          sublabel: t.specialty ?? undefined
                        }))}
                        value={clinicalTutorId}
                        onChange={setClinicalTutorId}
                        placeholder="Selecciona un tutor clínic..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">
                        Tutor acadèmic
                      </label>
                      <SearchSelect
                        options={academicTutors.map(t => ({
                          id: t.id,
                          label: t.fullName,
                          sublabel: t.department ?? undefined
                        }))}
                        value={academicTutorId}
                        onChange={setAcademicTutorId}
                        placeholder="Selecciona un tutor acadèmic..."
                      />
                    </div>
                  </div>
                </div>

                {/* Localització */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Localització
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Edifici</label>
                      <input
                        type="text"
                        value={building}
                        onChange={e => setBuilding(e.target.value)}
                        placeholder="Edifici A"
                        required
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Planta</label>
                      <input
                        type="text"
                        value={floor}
                        onChange={e => setFloor(e.target.value)}
                        placeholder="3a planta"
                        required
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Àrea</label>
                      <input
                        type="text"
                        value={area}
                        onChange={e => setArea(e.target.value)}
                        placeholder="Pediatria"
                        required
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Unitat</label>
                      <input
                        type="text"
                        value={unit}
                        onChange={e => setUnit(e.target.value)}
                        placeholder="UCI Pediàtrica"
                        required
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Període */}
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Període
                  </p>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChangeStart={setStartDate}
                    onChangeEnd={setEndDate}
                  />
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1.5">
                      Curs acadèmic
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={e => setAcademicYear(e.target.value)}
                      placeholder="2024-25"
                      required
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] bg-gray-50"
                    />
                  </div>
                </div>

              </form>
            )
          ) : (
            <ExcelImportTab onImported={() => { onCreated(); onClose() }} />
          )}
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel·lar
          </button>
          {tab === 'manual' && (
            <button
              form="assignment-form"
              type="submit"
              disabled={submitting || loading}
              className="flex-1 h-10 bg-[#0F6E56] text-white text-sm font-medium rounded-xl disabled:opacity-60 hover:bg-[#0a5a45] transition-colors"
            >
              {submitting ? 'Creant...' : 'Crear assignació'}
            </button>
          )}
        </div>

      </div>
    </>
  )
}