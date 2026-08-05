import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import { ArrowLeft } from 'lucide-react'

const Field = ({ label, name, type = 'text', placeholder, value, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-secondary-700 mb-1.5">{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder}
      className={`input ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleError('')
      setLoading(true)
      const result = await loginWithGoogle(tokenResponse)
      if (result.success) {
        navigate('/')
      } else {
        setGoogleError(result.error || 'Error al registrarse con Google')
      }
      setLoading(false)
    },
    onError: () => setGoogleError('Error al conectar con Google')
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const e = {}
    if (!formData.name.trim()) e.name = 'Requerido'
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email inválido'
    if (!formData.phone.trim()) e.phone = 'Requerido'
    if (formData.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'No coinciden'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const result = await register({ nombre: formData.name, email: formData.email, password: formData.password, telefono: formData.phone, direccion: null })
    if (result.success) navigate('/')
    else alert(result.error || 'Error al registrarse')
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
          <h2 className="text-2xl font-semibold text-secondary-800 text-center">Crear cuenta</h2>
          <p className="mt-1.5 text-sm text-secondary-400 text-center">Uníte y accedé a todos los beneficios</p>
        </div>

        {googleError && <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">{googleError}</p>}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleGoogleRegister()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-secondary-200 bg-white hover:bg-secondary-50 text-secondary-700 font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrarse con Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-secondary-200" /></div>
            <div className="relative flex justify-center"><span className="bg-secondary-50 px-3 text-xs text-secondary-400">o creá tu cuenta</span></div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Nombre completo" name="name" placeholder="Tu nombre" value={formData.name} onChange={handleChange} error={errors.name} />
          <Field label="Email" name="email" type="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} error={errors.email} />
          <Field label="Teléfono" name="phone" type="tel" placeholder="Tu teléfono" value={formData.phone} onChange={handleChange} error={errors.phone} />
          <Field label="Contraseña" name="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} error={errors.password} />
          <Field label="Confirmar contraseña" name="confirmPassword" type="password" placeholder="Repetí tu contraseña" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

          <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 font-semibold disabled:opacity-50 mt-2">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-secondary-500">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Iniciá sesión</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
