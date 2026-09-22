import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LogoutButton() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="#888" strokeWidth="2" strokeLinecap="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      <span className="text-sm text-gray-500">Tancar sessió</span>
    </button>
  )
}