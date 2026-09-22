import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { saveUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    const data = await login({ email, password })
    saveUser(data)

    const destination: Record<string, string> = {
      student:         '/home',
      clinical_tutor:  '/tutor/home',
      academic_tutor:  '/academic/home',
      coordinator:     '/coordinator/home',
    }
    navigate(destination[data.role] ?? '/login')

  } catch {
    setError('Credencials incorrectes. Torna-ho a intentar.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="bg-white rounded-2xl p-4 shadow-sm mx-auto mb-4 w-fit">
          <img
            src="/logo-tauli.jpg"
            alt="Hospital Universitari Parc Taulí"
            className="h-14 w-auto"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-1">Benvingut</h2>
          <p className="text-sm text-gray-400 mb-6">Inicia sessió per continuar</p>

          {error && (
            <div className="bg-red-50 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Correu electrònic
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nom@tauli.cat"
                required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Contrasenya
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] bg-gray-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0F6E56] text-white text-sm font-medium rounded-xl mt-2 disabled:opacity-60 active:scale-[0.98] transition-transform"
            >
              {loading ? 'Entrant...' : 'Iniciar sessió'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-400 mt-5">
            No tens compte?{' '}
            <Link to="/register" className="text-[#0F6E56] font-medium">
              Registra't
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}