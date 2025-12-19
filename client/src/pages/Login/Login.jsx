import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogIn, ArrowLeft } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      // Redirigir según el rol del usuario
      if (result.user?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } else {
      alert(result.error || 'Error al iniciar sesión')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-secondary-800">Iniciar Sesión</h2>
          <p className="mt-2 text-secondary-600">Accede a tu cuenta para comprar productos para tu mascota</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="Tu contraseña"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>

          <div className="flex flex-col space-y-2 text-center">
            <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
              ¿No tienes cuenta? Regístrate aquí
            </Link>
            <a href="#" className="text-secondary-500 hover:text-secondary-700 text-sm">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-secondary-100 text-secondary-500">O</span>
            </div>
          </div>

          <div className="space-y-3">
            <button type="button" className="w-full btn btn-secondary py-3 text-lg font-medium">
              Continuar con Google
            </button>
            <button type="button" className="w-full btn btn-secondary py-3 text-lg font-medium">
              Continuar con Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login