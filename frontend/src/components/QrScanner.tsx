import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
import { scanQr } from '../api/attendance'

interface QrScannerProps {
  onSuccess: () => void
  onClose: () => void
}

export default function QrScanner({ onSuccess, onClose }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lockRef = useRef(false)        // evita processar el mateix QR en cada fotograma
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    const scanner = new Html5Qrcode('qr-reader', { verbose: false })
    scannerRef.current = scanner

    const safeStop = async () => {
      try {
        if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
          await scanner.stop()
        }
        scanner.clear()
      } catch {
        // ignorem errors en aturar
      }
    }

    const handleDecoded = async (decodedText: string) => {
      if (lockRef.current || cancelled) return
      lockRef.current = true
      setError('')
      try {
        await scanQr(decodedText.trim())
        if (cancelled) return
        await safeStop()
        setSuccess(true)
        setTimeout(() => { onSuccess(); onClose() }, 1500)
      } catch {
        if (cancelled) return
        setError("QR invàlid o ja has registrat l'assistència avui.")
        // marge perquè no repeteixi la crida en cada fotograma
        setTimeout(() => { lockRef.current = false }, 1500)
      }
    }

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        handleDecoded,
        () => {} // errors de fotograma: els ignorem
      )
      .catch((err: unknown) => {
        const msg = String((err as Error)?.message ?? err).toLowerCase()
        if (/permission|denied|notallowed/.test(msg))
          setError("Cal permetre l'accés a la càmera al navegador.")
        else if (/secure|https|mediadevices/.test(msg))
          setError("La càmera només funciona amb HTTPS. Obre l'app amb l'enllaç segur.")
        else
          setError("No s'ha pogut accedir a la càmera.")
      })

    return () => {
      cancelled = true
      safeStop()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <div className="w-full max-w-sm px-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-base font-medium">Escanejar QR</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-base font-medium text-gray-900">Assistència registrada!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden">
            <div id="qr-reader" className="w-full" />
            {error && (
              <div className="px-4 py-3 bg-red-50">
                <p className="text-sm text-red-700 text-center">{error}</p>
              </div>
            )}
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400 text-center">
                Apunta la càmera al codi QR del tutor clínic
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}