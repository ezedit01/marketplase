import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Auth.css'

export default function Auth({ mode = 'login' }) {
  const isRegister = mode === 'register'
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = isRegister
      ? await signUp({ email, password, name })
      : await signIn({ email, password })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (isRegister) {
      setConfirmSent(true)
    } else {
      navigate(next)
    }
  }

  if (confirmSent) {
    return (
      <div className="container auth-page">
        <div className="auth-card">
          <h1>Revisá tu email</h1>
          <p>Te enviamos un link de confirmación a {email}.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <h1>{isRegister ? 'Creá tu cuenta' : 'Ingresá'}</h1>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-field">
              <label>Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Un momento...' : isRegister ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? (
            <>
              ¿Ya tenés cuenta? <Link to={`/ingresar?next=${encodeURIComponent(next)}`}>Ingresá</Link>
            </>
          ) : (
            <>
              ¿No tenés cuenta?{' '}
              <Link to={`/registro?next=${encodeURIComponent(next)}`}>Registrate</Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
