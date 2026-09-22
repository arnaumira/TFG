import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface AuthUser {
  token: string
  fullName: string
  role: string
  userId: string
}

interface AuthContextType {
  user: AuthUser | null
  saveUser: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('tauli_user')
    return stored ? JSON.parse(stored) : null
  })

  const saveUser = (user: AuthUser) => {
    localStorage.setItem('tauli_user', JSON.stringify(user))
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('tauli_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, saveUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora de AuthProvider')
  return ctx
}