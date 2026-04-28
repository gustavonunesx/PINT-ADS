import { useState, useEffect } from 'react'

// Mock courses data
const COURSES = [
  {
    id: 'seguranca-info',
    name: 'Segurança da Informação',
    institution: 'Universidade Nova',
    color: '#3be8b0',
    glow: 'rgba(59,232,176,0.15)',
    badge: '🛡️',
    progress: 87,
    lessonsTotal: 8,
    lessonsDone: 7,
    lastAccess: 'Acessado hoje',
  },
  {
    id: 'compliance-lgpd',
    name: 'Compliance & LGPD',
    institution: 'Universidade Nova',
    color: '#63c8ff',
    glow: 'rgba(99,200,255,0.15)',
    badge: '⚖️',
    progress: 65,
    lessonsTotal: 6,
    lessonsDone: 4,
    lastAccess: 'Acessado ontem',
  },
  {
    id: 'boas-praticas-dev',
    name: 'Boas Práticas Dev',
    institution: 'Tech Academy',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    badge: '💻',
    progress: 100,
    lessonsTotal: 5,
    lessonsDone: 5,
    lastAccess: 'Acessado há 3 dias',
  },
  {
    id: 'soft-skills',
    name: 'Soft Skills & Liderança',
    institution: 'Universidade Nova',
    color: '#f87171',
    glow: 'rgba(248,113,113,0.15)',
    badge: '🌱',
    progress: 20,
    lessonsTotal: 7,
    lessonsDone: 1,
    lastAccess: 'Acessado há 1 semana',
  },
]

export default function MyCoursesPage({ user, onNavigate, onLogout }) {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const firstName = user?.name?.split(' ')[0] || 'Aluno'

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('mc-visible'), Number(e.target.dataset.delay || 0))
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.mc-reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [filter, searchQuery])

  const filtered = COURSES.filter((c) => {
    const matchFilter =
      filter === 'inprogress'
        ? c.progress > 0 && c.progress < 100
        : filter === 'done'
          ? c.progress === 100
          : true
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="mc-root">
      {/* Nav */}
      <nav className="mc-nav">
        <div className="mc-nav-inner">
          <div className="nav-logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
            Gamify<em>Pro</em>
          </div>
          <div className="mc-nav-right">
            <div className="mc-nav-avatar">{firstName[0]}</div>
            <button className="nav-login" onClick={onLogout}>
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="mc-hero">
        <div className="mc-hero-glow" />
        <div className="mc-hero-inner">
          <div className="mc-hero-text">
            <h1 className="mc-title">Minha Jornada</h1>
            <p className="mc-subtitle">Seus cursos matriculados</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mc-content">
        <div className="mc-wrapper">
          {/* Filters + Search */}
          <div className="mc-filters-row mc-reveal">
            <div className="mc-filters">
              {[
                ['all', 'Todos'],
                ['inprogress', 'Em andamento'],
                ['done', 'Concluídos'],
              ].map(([val, label]) => (
                <button
                  key={val}
                  className={`mc-filter-btn ${filter === val ? 'active' : ''}`}
                  onClick={() => setFilter(val)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mc-search-wrap">
              <svg className="mc-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                className="mc-search"
                type="text"
                placeholder="Buscar curso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="mc-search-clear" onClick={() => setSearchQuery('')}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          {filtered.length === 0 ? (
            <div className="mc-empty mc-reveal">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="20" cy="20" r="14" stroke="var(--text-muted)" strokeWidth="2" />
                <path d="M30 30l10 10" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div>Nenhum curso encontrado</div>
            </div>
          ) : (
            <div className="mc-courses-grid">
              {filtered.map((course, i) => (
                <div
                  key={course.id}
                  className="mc-course-card mc-reveal"
                  data-delay={i * 60}
                  style={{ '--cc': course.color, '--cg': course.glow }}
                >
                  {/* Left accent border */}
                  <div className="mc-card-accent" style={{ background: course.color }} />

                  {/* Card content */}
                  <div className="mc-card-body">
                    {/* Top row */}
                    <div className="mc-card-top">
                      <span className="mc-card-badge">{course.badge}</span>
                      {course.progress === 100 && <span className="mc-card-done">✓ Concluído</span>}
                    </div>

                    {/* Course info */}
                    <h3 className="mc-card-name">{course.name}</h3>
                    <p className="mc-card-inst">{course.institution}</p>

                    {/* Progress bar */}
                    <div className="mc-progress-wrap">
                      <div className="mc-progress-bar">
                        <div
                          className="mc-progress-fill"
                          style={{ width: `${course.progress}%`, background: course.color }}
                        />
                      </div>
                      <span className="mc-progress-pct" style={{ color: course.color }}>
                        {course.progress}%
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="mc-card-stats">
                      <span>
                        {course.lessonsDone}/{course.lessonsTotal} aulas
                      </span>
                      <span>{course.lastAccess}</span>
                    </div>

                    {/* CTA Button */}
                    <button
                      className="mc-card-btn"
                      style={{
                        background: course.color,
                        boxShadow: `0 0 20px ${course.glow}`,
                      }}
                      onClick={() => onNavigate('course-detail', { courseId: course.id })}
                    >
                      {course.progress === 100 ? 'Revisar' : 'Continuar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
