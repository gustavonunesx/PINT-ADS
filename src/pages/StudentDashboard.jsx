import { useState, useEffect, useRef } from 'react'

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_USER = { name: 'Ana Silva', xp: 3840, level: 12, streak: 7 }

const MY_COURSES = [
  { id: 'c1', name: 'Segurança da Informação', institution: 'Universidade Nova', color: '#3be8b0', glow: 'rgba(59,232,176,0.15)', badge: '🛡️', progress: 87, lessonsTotal: 8, lessonsDone: 7, lastAccess: 'hoje',     nextLesson: 'Certificação Final' },
  { id: 'c2', name: 'Compliance & LGPD',        institution: 'Universidade Nova', color: '#63c8ff', glow: 'rgba(99,200,255,0.15)',  badge: '⚖️', progress: 65, lessonsTotal: 6, lessonsDone: 4, lastAccess: 'ontem',    nextLesson: 'DPO e Responsabilidades' },
  { id: 'c3', name: 'Boas Práticas Dev',         institution: 'Tech Academy',      color: '#a78bfa', glow: 'rgba(167,139,250,0.15)', badge: '💻', progress: 100,lessonsTotal: 5, lessonsDone: 5, lastAccess: '3 dias',   nextLesson: null },
  { id: 'c4', name: 'Soft Skills & Liderança',   institution: 'Universidade Nova', color: '#f87171', glow: 'rgba(248,113,113,0.15)', badge: '🌱', progress: 20, lessonsTotal: 7, lessonsDone: 1, lastAccess: '1 semana', nextLesson: 'Comunicação Não-Violenta' },
]

const WEEKLY_DAYS = [
  { day: 'Seg', minutes: 45, done: true  },
  { day: 'Ter', minutes: 30, done: true  },
  { day: 'Qua', minutes: 60, done: true  },
  { day: 'Qui', minutes: 20, done: true  },
  { day: 'Sex', minutes: 50, done: true  },
  { day: 'Sáb', minutes: 15, done: true  },
  { day: 'Dom', minutes: 0,  done: false },
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
export default function StudentDashboard({ user, onNavigate, onLogout }) {
  const u          = user ? { ...MOCK_USER, name: user.name } : MOCK_USER
  const xpToNext   = 5000
  const xpPct      = Math.round((u.xp / xpToNext) * 100)
  const totalMin   = WEEKLY_DAYS.reduce((s, d) => s + d.minutes, 0)
  const maxMin     = Math.max(...WEEKLY_DAYS.map(d => d.minutes), 1)
  const activeDays = WEEKLY_DAYS.filter(d => d.done).length
  const firstName  = u.name.split(' ')[0]
  const nextCourse = MY_COURSES.find(c => c.progress > 0 && c.progress < 100)

  const [filter,      setFilter]      = useState('all')
  const [activeTab,   setActiveTab]   = useState('atividade')
  const [toast,       setToast]       = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const toastTimer = useRef(null)

  const filtered = MY_COURSES.filter(c => {
    const matchFilter =
      filter === 'inprogress' ? c.progress > 0 && c.progress < 100 :
      filter === 'done'       ? c.progress === 100 : true
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="sp-root">

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
                { v: MY_COURSES.filter(c => c.progress > 0 && c.progress < 100).length, l: 'Em andamento' },
                { v: MY_COURSES.filter(c => c.progress === 100).length,                 l: 'Concluídos'   },
                { v: MY_COURSES.reduce((s, c) => s + c.lessonsDone, 0),                 l: 'Aulas feitas' },
                { v: 3, l: 'Certificados' },
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
                  { v: `${Math.floor(totalMin/60)}h ${totalMin%60}m`, l: 'Total estudado' },
                  { v: `${Math.round(totalMin / Math.max(activeDays, 1))}m`, l: 'Média por dia' },
                  { v: `${activeDays}/7`, l: 'Dias ativos' },
                ].map(({ v, l }) => (
                  <div className="sp-wstat" key={l}>
                    <div className="sp-wstat-v">{v}</div>
                    <div className="sp-wstat-l">{l}</div>
                  </div>
                ))}
              </div>
              <div className="sp-wchart">
                {WEEKLY_DAYS.map(d => (
                  <Tooltip key={d.day} text={d.minutes > 0 ? `${d.minutes}min` : 'Sem estudo'}>
                    <div className="sp-wbar-col">
                      <div className="sp-wbar-wrap">
                        <div className="sp-wbar-fill" style={{
                          height: `${(d.minutes / maxMin) * 100}%`,
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
              <div className="float-card-sub">{activeDays}/7 dias esta semana · {Math.floor(totalMin/60)}h {totalMin%60}m no total</div>
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
                <div key={course.id} className="sp-course-card sp-reveal" data-delay={i * 80}
                  style={{ '--cc': course.color, '--cg': course.glow }}>
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
                    onClick={() => showToast(
                      course.progress === 100 ? `Revisando "${course.name}"` :
                      course.progress === 0   ? `Iniciando "${course.name}"` :
                                                `Continuando "${course.name}" — ${course.nextLesson}`,
                      course.color
                    )}>
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
              {WEEKLY_DAYS.map((d, i) => (
                <div key={d.day} className="sp-sday">
                  <div className={`sp-sdot ${d.done ? 'done' : i === WEEKLY_DAYS.findIndex(x => !x.done) ? 'today' : ''}`}>
                    {d.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="sp-sday-lbl">{d.day}</span>
                  {d.minutes > 0 && <span className="sp-sday-min">{d.minutes}m</span>}
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
                {RECENT_ACTIVITY.map((item, i) => (
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
                {MY_COURSES.map(c => (
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
            {ACHIEVEMENTS.map(a => (
              <div key={a.label} className={`sp-ach ${a.unlocked ? 'unlocked' : 'locked'}`}
                onClick={() => a.unlocked && showToast(`🏅 "${a.label}" desbloqueada!`)}>
                <div className="sp-ach-icon">{a.icon}</div>
                <div className="sp-ach-label">{a.label}</div>
                {!a.unlocked && <div className="sp-ach-lock">🔒</div>}
              </div>
            ))}
          </div>

          <div className="sp-rank-teaser sp-reveal" data-delay="180">
            <div className="sp-rank-left">
              <div className="sp-rank-pos">#14</div>
              <div>
                <div className="sp-rank-label">Sua posição no ranking global</div>
                <div className="sp-rank-sub">Top 5% · {u.xp.toLocaleString('pt-BR')} XP acumulados esta semana</div>
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