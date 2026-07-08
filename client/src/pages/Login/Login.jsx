import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(formData.email, formData.password)
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/')
    } else {
      alert(result.error || 'Error al iniciar sesión')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm space-y-8">

        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-secondary-400 hover:text-secondary-700 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex justify-center mb-6">
            <img src="/logosolo.png" alt="MauLu" className="w-14 h-14 object-contain" />
          </div>
          <h2 className="text-2xl font-semibold text-secondary-800 text-center">Bienvenido de vuelta</h2>
          <p className="mt-1.5 text-sm text-secondary-400 text-center">Ingresá a tu cuenta</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="input"
              placeholder="Tu contraseña"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-sm font-semibold disabled:opacity-50 mt-2">
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-secondary-500">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
