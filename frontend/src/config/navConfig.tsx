import type { ReactNode } from 'react'

export interface NavItem {
  label: string
  path: string
  icon: (active: boolean) => ReactNode
}

const HomeIcon = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24"
    fill={active ? '#0F6E56' : 'none'}
    stroke={active ? 'none' : '#bbb'}
    strokeWidth="1.5" strokeLinecap="round">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
)

const CalendarIcon = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#0F6E56' : '#bbb'}
    strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)

const EvaluationIcon = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#0F6E56' : '#bbb'}
    strokeWidth="1.5" strokeLinecap="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)

const ProfileIcon = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#0F6E56' : '#bbb'}
    strokeWidth="1.5" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const StudentsIcon = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#0F6E56' : '#bbb'}
    strokeWidth="1.5" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const AssignmentsIcon = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#0F6E56' : '#bbb'}
    strokeWidth="1.5" strokeLinecap="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)

const RubricsIcon = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#0F6E56' : '#bbb'}
    strokeWidth="1.5" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

export const studentNav: NavItem[] = [
  { label: 'Inici',     path: '/home',              icon: HomeIcon },
  { label: 'Calendari', path: '/calendar',           icon: CalendarIcon },
  { label: 'Avaluació', path: '/evaluation',         icon: EvaluationIcon },
  { label: 'Perfil',    path: '/profile',            icon: ProfileIcon },
]

export const clinicalTutorNav: NavItem[] = [
  { label: 'Inici',     path: '/tutor/home',         icon: HomeIcon },
  { label: 'Calendari', path: '/tutor/calendar',     icon: CalendarIcon },
  { label: 'Avaluació', path: '/tutor/evaluation',   icon: EvaluationIcon },
  { label: 'Perfil',    path: '/tutor/profile',      icon: ProfileIcon },
]

export const academicTutorNav: NavItem[] = [
  { label: 'Inici',     path: '/academic/home',      icon: HomeIcon },
  { label: 'Calendari', path: '/academic/calendar',  icon: CalendarIcon },
  { label: 'Avaluació', path: '/academic/evaluation',icon: EvaluationIcon },
  { label: 'Perfil',    path: '/academic/profile',   icon: ProfileIcon },
]

export const coordinatorNav: NavItem[] = [
  { label: 'Inici',        path: '/coordinator/home',        icon: HomeIcon },
  { label: 'Calendari',    path: '/coordinator/calendar',    icon: CalendarIcon },
  { label: 'Estudiants',   path: '/coordinator/students',    icon: StudentsIcon },
  { label: 'Assignacions', path: '/coordinator/assignments', icon: AssignmentsIcon },
  { label: 'Rúbriques',    path: '/coordinator/rubrics',     icon: RubricsIcon },
]