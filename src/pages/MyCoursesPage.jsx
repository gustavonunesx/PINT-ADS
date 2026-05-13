import { useState, useEffect } from 'react'
import { courses as coursesApi } from '../api/client'

const PALETTE = ['#3be8b0','#63c8ff','#a78bfa','#fbbf24','#f87171','#34d399','#fb923c','#e879f9']
function toPalette(id) {
  const n = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTE[n % PALETTE.length]
}

function normalizeCourse(c) {
  const color       = c.color || toPalette(c.id)
  const lessons     = Array.isArray(c.lessons) ? c.lessons : []
  const lessonsTotal = c.lessonsCount ?? lessons.length ?? 0
  const lessonsDone  = lessons.filter(l => l.status === 'done').length
  const progress     = c.progress ?? (lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0)
  return {
    id:          c.id,
    name:        c.name,
    institution: c.institution ?? c.institutionName ?? '',
    color,
    glow:        `${color}26`,
    badge:       c.badge ?? '🎓',
    progress,
    lessonsTotal,
    lessonsDone,
  }
}

export default function MyCoursesPage({ user, onNavigate, onLogout }) {
  const [courses, setCourses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const firstName = user?.name?.split(' ')[0] || 'Aluno'

  useEffect(() => {
    coursesApi.list()
      .then(data => { if (Array.isArray(data)) setCourses(data.map(normalizeCourse)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter((c) => {
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
          <div className="mc-filters-row">
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
          {loading ? (
            <div className="mc-empty" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>A carregar cursos…</div>
          ) : filtered.length === 0 ? (
            <div className="mc-empty">
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
                  className="mc-course-card"
                  style={{ '--cc': course.color, '--cg': course.glow, '--mc-delay': `${i * 60}ms` }}
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
                      <span>{course.lessonsDone}/{course.lessonsTotal} aulas</span>
                    </div>

                    {/* CTA Button */}
                    <button
                      className="mc-card-btn"
                      style={{
                        background: course.color,
                        boxShadow: `0 0 20px ${course.glow}`,
                      }}
                      onClick={() => onNavigate('course-detail', { courseId: course.id, from: 'my-courses' })}
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
