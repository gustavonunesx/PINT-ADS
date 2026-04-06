import { useState } from 'react'
import AuthShell from '../components/AuthShell'

const ROLES = ['Desenvolvedor(a)', 'Designer', 'Gestor(a)', 'Analista', 'RH / People', 'Outro']

function getStrength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

function AccountTypeStep({ onSelect }) {
  return (
    <div className="account-type-step">
      <div className="auth-form-header">
        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">Escolha como você vai usar a plataforma</p>
      </div>
      <div className="account-type-grid">
        <button className="account-type-card" onClick={() => onSelect('student')}>
          <div className="acc-type-icon acc-type-icon--student">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 4L2 10l12 6 12-6-12-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M2 10v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M7 12.5v5.5a7 7 0 0 0 14 0v-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="acc-type-label">Aluno</div>
          <div className="acc-type-desc">Acesse cursos, acompanhe seu progresso e conquiste certificados</div>
          <div className="acc-type-features">
            <span>📚 Meus cursos</span>
            <span>📊 Relatório semanal</span>
            <span>🔥 Sequência de estudos</span>
          </div>
          <div className="acc-type-cta">Entrar como Aluno →</div>
        </button>

        <button className="account-type-card" onClick={() => onSelect('institution')}>
          <div className="acc-type-icon acc-type-icon--institution">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="10" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M9 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="14" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M14 19.5V22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="acc-type-label">Instituição</div>
          <div className="acc-type-desc">Crie cursos, gerencie aulas e acompanhe o desempenho dos alunos</div>
          <div className="acc-type-features">
            <span>🏛️ Painel de cursos</span>
            <span>🎬 Criação de aulas</span>
            <span>📈 Métricas de engajamento</span>
          </div>
          <div className="acc-type-cta">Entrar como Instituição →</div>
        </button>
      </div>
    </div>
  )
}

export default function RegisterPage({ onRegister, onNavigate }) {
  const [accountType, setAccountType] = useState(null) // null | 'student' | 'institution'
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState({ name:'', email:'', company:'', role:'', password:'', confirm:'' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const strength      = getStrength(form.password)
  const strengthLabel = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'][strength]
  const strengthColor = ['', '#f87171', '#fbbf24', 'var(--accent2)', 'var(--accent)'][strength]

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
    if (accountType === 'institution' && !form.company.trim()) e.company = 'Informe o nome da instituição'
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
    setTimeout(() => {
      setLoading(false)
      onRegister({ name: form.name, email: form.email, type: accountType, company: form.company })
    }, 1400)
  }

  const handleBack = () => {
    if (step === 2) { setStep(1); setErrors({}); return }
    setAccountType(null); setStep(1); setErrors({})
  }

  // ── Step 0: choose account type ──
  if (!accountType) {
    return (
      <AuthShell onNavigate={onNavigate}>
        <AccountTypeStep onSelect={setAccountType} />
        <p className="auth-switch">
          Já tem conta?{' '}
          <button className="form-link" onClick={() => onNavigate('login')}>Entrar</button>
        </p>
      </AuthShell>
    )
  }

  const isInstitution = accountType === 'institution'
  const totalSteps = 2

  return (
    <AuthShell onNavigate={onNavigate}>
      <div className="auth-form-header">
        <div className="register-steps">
          <button className="reg-back-type" onClick={handleBack}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {step === 1 ? 'Tipo de conta' : 'Voltar'}
          </button>
          <div className="reg-steps-track">
            {[1, 2].map(n => (
              <div key={n} className={`reg-step ${step >= n ? 'active' : ''} ${step > n ? 'done' : ''}`}>
                {step > n
                  ? <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : n}
              </div>
            ))}
            <div className={`reg-step-line ${step > 1 ? 'done' : ''}`} />
          </div>
        </div>

        <div className="acc-type-badge-row">
          <span className={`acc-type-badge ${isInstitution ? 'institution' : 'student'}`}>
            {isInstitution ? '🏛️ Instituição' : '📚 Aluno'}
          </span>
        </div>

        <h1 className="auth-title">{step === 1 ? (isInstitution ? 'Dados da instituição' : 'Seus dados') : 'Defina sua senha'}</h1>
        <p className="auth-subtitle">
          {step === 1
            ? isInstitution ? 'Informe os dados da sua organização' : 'Acesso gratuito, sem cartão de crédito'
            : 'Escolha uma senha segura para proteger sua conta'}
        </p>
      </div>

      <form className="auth-form" onSubmit={step === 1 ? nextStep : handleSubmit} noValidate>
        {step === 1 && (
          <>
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label className="form-label">{isInstitution ? 'Nome do responsável' : 'Nome completo'}</label>
              <div className="input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1.5 14.5c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input className="form-input" type="text" placeholder={isInstitution ? 'Maria Oliveira' : 'Ana Silva'}
                  value={form.name} onChange={set('name')} autoComplete="name" />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label className="form-label">E-mail {isInstitution ? 'institucional' : 'corporativo'}</label>
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

            {isInstitution && (
              <div className={`form-group ${errors.company ? 'has-error' : ''}`}>
                <label className="form-label">Nome da instituição</label>
                <div className="input-wrap">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5 4V3a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  <input className="form-input" type="text" placeholder="Ex: Universidade Nova"
                    value={form.company} onChange={set('company')} />
                </div>
                {errors.company && <span className="form-error">{errors.company}</span>}
              </div>
            )}

            {!isInstitution && (
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
            )}

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
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="pw-bar"
                        style={{ background: n <= strength ? strengthColor : 'rgba(255,255,255,0.06)' }} />
                    ))}
                  </div>
                  <span className="pw-label" style={{ color: strengthColor }}>{strengthLabel}</span>
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
              <button type="button" className="btn-ghost" onClick={handleBack}>Voltar</button>
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
