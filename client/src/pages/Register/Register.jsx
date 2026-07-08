import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

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

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-secondary-700 mb-1.5">{label}</label>
      <input
        type={type} name={name} value={formData[name]} onChange={handleChange}
        placeholder={placeholder}
        className={`input ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  )

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
          <p className="mt-1.5 text-sm text-secondary-400 text-center">Únete y accedé a todos los beneficios</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Nombre completo" name="name" placeholder="Tu nombre" />
          <Field label="Email" name="email" type="email" placeholder="tu@email.com" />
          <Field label="Teléfono" name="phone" type="tel" placeholder="Tu teléfono" />
          <Field label="Contraseña" name="password" type="password" placeholder="Mínimo 6 caracteres" />
          <Field label="Confirmar contraseña" name="confirmPassword" type="password" placeholder="Repetí tu contraseña" />

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
