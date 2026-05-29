import { useState, useEffect, useRef, useCallback } from 'react'
import { user as userApi, courses as coursesApi, leaderboard as leaderboardApi } from '../api/client'

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_USER = { name: 'Ana Silva', xp: 3840, level: 12, streak: 7 }

const PALETTE = [
  { color: '#3be8b0', glow: 'rgba(59,232,176,0.15)',  badge: '🎓' },
  { color: '#63c8ff', glow: 'rgba(99,200,255,0.15)',  badge: '📚' },
  { color: '#a78bfa', glow: 'rgba(167,139,250,0.15)', badge: '💻' },
  { color: '#fbbf24', glow: 'rgba(251,191,36,0.15)',  badge: '⭐' },
  { color: '#f87171', glow: 'rgba(248,113,113,0.15)', badge: '🌱' },
  { color: '#34d399', glow: 'rgba(52,211,153,0.15)',  badge: '🔥' },
]

function toPalette(id) {
  const n = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTE[n % PALETTE.length]
}

function normalizeCourse(c) {
  const p            = toPalette(c.id)
  const lessons      = Array.isArray(c.lessons) ? c.lessons : []
  const lessonsTotal = c.lessonsTotal ?? c.totalLessons ?? c.lessonsCount ?? lessons.length ?? 0
  const lessonsDone  = c.lessonsDone ?? c.completedLessons ??
                       lessons.filter(l => l.status === 'done' || l.completed).length
  const rawProgress  = c.progress ?? c.progressPercent ?? c.completionRate ?? null
  const progress     = rawProgress != null
    ? Number(rawProgress)
    : (lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0)
  return {
    ...c,
    color:        c.color || p.color,
    glow:         c.glow  || p.glow,
    badge:        c.badge || p.badge,
    progress,
    lessonsTotal,
    lessonsDone,
    lastAccess:   c.lastAccess ?? 'recentemente',
    nextLesson:   c.nextLesson ?? null,
  }
}

const WEEKLY_DAYS = [
  { day: 'Seg', xpEarned: 0, done: false },
  { day: 'Ter', xpEarned: 0, done: false },
  { day: 'Qua', xpEarned: 0, done: false },
  { day: 'Qui', xpEarned: 0, done: false },
  { day: 'Sex', xpEarned: 0, done: false },
  { day: 'Sáb', xpEarned: 0, done: false },
  { day: 'Dom', xpEarned: 0, done: false },
]

const RECENT_ACTIVITY = [
  { time: 'há 2h',  text: 'Completou "Criptografia Avançada"',    xp: '+120 XP', color: '#3be8b0', course: 'Segurança da Informação' },
  { time: 'ontem',  text: 'Quiz perfeito em "LGPD na Prática"',   xp: '+200 XP', color: '#63c8ff', course: 'Compliance & LGPD' },
  { time: '3 dias', text: 'Completou trilha "Boas Práticas Dev"',  xp: '+500 XP', color: '#a78bfa', course: 'Boas Práticas Dev' },
  { time: '5 dias', text: 'Iniciou "Soft Skills & Liderança"',     xp: '+50 XP',  color: '#f87171', course: 'Soft Skills' },
]

const ACHIEVEMENTS = [
  { icon: '🔥', label: '7 dias seguidos',   unlocked: true  },
  { icon: '🎯', label: '100% em Segurança', unlocked: true  },
  { icon: '⚡', label: 'Velocista',          unlocked: true  },
  { icon: '🧠', label: 'Mestre LGPD',        unlocked: false },
  { icon: '🏆', label: 'Top 3 ranking',      unlocked: false },
  { icon: '🌟', label: 'Trilha completa',    unlocked: false },
]

// ── Activity helpers ───────────────────────────────────────────────────────

const ACT_COLORS = ['#3be8b0','#63c8ff','#a78bfa','#fbbf24','#f87171','#34d399']

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d    = new Date(dateStr)
  const diff = Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  if (diff <  7)  return `há ${diff} dias`
  return d.toLocaleDateString('pt-BR')
}

function normalizeActivity(items) {
  return items.map((item, i) => ({
    time:   formatDate(item.date),
    text:   item.description ?? 'Atividade concluída',
    xp:     `+${item.xpEarned ?? 0} XP`,
    color:  ACT_COLORS[i % ACT_COLORS.length],
    course: '',
  }))
}

