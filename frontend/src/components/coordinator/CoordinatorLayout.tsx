import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'
import CoordinatorAnnouncementBell from './CoordinatorAnnouncementBell'

interface NavItem {
  label: string
  path: string
  icon: ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Inici',
    path: '/coordinator/home',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
  },
  {
    label: 'Calendari',
    path: '/coordinator/calendar',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
  },
  {
    label: 'Usuaris',
    path: '/coordinator/users',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    label: 'Assignacions',
    path: '/coordinator/assignments',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  },
  {
    label: 'Rúbriques',
    path: '/coordinator/rubrics',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  },
]

interface CoordinatorLayoutProps {
  children: ReactNode
  title: string
  action?: ReactNode
}

export default function CoordinatorLayout({ children, title, action }: CoordinatorLayoutProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#f0f4f8] overflow-hidden">

      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-gray-50">
          <p className="text-sm font-medium text-[#0F6E56]">Taulí Pràctiques</p>
          <p className="text-xs text-gray-400 mt-0.5">Panell de coordinació</p>
        </div>

        <nav className="flex-1 py-4">
          <p className="px-4 text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">
            General
          </p>
          {NAV_ITEMS.slice(0, 2).map(item => (
            <NavButton
              key={item.path}
              item={item}
              active={pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}

          <p className="px-4 text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-4 mb-1">
            Gestió
          </p>
          {NAV_ITEMS.slice(2).map(item => (
            <NavButton
              key={item.path}
              item={item}
              active={pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-[#0F6E56]">
                {user?.fullName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-gray-400">Coordinador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Tancar sessió
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <div className="flex items-center gap-3">
              {action}
              <CoordinatorAnnouncementBell />
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

function NavButton({ item, active, onClick }: {
  item: NavItem
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
        active
          ? 'bg-[#E1F5EE] text-[#0F6E56] font-medium border-r-2 border-[#0F6E56]'
          : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      <span className={active ? 'text-[#0F6E56]' : 'text-gray-400'}>
        {item.icon}
      </span>
      {item.label}
    </button>
  )
}