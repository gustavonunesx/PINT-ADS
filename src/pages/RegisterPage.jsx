import { useState } from 'react'
import AuthShell from '../components/AuthShell'

const ROLES = ['Desenvolvedor(a)','Designer','Gestor(a)','Analista','RH / People','Outro']

function getStrength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export default function RegisterPage({ onRegister, onNavigate }) {
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState({ name:'',email:'',company:'',role:'',password:'',confirm:'' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const strength      = getStrength(form.password)
  const strengthLabel = ['','Fraca','Razoável','Boa','Forte'][strength]
  const strengthColor = ['','#f87171','#fbbf24','var(--accent2)','var(--accent)'][strength]

  const set = (field) => (e) => {
    const val = e && e.target ? e.target.value : e
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }))
  }

  const validateStep1 = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Informe seu nome'
    if (!form.email)          e.email   = 'Informe seu e-mail'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido'
    if (!form.company.trim()) e.company = 'Informe sua empresa'
    return e
  }

  const validateStep2 = () => {
    const e = {}
    if (!form.password)                e.password = 'Crie uma senha'
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (form.password !== form.confirm) e.confirm  = 'As senhas não coincidem'
    return e
  }

  const nextStep = (ev) => {
    ev.preventDefault()
    const e = validateStep1()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStep(2)
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validateStep2()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); onRegister({ name: form.name, email: form.email }) }, 1400)
  }

  return (
    <AuthShell onNavigate={onNavigate}>
      <div className="auth-form-header">
        <div className="register-steps">
          <div className={`reg-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            {step > 1
              ? <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : '1'}
          </div>
          <div className={`reg-step-line ${step > 1 ? 'done' : ''}`} />
          <div className={`reg-step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>
        <h1 className="auth-title">{step === 1 ? 'Crie sua conta' : 'Defina sua senha'}</h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Acesso gratuito, sem cartão de crédito' : 'Escolha uma senha segura para proteger sua conta'}
        </p>
      </div>

      <form className="auth-form" onSubmit={step === 1 ? nextStep : handleSubmit} noValidate>
        {step === 1 && (
          <>
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label className="form-label">Nome completo</label>
              <div className="input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1.5 14.5c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input className="form-input" type="text" placeholder="Ana Silva"
                  value={form.name} onChange={set('name')} autoComplete="name" />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

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

            <div className={`form-group ${errors.company ? 'has-error' : ''}`}>
              <label className="form-label">Empresa</label>
              <div className="input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 4V3a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <input className="form-input" type="text" placeholder="Nome da empresa"
                  value={form.company} onChange={set('company')} />
              </div>
              {errors.company && <span className="form-error">{errors.company}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Cargo <span className="form-optional">opcional</span></label>
              <div className="role-grid">
                {ROLES.map(r => (
                  <button type="button" key={r}
                    className={`role-chip ${form.role === r ? 'selected' : ''}`}
                    onClick={() => set('role')(r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button className="auth-submit" type="submit">Continuar</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
              <label className="form-label">Senha</label>
              <div className="input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input className="form-input" type={showPw ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password} onChange={set('password')} autoComplete="new-password" />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                </button>
              </div>
              {form.password && (
                <div className="pw-strength">
                  <div className="pw-bars">
                    {[1,2,3,4].map(n => (
                      <div key={n} className="pw-bar"
                        style={{background: n <= strength ? strengthColor : 'rgba(255,255,255,0.06)'}} />
                    ))}
                  </div>
                  <span className="pw-label" style={{color: strengthColor}}>{strengthLabel}</span>
                </div>
              )}
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className={`form-group ${errors.confirm ? 'has-error' : ''}`}>
              <label className="form-label">Confirmar senha</label>
              <div className="input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input className="form-input" type="password" placeholder="Repita a senha"
                  value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
              </div>
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>

            <p className="auth-terms">
              Ao criar conta você concorda com os{' '}
              <button type="button" className="form-link">Termos de Uso</button> e{' '}
              <button type="button" className="form-link">Política de Privacidade</button>.
            </p>

            <div className="auth-step2-actions">
              <button type="button" className="btn-ghost"
                onClick={() => { setStep(1); setErrors({}) }}>Voltar</button>
              <button className={`auth-submit flex-1 ${loading ? 'loading' : ''}`}
                type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Criar conta grátis'}
              </button>
            </div>
          </>
        )}
      </form>

      <p className="auth-switch">
        Já tem conta?{' '}
        <button className="form-link" onClick={() => onNavigate('login')}>Entrar</button>
      </p>
    </AuthShell>
  )
}
