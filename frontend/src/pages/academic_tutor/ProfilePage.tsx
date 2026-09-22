import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../../components/BottomNav'
import ProfileHeader from '../../components/ProfileHeader'
import InfoCard from '../../components/ProfileInfoCard'
import LogoutButton from '../../components/LogoutButton'
import { academicTutorNav } from '../../config/navConfig'
import { getAcademicTutorProfile, getAcademicTutorStudents } from '../../api/academicTutor'
import type { AcademicTutorProfile } from '../../api/academicTutor'
import type { StudentSummary } from '../../api/clinicalTutor'

export default function AcademicTutorProfilePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AcademicTutorProfile | null>(null)
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAcademicTutorProfile(),
      getAcademicTutorStudents(),
    ]).then(([prof, stud]) => {
      setProfile(prof)
      setStudents(stud)
    }).catch(() => {
      logout()
      navigate('/login')
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <p className="text-sm text-gray-400">Carregant...</p>
      </div>
    )
  }

  const tags = [
    'Tutor acadèmic',
    ...(profile?.faculty ? [profile.faculty] : []),
    ...(profile?.department ? [profile.department] : []),
  ]

  const professionalRows = [
    {
      label: 'Email',
      value: profile?.email ?? '',
      icon: <EmailIcon />,
    },
    ...(profile?.officeLocation ? [{
      label: 'Despatx',
      value: profile.officeLocation,
      icon: <OfficeIcon />,
    }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="max-w-md mx-auto px-5 pt-12 pb-28">

        <ProfileHeader fullName={profile?.fullName ?? ''} tags={tags} />

        <InfoCard title="Dades professionals" rows={professionalRows} />

        {/* Estudiants assignats */}
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-4">
          <div className="px-5 py-3 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-900">Estudiants assignats</p>
            <span className="text-xs text-gray-400">{students.length}</span>
          </div>
          {students.length === 0 ? (
            <div className="px-5 py-5">
              <p className="text-sm text-gray-400 text-center">No hi ha estudiants assignats</p>
            </div>
          ) : (
            students.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-[#0F6E56]">{s.fullName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.fullName}</p>
                  <p className="text-xs text-gray-400">
                    {s.currentCourse ? `${s.currentCourse}r curs` : 'Curs desconegut'}
                    {s.unit ? ` · ${s.unit}` : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <LogoutButton />

      </div>
      <BottomNav items={academicTutorNav} />
    </div>
  )
}

function EmailIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}

function OfficeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}