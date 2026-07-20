import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al cambiar contraseña'); setLoading(false); return }
      setDone(true)
    } catch {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <p className="text-red-500 font-medium">Link inválido</p>
          <button onClick={() => navigate('/login')} className="mt-4 text-sm text-primary-600 hover:underline">Ir al login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <button onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-sm text-secondary-400 hover:text-secondary-700 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Volver al login
          </button>
          <div className="flex justify-center mb-6">
            <img src="/logosolo.png" alt="MauLu" className="w-14 h-14 object-contain" />
          </div>
          <h2 className="text-2xl font-semibold text-secondary-800 text-center">Nueva contraseña</h2>
          <p className="mt-1.5 text-sm text-secondary-400 text-center">Elegí una contraseña segura</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <p className="text-secondary-700 font-medium">¡Contraseña actualizada!</p>
            <button onClick={() => navigate('/login')} className="w-full btn btn-primary py-3 font-semibold">
              Ir al login
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Nueva contraseña</label>
              <input type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                className="input" placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Confirmar contraseña</label>
              <input type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="input" placeholder="Repetí tu contraseña" />
            </div>
            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 font-semibold disabled:opacity-50">
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
