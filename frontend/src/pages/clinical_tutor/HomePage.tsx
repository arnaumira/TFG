import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../../components/BottomNav'
import AttendanceBadge from '../../components/AttendanceBadge'
import AnnouncementBell from '../../components/AnnouncementBell'
import { clinicalTutorNav } from '../../config/navConfig'
import {
  getClinicalTutorProfile,
  getTodayAttendance,
} from '../../api/clinicalTutor'
import type { ClinicalTutorProfile, TodayAttendance } from '../../api/clinicalTutor'
import QrModal from '../../components/QrModal'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bon dia'
  if (h < 20) return 'Bona tarda'
  return 'Bona nit'
}

function formatDate() {
  return new Date().toLocaleDateString('ca-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

function formatTime(time: string) {
  return time.substring(0, 5)
}

export default function ClinicalTutorHomePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ClinicalTutorProfile | null>(null)
  const [attendance, setAttendance] = useState<TodayAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [qrSession, setQrSession] = useState<{ sessionId: string; date: string } | null>(null)

  useEffect(() => {
    Promise.all([
      getClinicalTutorProfile(),
      getTodayAttendance(),
    ]).then(([prof, att]) => {
      setProfile(prof)
      setAttendance(att)
    }).catch(() => {
      logout()
      navigate('/login')
    }).finally(() => setLoading(false))
  }, [])

  const firstName = profile?.fullName.split(' ').slice(-2).join(' ') ?? ''

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="max-w-md mx-auto px-5 pt-12 pb-28">

        {/* Capçalera */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getGreeting()}, {firstName}!
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 capitalize">
              {formatDate()}
            </p>
          </div>
          <AnnouncementBell />
        </div>

        {/* Card assistència avui */}
        <p className="text-sm font-medium text-gray-900 mb-3">Assistència avui</p>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-400 text-center">Carregant...</p>
          </div>
        ) : attendance.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-400 text-center">
              No hi ha sessions planificades avui
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {attendance.map(a => (
              <div key={a.studentId} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-[#0F6E56]">
                    {a.studentName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.studentName}</p>
                  <p className="text-xs text-gray-400">
                    {formatTime(a.startTime)} – {formatTime(a.endTime)}
                  </p>
                </div>
                <AttendanceBadge status={a.attendanceStatus} />
                <button
                  onClick={() => setQrSession({
                    sessionId: a.sessionId,
                    date: new Date().toLocaleDateString('ca-ES', {
                      weekday: 'long', day: 'numeric', month: 'long'
                    })
                  })}
                  className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center ml-1"
                  title="Generar QR"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        {qrSession && (
          <QrModal
            sessionId={qrSession.sessionId}
            sessionDate={qrSession.date}
            onClose={() => setQrSession(null)}
          />
        )}
      </div>
      <BottomNav items={clinicalTutorNav} />
    </div>
  )
}