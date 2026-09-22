import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../../components/BottomNav'
import ProfileHeader from '../../components/ProfileHeader'
import ProfileInfoCard from '../../components/ProfileInfoCard'
import LogoutButton from '../../components/LogoutButton'
import { studentNav } from '../../config/navConfig'
import { getMyProfile } from '../../api/students'
import { getCurrentAssignment } from '../../api/assignments'
import type { StudentProfile } from '../../api/students'
import type { AssignmentDetail } from '../../api/assignments'

export default function StudentProfilePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getCurrentAssignment().catch(() => null),
    ]).then(([prof, assign]) => {
      setProfile(prof)
      setAssignment(assign)
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
    'Estudiant',
    ...(profile?.currentCourse ? [`${profile.currentCourse}r curs`] : []),
    ...(profile?.degree ? [profile.degree] : []),
  ]

  const personalRows = [
    {
      label: 'Email',
      value: profile?.email ?? '',
      icon: <EmailIcon />,
    },
    ...(profile?.niu ? [{
      label: 'NIU',
      value: profile.niu,
      icon: <BadgeIcon />,
    }] : []),
    ...(profile?.university ? [{
      label: 'Universitat',
      value: profile.university,
      icon: <UniversityIcon />,
    }] : []),
    ...(profile?.enrollmentYear ? [{
      label: 'Any de matrícula',
      value: String(profile.enrollmentYear),
      icon: <CalendarIcon />,
    }] : []),
  ]

  const assignmentRows = assignment ? [
    {
      label: 'Hospital',
      value: 'Parc Taulí',
      icon: <HospitalIcon />,
    },
    {
      label: 'Àrea / Unitat',
      value: `${assignment.area} · ${assignment.unit}`,
      icon: <UnitIcon />,
    },
    {
      label: 'Edifici / Planta',
      value: `${assignment.building} · ${assignment.floor}`,
      icon: <BuildingIcon />,
    },
    {
      label: 'Tutor clínic',
      value: assignment.clinicalTutorName,
      icon: <PersonIcon />,
    },
    {
      label: 'Tutor acadèmic',
      value: assignment.academicTutorName,
      icon: <PersonIcon />,
    },
    {
      label: 'Període',
      value: `${formatDate(assignment.startDate)} – ${formatDate(assignment.endDate)}`,
      icon: <CalendarIcon />,
    },
  ] : []

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="max-w-md mx-auto px-5 pt-12 pb-28">

        <ProfileHeader fullName={profile?.fullName ?? ''} tags={tags} />

        <ProfileInfoCard title="Dades personals" rows={personalRows} />

        {assignment ? (
          <ProfileInfoCard title="Assignació activa" rows={assignmentRows} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <p className="text-sm text-gray-400 text-center">
              No hi ha cap assignació activa
            </p>
          </div>
        )}

        <LogoutButton />

      </div>
      <BottomNav items={studentNav} />
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ca-ES', {
    month: 'short', year: 'numeric'
  })
}

function EmailIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}
function BadgeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/></svg>
}
function UniversityIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
}
function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
}
function HospitalIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function UnitIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
}
function BuildingIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
}
function PersonIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}