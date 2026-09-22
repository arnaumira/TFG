import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { generateQrToken } from '../api/attendance'

interface QrModalProps {
  sessionId: string
  sessionDate: string
  onClose: () => void
}

export default function QrModal({ sessionId, sessionDate, onClose }: QrModalProps) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    generateQrToken(sessionId)
      .then(setToken)
      .catch(() => setError('Error generant el QR'))
      .finally(() => setLoading(false))
  }, [sessionId])

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-medium text-gray-900">Codi QR</h2>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{sessionDate}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-gray-400">Generant QR...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : token && (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <QRCodeSVG
                value={token}
                size={200}
                bgColor="#ffffff"
                fgColor="#0F6E56"
                level="M"
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              L'estudiant ha d'escanejar aquest codi per registrar l'assistència
            </p>
            <div className="bg-gray-50 rounded-xl px-4 py-2 w-full">
              <p className="text-xs text-gray-400 text-center font-mono break-all">{token}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}