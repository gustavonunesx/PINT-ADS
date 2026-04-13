import { useState } from 'react'
import AuthShell from '../components/AuthShell'

export default function LoginPage({ onLogin, onNavigate }) {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Informe seu e-mail'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido'
    if (!form.password) e.password = 'Informe sua senha'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors({ password: data.message || 'E-mail ou senha inválidos' })
        return
      }
      localStorage.setItem('token', data.token)
      onLogin({ name: data.name, email: data.email, type: data.role === 'INSTITUTION' ? 'institution' : 'student' })
    } catch {
      setErrors({ password: 'Erro ao conectar com o servidor' })
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }))
  }

  return (
    <AuthShell onNavigate={onNavigate}>
      <div className="auth-form-header">
        <h1 className="auth-title">Bem-vindo de volta</h1>
        <p className="auth-subtitle">Entre na sua conta para continuar aprendendo</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
          <label className="form-label">E-mail corporativo</label>
          <div className="input-wrap">
            <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1 5.5L8 9.5L15 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input className="form-input" type="email" placeholder="voce@empresa.com"
              value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
          <div className="form-label-row">
            <label className="form-label">Senha</label>
            <button type="button" className="form-link">Esqueci a senha</button>
          </div>
          <div className="input-wrap">
            <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M5 7V5a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
              value={form.password} onChange={set('password')} autoComplete="current-password" />
            <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                {!showPw && <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>}
              </svg>
            </button>
          </div>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <button className={`auth-submit ${loading ? 'loading' : ''}`} type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Entrar na conta'}
        </button>

        <div className="auth-divider"><span>ou continue com</span></div>

        <div className="auth-sso">
          <button type="button" className="sso-btn">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M16.51 7.77H9v2.61h4.26c-.18 1-.74 1.84-1.57 2.4v2h2.54c1.49-1.37 2.34-3.38 2.34-5.76 0-.48-.04-.95-.06-1.25z" fill="#4285F4"/>
              <path d="M9 17c2.14 0 3.94-.71 5.25-1.93l-2.54-2c-.71.47-1.62.75-2.71.75-2.09 0-3.86-1.41-4.49-3.31H1.89v2.07A8 8 0 0 0 9 17z" fill="#34A853"/>
              <path d="M4.51 10.51A4.84 4.84 0 0 1 4.26 9c0-.52.09-1.03.25-1.51V5.42H1.89A8 8 0 0 0 1 9c0 1.29.31 2.51.89 3.58l2.62-2.07z" fill="#FBBC05"/>
              <path d="M9 3.94c1.18 0 2.23.41 3.06 1.2l2.3-2.3A8 8 0 0 0 1.89 5.42l2.62 2.07C5.14 5.35 6.91 3.94 9 3.94z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" className="sso-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect width="18" height="18" rx="3" fill="#00A4EF"/>
              <path d="M2 2h6.5v6.5H2V2zm0 7.5h6.5V16H2V9.5zm7.5-7.5H16v6.5H9.5V2zm0 7.5H16V16H9.5V9.5z" fill="white"/>
            </svg>
            Microsoft
          </button>
        </div>
      </form>

      <p className="auth-switch">
        Não tem conta?{' '}
        <button className="form-link" onClick={() => onNavigate('register')}>Criar conta grátis</button>
      </p>
    </AuthShell>
  )
}
