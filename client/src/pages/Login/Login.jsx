import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft } from 'lucide-react'

const Login = () => {
  const [step, setStep] = useState('login') // 'login' | '2fa' | 'forgot'
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [code, setCode] = useState('')
  const [userId2fa, setUserId2fa] = useState(null)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithToken } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(formData.email, formData.password)
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/')
    } else if (result.requires2FA) {
      setUserId2fa(result.userId)
      setStep('2fa')
    } else {
      setError(result.error || 'Error al iniciar sesión')
    }
    setLoading(false)
  }

  const handle2FA = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId2fa, code })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Código inválido'); setLoading(false); return }
      loginWithToken(data.token, data.user)
      navigate(data.user?.role === 'admin' ? '/admin' : '/')
    } catch {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      })
      setForgotSent(true)
    } catch {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm space-y-8">

        <div>
          <button onClick={() => step !== 'login' ? setStep('login') : navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm text-secondary-400 hover:text-secondary-700 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            {step !== 'login' ? 'Volver al login' : 'Volver al inicio'}
          </button>
          <div className="flex justify-center mb-6">
            <img src="/logosolo.png" alt="MauLu" className="w-14 h-14 object-contain" />
          </div>

          {step === 'login' && <>
            <h2 className="text-2xl font-semibold text-secondary-800 text-center">Bienvenido de vuelta</h2>
            <p className="mt-1.5 text-sm text-secondary-400 text-center">Ingresá a tu cuenta</p>
          </>}
          {step === '2fa' && <>
            <h2 className="text-2xl font-semibold text-secondary-800 text-center">Verificación</h2>
            <p className="mt-1.5 text-sm text-secondary-400 text-center">Ingresá el código que enviamos a tu email</p>
          </>}
          {step === 'forgot' && <>
            <h2 className="text-2xl font-semibold text-secondary-800 text-center">Recuperar contraseña</h2>
            <p className="mt-1.5 text-sm text-secondary-400 text-center">Te enviamos un link para crear una nueva contraseña</p>
          </>}
        </div>

        {error && <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

        {/* STEP: LOGIN */}
        {step === 'login' && (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Email</label>
              <input type="email" required value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="input" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Contraseña</label>
              <input type="password" required value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="input" placeholder="Tu contraseña" />
            </div>
            <div className="text-right">
              <button type="button" onClick={() => { setStep('forgot'); setError('') }}
                className="text-sm text-primary-600 hover:text-primary-700">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-sm font-semibold disabled:opacity-50">
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
            <p className="text-center text-sm text-secondary-500">
              ¿No tenés cuenta?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Registrate</Link>
            </p>
          </form>
        )}

        {/* STEP: 2FA */}
        {step === '2fa' && (
          <form className="space-y-4" onSubmit={handle2FA}>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Código de 6 dígitos</label>
              <input
                type="text" inputMode="numeric" maxLength={6} required
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                className="input text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                autoFocus
              />
            </div>
            <button type="submit" disabled={loading || code.length !== 6}
              className="w-full btn btn-primary py-3 text-sm font-semibold disabled:opacity-50">
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </form>
        )}

        {/* STEP: FORGOT */}
        {step === 'forgot' && !forgotSent && (
          <form className="space-y-4" onSubmit={handleForgot}>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Tu email</label>
              <input type="email" required value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                className="input" placeholder="tu@email.com" />
            </div>
            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-sm font-semibold disabled:opacity-50">
              {loading ? 'Enviando...' : 'Enviar link de recuperación'}
            </button>
          </form>
        )}

        {step === 'forgot' && forgotSent && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✉️</span>
            </div>
            <p className="text-secondary-700 font-medium">¡Listo! Revisá tu email</p>
            <p className="text-sm text-secondary-400">Si el email existe en nuestra base, recibirás un link para cambiar tu contraseña.</p>
            <button onClick={() => setStep('login')} className="text-sm text-primary-600 hover:underline">
              Volver al login
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Login
