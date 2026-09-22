import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../../components/BottomNav'
import AttendanceBadge from '../../components/AttendanceBadge'
import { academicTutorNav } from '../../config/navConfig'
import {
  getAcademicTutorProfile,
  getAcademicTutorTodayAttendance
} from '../../api/academicTutor'
import {
  getChangeRequestsByAcademicTutor,
  approveChangeRequest,
  rejectChangeRequest
} from '../../api/sessionChangeRequests'
import type { AcademicTutorProfile } from '../../api/academicTutor'
import type { TodayAttendance } from '../../api/clinicalTutor'
import type { SessionChangeRequestDetail } from '../../api/sessionChangeRequests'
import AnnouncementBell from '../../components/AnnouncementBell'


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

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending:  { label: 'Pendent',  bg: 'bg-amber-50',  text: 'text-amber-700'  },
    approved: { label: 'Aprovada', bg: 'bg-[#E1F5EE]', text: 'text-[#085041]' },
    rejected: { label: 'Denegada', bg: 'bg-red-50',    text: 'text-red-700'   },
  }[status] ?? { label: status, bg: 'bg-gray-50', text: 'text-gray-500' }

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

export default function AcademicTutorHomePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AcademicTutorProfile | null>(null)
  const [attendance, setAttendance] = useState<TodayAttendance[]>([])
  const [requests, setRequests] = useState<SessionChangeRequestDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'attendance' | 'requests'>('attendance')

  const loadData = () => {
    Promise.all([
      getAcademicTutorProfile(),
      getAcademicTutorTodayAttendance(),
      getChangeRequestsByAcademicTutor(),
    ]).then(([prof, att, reqs]) => {
      setProfile(prof)
      setAttendance(att)
      setRequests(reqs)
    }).catch(() => {
      logout()
      navigate('/login')
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleApprove = async (requestId: string) => {
    await approveChangeRequest(requestId)
    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: 'approved' as const } : r
    ))
  }

  const handleReject = async (requestId: string) => {
    await rejectChangeRequest(requestId)
    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    ))
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length
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
            <p className="text-sm text-gray-400 mt-0.5 capitalize">{formatDate()}</p>
          </div>
          <AnnouncementBell />
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl border border-gray-100 p-1 gap-1 mb-4">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'attendance' ? 'bg-[#0F6E56] text-white' : 'text-gray-400'
            }`}
          >
            Assistència avui
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors relative ${
              activeTab === 'requests' ? 'bg-[#0F6E56] text-white' : 'text-gray-400'
            }`}
          >
            Sol·licituds
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-400 text-center">Carregant...</p>
          </div>
        ) : activeTab === 'attendance' ? (

          /* Tab assistència */
          attendance.length === 0 ? (
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
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {a.studentName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTime(a.startTime)} – {formatTime(a.endTime)}
                    </p>
                  </div>
                  <AttendanceBadge status={a.attendanceStatus} />
                </div>
              ))}
            </div>
          )

        ) : (

          /* Tab sol·licituds */
          requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Sense sol·licituds
              </p>
              <p className="text-xs text-gray-400">
                No hi ha sol·licituds de canvi pendents
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-[#0F6E56]">
                          {r.studentName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.studentName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString('ca-ES', {
                            day: 'numeric', month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Original</span>
                      <span className="text-xs font-medium text-gray-900">
                        {new Date(r.originalDate).toLocaleDateString('ca-ES', {
                          weekday: 'short', day: 'numeric', month: 'short'
                        })}
                        {' · '}
                        {r.originalStart.substring(0, 5)} – {r.originalEnd.substring(0, 5)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Proposat</span>
                      <span className="text-xs font-medium text-[#0F6E56]">
                        {new Date(r.proposedDate).toLocaleDateString('ca-ES', {
                          weekday: 'short', day: 'numeric', month: 'short'
                        })}
                        {' · '}
                        {r.proposedStart.substring(0, 5)} – {r.proposedEnd.substring(0, 5)}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        <span className="text-gray-400">Motiu: </span>
                        {r.reason}
                      </p>
                    </div>
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(r.id)}
                        className="flex-1 h-10 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        Denegar
                      </button>
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="flex-1 h-10 rounded-xl bg-[#0F6E56] text-white text-sm font-medium"
                      >
                        Aprovar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

      </div>
      <BottomNav items={academicTutorNav} />
    </div>
  )
}