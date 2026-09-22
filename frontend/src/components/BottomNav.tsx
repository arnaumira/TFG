import { useNavigate, useLocation } from 'react-router-dom'
import type { NavItem } from '../config/navConfig'

interface BottomNavProps {
  items: NavItem[]
}

export default function BottomNav({ items }: BottomNavProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
      <div className="max-w-md mx-auto flex justify-around items-center py-3 pb-6">
        {items.map(item => {
          const active = pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1"
            >
              {item.icon(active)}
              <span className={`text-[10px] ${active ? 'text-[#0F6E56]' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {active && <div className="w-1 h-1 rounded-full bg-[#0F6E56]" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}