// ── XP Ring ────────────────────────────────────────────────────────────────
function XPRing({ pct, color, size = 120 }) {
  const r    = (size / 2) - 9
  const circ = 2 * Math.PI * r
  const [dash, setDash] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setDash((pct / 100) * circ), 400)
    return () => clearTimeout(t)
  }, [pct, circ])
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ - dash} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 10px ${color})` }}/>
    </svg>
  )
}

// ── Tooltip ────────────────────────────────────────────────────────────────
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)', background: 'rgba(20,20,28,0.97)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px',
          padding: '4px 10px', fontSize: '0.7rem', color: 'var(--text-muted)',
          whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 99,
        }}>{text}</div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function StudentDashboard({ user, setUser, onNavigate, onLogout }) {
  // Dados dinâmicos vindos do backend
  const [dashboard,   setDashboard]   = useState(null)
  const [myCourses,   setMyCourses]   = useState([])
  const [weeklyDays,  setWeeklyDays]  = useState(WEEKLY_DAYS)
  const [recentAct,   setRecentAct]   = useState(RECENT_ACTIVITY)
  const [achievements,setAchievements]= useState(ACHIEVEMENTS)
  const [myRank,      setMyRank]      = useState(null)

  // Dados do usuário: prioriza o que vem do backend, fallback para mock
  const u = {
    name:   user?.name   ?? MOCK_USER.name,
    xp:     user?.xp     ?? MOCK_USER.xp,
    level:  user?.level  ?? MOCK_USER.level,
    streak: user?.streak ?? MOCK_USER.streak,
  }

  const xpToNext   = 5000
  const xpPct      = Math.round(((u.xp % xpToNext) / xpToNext) * 100)
  const firstName  = u.name.split(' ')[0]

  const [filter,        setFilter]      = useState('all')
  const [activeTab,     setActiveTab]   = useState('atividade')
  const [toast,         setToast]       = useState(null)
  const [searchQuery,   setSearchQuery] = useState('')
  const [showEnroll,    setShowEnroll]  = useState(false)
  const [enrollCode,    setEnrollCode]  = useState('')
  const [enrollError,   setEnrollError] = useState('')
  const [enrollLoading, setEnrollLoading] = useState(false)
  const toastTimer = useRef(null)

  // Busca dados do dashboard ao montar
  useEffect(() => {
    userApi.dashboard()
      .then(data => {
        if (data.weeklyStats)    setWeeklyDays(data.weeklyStats)
        if (data.recentActivity?.length) setRecentAct(normalizeActivity(data.recentActivity))
        if (data.user && setUser) setUser(prev => ({
            ...prev,
            ...data.user,
            xp: Math.max(prev?.xp ?? 0, data.user.xp ?? 0),
          }))
      })
      .catch(() => {})

    userApi.achievements()
      .then(data => { if (data?.length) setAchievements(data) })
      .catch(() => {})

    leaderboardApi.get('all-time', 'individual')
      .then(data => {
        if (Array.isArray(data)) {
          const me = data.find(e => e.userId === user?.id)
          if (me) setMyRank(me.rank)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    coursesApi.list('all', searchQuery)
      .then(data => {
        if (Array.isArray(data)) {
          if (data.length > 0) console.log('[courses raw]', data[0])
          setMyCourses(data.map(normalizeCourse))
        }
      })
      .catch(() => {})
  }, [searchQuery])

  const totalXp    = weeklyDays.reduce((s, d) => s + d.xpEarned, 0)
  const maxXp      = Math.max(...weeklyDays.map(d => d.xpEarned), 1)
  const activeDays = weeklyDays.filter(d => d.done).length
  const nextCourse = myCourses.find(c => c.progress < 100)

  const filtered = myCourses.filter(c => {
    const matchFilter =
      filter === 'inprogress' ? c.progress < 100 :
      filter === 'done'       ? c.progress === 100 : true
    const matchSearch = (c.name ?? '').toLowerCase().includes((searchQuery ?? '').toLowerCase())
    return matchFilter && matchSearch
  })

  const showToast = (msg, color = 'var(--accent)') => {
    clearTimeout(toastTimer.current)
    setToast({ msg, color })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('sp-visible'), Number(e.target.dataset.delay || 0))
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.sp-reveal').forEach(el => obs.observe(el))

    const onScroll = () => {
      const g = document.querySelector('.sp-hero-glow')
      if (g) g.style.transform = `translate(${window.scrollY * 0.03}px, ${window.scrollY * 0.05}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [filter, searchQuery])

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const handleEnroll = async () => {
    const code = enrollCode.trim().toUpperCase()
    if (!code) { setEnrollError('Informe o código'); return }
    setEnrollLoading(true)
    setEnrollError('')
    try {
      await coursesApi.enroll(code)
      const fresh = await coursesApi.list()
      if (Array.isArray(fresh)) setMyCourses(fresh.map(normalizeCourse))
      setShowEnroll(false)
      setEnrollCode('')
      showToast('Matriculado com sucesso!')
    } catch (err) {
      if (err._status === 404) setEnrollError('Código inválido')
      else if (err._status === 409) setEnrollError('Você já está matriculado')
      else setEnrollError('Erro ao entrar no curso')
    } finally {
      setEnrollLoading(false)
    }
  }

  return (
    <div className="sp-root">

      {/* ── ENROLL MODAL ── */}
      {showEnroll && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={e => e.target === e.currentTarget && setShowEnroll(false)}>
          <div style={{
            background: 'rgba(16,16,22,0.98)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Entrar com código</h2>
              <button onClick={() => { setShowEnroll(false); setEnrollCode(''); setEnrollError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Insira o código de 8 caracteres fornecido pela sua instituição.
            </p>
            <input
              type="text"
              maxLength={8}
              value={enrollCode}
              onChange={e => { setEnrollCode(e.target.value.toUpperCase()); setEnrollError('') }}
              onKeyDown={e => e.key === 'Enter' && handleEnroll()}
              placeholder="Ex: S8CC5GLR"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '8px', color: '#fff', fontSize: '1.1rem', letterSpacing: '0.15em',
                textAlign: 'center', outline: 'none', marginBottom: '0.5rem',
              }}
              autoFocus
            />
            {enrollError && (
              <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                {enrollError}
              </div>
            )}
            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', opacity: enrollLoading ? 0.6 : 1 }}
              onClick={handleEnroll}
              disabled={enrollLoading}>
              {enrollLoading ? 'Verificando...' : 'Entrar no curso'}
            </button>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999,
          background: 'rgba(16,16,22,0.97)', border: `1px solid ${toast.color}40`,
          borderLeft: `3px solid ${toast.color}`, borderRadius: '10px',
          padding: '0.75rem 1.25rem', color: '#fff', fontSize: '0.85rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'sp-toast-in 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── NAV ── */}
      <nav className="sp-nav">
        <div className="sp-nav-inner">
          <div className="nav-logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
            Gamify<em>Pro</em>
          </div>
          <div className="sp-nav-links">
            {[['meus-cursos','Meus Cursos'], ['progresso','Progresso'], ['conquistas','Conquistas']].map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id) }}>{label}</a>
            ))}
          </div>
          <div className="sp-nav-right">
            <div className="sp-nav-xp">⚡ {u.xp.toLocaleString('pt-BR')} XP</div>
            <div className="sp-nav-avatar">{firstName[0]}</div>
            {user?.type === 'institution' && (
              <button className="nav-signup" onClick={() => onNavigate('institution')}>Dashboard</button>
            )}
            <button className="nav-login" onClick={onLogout}>Sair</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="sp-hero">
        <div className="sp-hero-glow" />
        <div className="sp-hero-glow-r" />
        <div className="sp-hero-inner">

          {/* Coluna esquerda */}
          <div className="sp-hero-left">
            <div className="hero-eyebrow"><span className="dot" />Bem-vinda de volta, {firstName}</div>
            <h1 className="sp-h1">Continue sua<br />jornada de<br /><em>aprendizado.</em></h1>
            <p className="sp-hero-p">
              Você está no nível <strong style={{ color: 'var(--accent)' }}>{u.level}</strong> com{' '}
              <strong style={{ color: 'var(--accent)' }}>{u.xp.toLocaleString('pt-BR')} XP</strong> —
              faltam <strong style={{ color: '#fbbf24' }}>{(xpToNext - u.xp).toLocaleString('pt-BR')} XP</strong> para o próximo.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => scrollTo('meus-cursos')}>Ver meus cursos</button>
              <div className="sp-streak-chip"><strong>{u.streak}</strong> dias seguidos</div>
            </div>
            <div className="hero-stats">
              {[
                { v: myCourses.filter(c => c.progress < 100).length, l: 'Em andamento' },
                { v: myCourses.filter(c => c.progress === 100).length,                 l: 'Concluídos'   },
                { v: myCourses.reduce((s, c) => s + c.lessonsDone, 0),                 l: 'Aulas feitas' },
                { v: myCourses.filter(c => c.progress === 100).length, l: 'Certificados' },
              ].map(({ v, l }) => (
                <div className="stat-card" key={l}>
                  <div className="stat-value">{v}</div>
                  <div className="stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Relatório semanal — coluna central */}
          <div className="sp-hero-center">
            <div className="sp-widget sp-widget-hero">
              <div className="sp-widget-hd">
                <div className="sp-widget-title">Relatório semanal</div>
                <span className="sp-week-badge">Esta semana</span>
              </div>
              <div className="sp-wstats">
                {[
                  { v: `${totalXp} XP`, l: 'XP total' },
                  { v: `${Math.round(totalXp / Math.max(activeDays, 1))} XP`, l: 'Média por dia' },
                  { v: `${activeDays}/7`, l: 'Dias ativos' },
                ].map(({ v, l }) => (
                  <div className="sp-wstat" key={l}>
                    <div className="sp-wstat-v">{v}</div>
                    <div className="sp-wstat-l">{l}</div>
                  </div>
                ))}
              </div>
              <div className="sp-wchart">
                {weeklyDays.map(d => (
                  <Tooltip key={d.day} text={d.xpEarned > 0 ? `${d.xpEarned} XP` : 'Sem atividade'}>
                    <div className="sp-wbar-col">
                      <div className="sp-wbar-wrap">
                        <div className="sp-wbar-fill" style={{
                          height: `${(d.xpEarned / maxXp) * 100}%`,
                          background: d.done ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                          boxShadow: d.done ? '0 0 8px rgba(59,232,176,0.3)' : 'none',
                        }} />
                      </div>
                      <span className="sp-wbar-lbl">{d.day}</span>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="hero-right">
            {/* XP float */}
            <div className="float-card sp-xp-card">
              <div className="sp-xp-ring-wrap">
                <XPRing pct={xpPct} color="#3be8b0" size={110} />
                <div className="sp-xp-center">
                  <div className="sp-xp-lv">Nv {u.level}</div>
                  <div className="sp-xp-pct">{xpPct}%</div>
                </div>
              </div>
              <div className="sp-xp-text">
                <div className="float-card-label">Progresso de nível</div>
                <div className="float-card-value" style={{ fontSize: '1.1rem' }}>
                  {u.xp.toLocaleString('pt-BR')}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'Inter' }}> / {xpToNext.toLocaleString('pt-BR')} XP</span>
                </div>
                <div className="fp-bar" style={{ marginTop: '0.5rem' }}>
                  <div className="fp-fill" style={{ width: `${xpPct}%`, background: 'var(--accent)' }} />
                </div>
                <div className="float-card-sub">{xpToNext - u.xp} XP para o nível {u.level + 1}</div>
              </div>
            </div>

            {/* Próximo curso float */}
            {nextCourse && (
              <div className="float-card">
                <div className="float-card-top">
                  <div className="float-card-icon" style={{ background: `${nextCourse.color}18` }}>{nextCourse.badge}</div>
                  <span className="float-badge live" style={{ background: `${nextCourse.color}14`, color: nextCourse.color, borderColor: `${nextCourse.color}30` }}>● Em andamento</span>
                </div>
                <div className="float-card-label">Continuar de onde parou</div>
                <div className="float-card-value" style={{ fontSize: '0.92rem', lineHeight: 1.3 }}>{nextCourse.name}</div>
                <div className="float-card-sub">Próxima: {nextCourse.nextLesson}</div>
                <div className="fp-bar" style={{ marginTop: '0.7rem' }}>
                  <div className="fp-fill" style={{ width: `${nextCourse.progress}%`, background: nextCourse.color }} />
                </div>
                <div style={{ fontSize: '0.68rem', color: nextCourse.color, marginTop: '0.25rem' }}>{nextCourse.progress}% concluído</div>
              </div>
            )}

            {/* Streak float */}
            <div className="float-card">
              <div className="float-card-top">
                <span className="float-badge up">Sequência ativa</span>
              </div>
              <div className="float-card-label">Dias consecutivos de estudo</div>
              <div className="float-card-value">{u.streak}</div>
              <div className="float-card-sub">{activeDays}/7 dias esta semana · {totalXp} XP no total</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── MEUS CURSOS ── */}
      <section className="sp-section" id="meus-cursos">
        <div className="wrapper">
          <div className="benefits-header sp-reveal">
            <div className="section-eyebrow">Sua jornada</div>
            <h2 className="section-title">Meus Cursos</h2>
            <p className="section-desc">Acompanhe seu progresso e continue de onde parou em cada curso.</p>
          </div>

          {/* Filtros + busca */}
          <div className="sp-filters-row sp-reveal" data-delay="80">
            <div className="sp-filters">
              {[['all','Todos'], ['inprogress','Em andamento'], ['done','Concluídos']].map(([val, label]) => (
                <button key={val} className={`sp-filter-btn ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
                  {label}
                </button>
              ))}
              <button
                className="sp-filter-btn"
                style={{ color: 'var(--accent)', borderColor: 'var(--accent)', background: 'rgba(59,232,176,0.06)' }}
                onClick={() => { setEnrollCode(''); setEnrollError(''); setShowEnroll(true) }}>
                + Entrar com código
              </button>
            </div>
            <div className="sp-search-wrap">
              <span className="sp-search-icon">🔍</span>
              <input
                className="sp-search"
                type="text"
                placeholder="Buscar curso..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="sp-search-clear" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>
          </div>

          {/* Estado vazio */}
          {filtered.length === 0 ? (
            <div className="sp-empty sp-reveal">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔎</div>
              <div>Nenhum curso encontrado</div>
            </div>
          ) : (
            <div className="sp-courses-grid">
              {filtered.map((course, i) => (
                <div key={course.id} className="sp-course-card"
                  style={{ '--cc': course.color, '--cg': course.glow, '--sp-delay': `${i * 80}ms` }}>
                  <div className="sp-cc-top">
                    <span className="sp-cc-badge">{course.badge}</span>
                    <div className="sp-cc-top-right">
                      <div className="sp-cc-inst">{course.institution}</div>
                      {course.progress === 100 && <span className="sp-cc-done">✓ Concluído</span>}
                    </div>
                  </div>
                  <div className="sp-cc-name">{course.name}</div>
                  <div className="sp-cc-meta">{course.lessonsDone}/{course.lessonsTotal} aulas · Acessado {course.lastAccess}</div>
                  <div className="sp-cc-bar-bg">
                    <div className="sp-cc-bar-fill" style={{ width: `${course.progress}%`, background: course.color }} />
                  </div>
                  <div className="sp-cc-footer">
                    <span style={{ color: course.color, fontSize: '0.78rem', fontWeight: 600 }}>{course.progress}%</span>
                    {course.nextLesson && <span className="sp-cc-next">→ {course.nextLesson}</span>}
                  </div>
                  <button className="sp-cc-btn"
                    style={{ color: course.color, borderColor: `${course.color}35`, background: `${course.color}0c` }}
                    onClick={() => onNavigate('course-detail', { courseId: course.id, from: 'dashboard' })}>
                    {course.progress === 100 ? 'Revisar curso' : course.progress === 0 ? 'Começar →' : 'Continuar →'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROGRESSO ── */}
      <section className="sp-section sp-alt" id="progresso">
        <div className="wrapper">
          <div className="benefits-header sp-reveal">
            <div className="section-eyebrow">Acompanhamento</div>
            <h2 className="section-title">Seu Progresso</h2>
            <p className="section-desc">Sequência de estudos e atividade recente.</p>
          </div>

          {/* Sequência semanal */}
          <div className="sp-widget sp-reveal" data-delay="0" style={{ marginBottom: '1.5rem' }}>
            <div className="sp-widget-hd">
              <div>
                <div className="sp-widget-title">Sequência semanal</div>
                <div className="sp-widget-sub">Continue assim!</div>
              </div>
              <div className="sp-streak-big">
                <span style={{ fontSize: '1.5rem' }}>🔥</span>
                <span className="sp-streak-n">{u.streak}</span>
                <span className="sp-streak-u">dias</span>
              </div>
            </div>
            <div className="sp-streak-row">
              {weeklyDays.map((d, i) => (
                <div key={d.day} className="sp-sday">
                  <div className={`sp-sdot ${d.done ? 'done' : i === weeklyDays.findIndex(x => !x.done) ? 'today' : ''}`}>
                    {d.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="sp-sday-lbl">{d.day}</span>
                  {d.xpEarned > 0 && <span className="sp-sday-min">{d.xpEarned} XP</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Tabs: Atividade recente / Progresso por curso */}
          <div className="sp-widget sp-reveal sp-activity-widget" data-delay="120">
            <div className="sp-tabs">
              {[['atividade','Atividade recente'], ['cursos','Progresso por curso']].map(([tab, label]) => (
                <button key={tab} className={`sp-tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'atividade' && (
              <div className="sp-activity-list">
                {recentAct.map((item, i) => (
                  <div key={i} className="sp-act-row">
                    <div className="sp-act-pip" style={{ background: item.color }} />
                    <div className="sp-act-body">
                      <div className="sp-act-text">{item.text}</div>
                      <div className="sp-act-meta">
                        <span className="sp-act-time">{item.time}</span>
                        <span style={{ color: item.color, opacity: 0.7, fontSize: '0.68rem' }}>{item.course}</span>
                      </div>
                    </div>
                    <span className="sp-act-xp" style={{ color: item.color }}>{item.xp}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'cursos' && (
              <div className="sp-course-progress-list">
                {myCourses.map(c => (
                  <div key={c.id} className="sp-cp-row">
                    <span className="sp-cp-badge">{c.badge}</span>
                    <div className="sp-cp-info">
                      <div className="sp-cp-name">{c.name}</div>
                      <div className="sp-cc-bar-bg" style={{ marginTop: '0.4rem' }}>
                        <div className="sp-cc-bar-fill" style={{ width: `${c.progress}%`, background: c.color }} />
                      </div>
                    </div>
                    <span style={{ color: c.color, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>{c.progress}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CONQUISTAS ── */}
      <section className="sp-section" id="conquistas">
        <div className="wrapper">
          <div className="benefits-header sp-reveal">
            <div className="section-eyebrow">Suas medalhas</div>
            <h2 className="section-title">Conquistas</h2>
            <p className="section-desc">Continue estudando para desbloquear novas conquistas e subir no ranking.</p>
          </div>

          <div className="sp-ach-grid sp-reveal" data-delay="80">
            {achievements.map((a, i) => {
              const label = a.label ?? a.name ?? `achievement-${i}`
              return (
                <div key={a.id ?? label} className={`sp-ach ${a.unlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => a.unlocked && showToast(`🏅 "${label}" desbloqueada!`)}>
                  <div className="sp-ach-icon">{a.icon}</div>
                  <div className="sp-ach-label">{label}</div>
                  {!a.unlocked && <div className="sp-ach-lock">🔒</div>}
                </div>
              )
            })}
          </div>

          <div className="sp-rank-teaser sp-reveal" data-delay="180">
            <div className="sp-rank-left">
              <div className="sp-rank-pos">{myRank != null ? `#${myRank}` : '—'}</div>
              <div>
                <div className="sp-rank-label">Sua posição no ranking global</div>
                <div className="sp-rank-sub">{u.xp.toLocaleString('pt-BR')} XP acumulados</div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => onNavigate('leaderboard')}>Ver ranking →</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">GamifyPro</div>
          <div>Plataforma Gamificada de Aprendizado</div>
          <div>© 2025 GamifyPro. Todos os direitos reservados.</div>
        </div>
      </footer>

    </div>
  )
}
