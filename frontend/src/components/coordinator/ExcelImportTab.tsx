import { useState } from 'react'
import { previewImport, importAssignments } from '../../api/coordinator'
import type { ImportRowResult } from '../../api/coordinator'

interface Props {
  onImported: () => void
}

export default function ExcelImportTab({ onImported }: Props) {
  const [rows, setRows] = useState<ImportRowResult[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    setLoading(true); setError(''); setFileName(file.name); setRows(null)
    try {
      const result = await previewImport(file)
      setRows(result)
    } catch {
      setError('No s\'ha pogut llegir el fitxer. Comprova el format de les columnes.')
    } finally {
      setLoading(false)
    }
  }

  const validRows = rows?.filter(r => r.isValid) ?? []
  const invalidCount = (rows?.length ?? 0) - validRows.length

  const handleImport = async () => {
    setImporting(true)
    try {
      const count = await importAssignments(validRows.map(r => ({
        studentId: r.studentId!,
        clinicalTutorId: r.clinicalTutorId!,
        academicTutorId: r.academicTutorId!,
        academicYear: r.academicYear,
        area: r.area,
        building: r.building,
        floor: r.floor,
        unit: r.unit,
        startDate: r.startDate!,
        endDate: r.endDate!,
      })))
      setDone(count)
    } finally {
      setImporting(false)
    }
  }

  // Pantalla de confirmació
  if (done !== null) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="text-base font-medium text-gray-900">
          {done} assignaci{done !== 1 ? 'ons' : 'ó'} importad{done !== 1 ? 'es' : 'a'}
        </p>
        <button
          onClick={onImported}
          className="mt-2 h-11 px-6 rounded-xl bg-[#0F6E56] text-white text-sm font-medium"
        >
          Tancar
        </button>
      </div>
    )
  }

  return (
    <div className="py-2">
      <p className="text-sm text-gray-500 mb-3">
        El fitxer ha de tenir aquestes columnes (amb capçalera a la primera fila):
        <span className="block mt-1 font-medium text-gray-700">
          email_estudiant · email_tutor_clinic · email_tutor_academic · area ·
          edifici · planta · unitat · data_inici · data_fi · curs_academic
        </span>
      </p>

      {/* Drop zone */}
      {!rows && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Llegint {fileName}...</p>
          ) : (
            <>
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-[#0F6E56] underline">
                  Selecciona un fitxer
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                  }}
                />
              </label>
              <p className="text-xs text-gray-300 mt-2">.xlsx o .xls</p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-xl px-4 py-3 mt-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Preview */}
      {rows && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-[#0F6E56]">{validRows.length} vàlides</span>
              {invalidCount > 0 && (
                <span className="text-red-500"> · {invalidCount} amb errors</span>
              )}
            </p>
            <button
              onClick={() => { setRows(null); setFileName('') }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Canviar fitxer
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {rows.map(r => (
              <div
                key={r.rowNumber}
                className={`rounded-xl border p-3 ${
                  r.isValid ? 'border-gray-100 bg-white' : 'border-red-100 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    {r.studentName ?? r.studentEmail}
                  </p>
                  {r.isValid ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <span className="text-[10px] font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                      Fila {r.rowNumber}
                    </span>
                  )}
                </div>
                {r.isValid ? (
                  <p className="text-xs text-gray-400">
                    {r.clinicalTutorName} · {r.area} · {r.unit}
                  </p>
                ) : (
                  <p className="text-xs text-red-600">{r.error}</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleImport}
            disabled={importing || validRows.length === 0}
            className="w-full h-11 bg-[#0F6E56] text-white text-sm font-medium rounded-xl disabled:opacity-50"
          >
            {importing
              ? 'Important...'
              : `Importar ${validRows.length} assignaci${validRows.length !== 1 ? 'ons' : 'ó'}`
            }
          </button>
        </>
      )}
    </div>
  )
}