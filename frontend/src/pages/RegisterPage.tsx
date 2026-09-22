import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerStudent } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const COURSES = [1, 2, 3, 4]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { saveUser } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Pas 1
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Pas 2
  const [university, setUniversity] = useState('Universitat Autònoma de Barcelona')
  const [niu, setNiu] = useState('')
  const [enrollmentYear, setEnrollmentYear] = useState<number | ''>('')
  const [currentCourse, setCurrentCourse] = useState<number>(1)
  const [degree, setDegree] = useState('Grau en Infermeria')

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('La contrasenya ha de tenir mínim 8 caràcters.')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await registerStudent({
        fullName,
        email,
        password,
        university,
        niu,
        enrollmentYear,
        currentCourse,
        degree,
        role: 'student',
      })
      saveUser(data)
      navigate('/home')
    } catch {
      setError('Error en crear el compte. Comprova les dades.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0F6E56] flex items-center justify-center mb-3">
            <div className="w-7 h-7 border-[3px] border-white rounded-lg" />
          </div>
          <h1 className="text-lg font-medium text-[#0F6E56]">Taulí Pràctiques</h1>
          <p className="text-sm text-gray-400 mt-1">
            {step === 1 ? 'Crea el teu compte' : 'Dades acadèmiques'}
          </p>
        </div>

        {/* Barra de progrés */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-1 rounded-full bg-[#0F6E56]" />
          <div className={`flex-1 h-1 rounded-full transition-colors ${
            step === 2 ? 'bg-[#0F6E56]' : 'bg-gray-200'
          }`} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">

          {error && (
            <div className="bg-red-50 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Nom complet</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Arnau Mira Clot"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Correu electrònic</label>
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
                <label className="block text-xs text-gray-500 mb-1.5">Contrasenya</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínim 8 caràcters"
                  required
                  minLength={8}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] bg-gray-50"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-[#0F6E56] text-white text-sm font-medium rounded-xl mt-2 active:scale-[0.98] transition-transform"
              >
                Continuar →
              </button>
            </form>

          ) : (

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Universitat</label>
                <input
                  type="text"
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">NIU</label>
                <input
                  type="text"
                  value={niu}
                  onChange={e => setNiu(e.target.value)}
                  placeholder="1234567"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Any de matrícula</label>
                <input
                  type="number"
                  value={enrollmentYear}
                  onChange={e => setEnrollmentYear(e.target.value ? Number(e.target.value) : '')}
                  placeholder="2022"
                  min={2000}
                  max={new Date().getFullYear()}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Curs actual</label>
                <div className="grid grid-cols-4 gap-2">
                  {COURSES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrentCourse(c)}
                      className={`h-11 rounded-xl border text-sm font-medium transition-colors ${
                        currentCourse === c
                          ? 'border-[#0F6E56] bg-[#E1F5EE] text-[#085041]'
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {c}r
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Grau</label>
                <input
                  type="text"
                  value={degree}
                  onChange={e => setDegree(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0F6E56] focus:ring-1 focus:ring-[#0F6E56] bg-gray-50"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 h-11 border border-gray-200 text-gray-600 text-sm rounded-xl active:scale-[0.98] transition-transform"
                >
                  ← Enrere
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 bg-[#0F6E56] text-white text-sm font-medium rounded-xl disabled:opacity-60 active:scale-[0.98] transition-transform"
                >
                  {loading ? 'Creant...' : 'Crear compte'}
                </button>
              </div>
            </form>
          )}

          <p className="text-sm text-center text-gray-400 mt-5">
            Ja tens compte?{' '}
            <Link to="/login" className="text-[#0F6E56] font-medium">
              Inicia sessió
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}