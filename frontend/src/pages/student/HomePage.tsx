import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import DayInfoCard from '../../components/DayInfoCard'
import BottomNav from '../../components/BottomNav'
import QrScanner from '../../components/QrScanner'
import AnnouncementBell from '../../components/AnnouncementBell'
import { studentNav } from '../../config/navConfig'
import { getMyProfile } from '../../api/students'
import { getCurrentAssignment } from '../../api/assignments'
import { getSessionByDate } from '../../api/sessions'
import { registerManualAttendance } from '../../api/attendance'
import type { StudentProfile } from '../../api/students'
import type { AssignmentDetail } from '../../api/assignments'
import type { SessionDetail } from '../../api/sessions'

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

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [todaySession, setTodaySession] = useState<SessionDetail | null>(null)
  const [todaySessionId, setTodaySessionId] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => { logout(); navigate('/login') })

    getCurrentAssignment()
      .then(a => {
        setAssignment(a)
        return getSessionByDate(a.id, getTodayStr())
      })
      .then(session => {
        setTodaySession(session)
        if (session) {
          setTodaySessionId(session.id)
          // Si el backend ja marca la sessió com a present, reflectim que ha fitxat
          if (session.attendanceStatus === 'present') setHasCheckedIn(true)
        }
      })
      .catch(() => {})
  }, [])

  // Fitxatge manual (botó Entrada)
  const handleManualCheckIn = async () => {
    if (todaySessionId) {
      try {
        await registerManualAttendance(todaySessionId)
      } catch {
        // Si ja estava registrat o falla, continuem igualment
      }
    }
    setHasCheckedIn(true)
    setCheckInTime(new Date())
  }

  // Fitxatge per QR (el QrScanner ja ha registrat l'assistència al backend)
  const handleScanSuccess = () => {
    setHasCheckedIn(true)
    setCheckInTime(new Date())
  }

  const firstName = (profile?.fullName ?? user?.fullName ?? '').split(' ')[0]

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

        {/* Card fitxatge */}
        <div className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
          {hasCheckedIn ? (
            <div className="flex flex-col items-center text-center py-3">
              <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-3">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                  stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-base font-semibold text-gray-900">Assistència registrada</p>
              <p className="text-sm text-gray-400 mt-1">
                {checkInTime
                  ? `Has fitxat a les ${checkInTime.toLocaleTimeString('ca-ES', {
                      hour: '2-digit', minute: '2-digit'
                    })}`
                  : 'Has completat el fitxatge d\'avui'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">Avui</span>
              </div>
              <p className="text-base font-medium text-gray-900 mb-1">Encara no has fitxat</p>
              <p className="text-xs text-gray-400 mb-4">
                Fitxa manualment o escaneja el QR del tutor
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleManualCheckIn}
                  className="flex-1 h-12 rounded-xl bg-[#0F6E56] flex items-center justify-center active:scale-[0.98] transition-transform"
                >
                  <span className="text-sm font-medium text-white">Entrada manual</span>
                </button>
                <button
                  onClick={() => setShowScanner(true)}
                  className="h-12 w-12 rounded-xl bg-[#E1F5EE] flex items-center justify-center active:scale-[0.98] transition-transform"
                  title="Escanejar QR"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="3" height="3"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Dades del dia */}
        <p className="text-sm font-medium text-gray-900 mb-3">Dades del dia</p>

        {todaySession && assignment ? (
          <DayInfoCard
            date={new Date()}
            info={{
              hospital: 'Parc Taulí',
              building: todaySession.building,
              floor: todaySession.floor,
              unit: todaySession.unit,
              clinicalTutor: todaySession.clinicalTutorName,
              startTime: todaySession.startTime,
              endTime: todaySession.endTime,
            }}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-400 text-center">
              No hi ha sessió planificada per avui
            </p>
          </div>
        )}

      </div>

      <BottomNav items={studentNav} />

      {showScanner && (
        <QrScanner
          onSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

    </div>
  )
}