import { useState, useEffect } from 'react'
import { courses as coursesApi } from '../api/client'

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

function normalizeCourseDetail(raw) {
  const p = toPalette(raw.id)
  const mapLesson = (l) => ({
    id:       String(l.id),
    title:    l.title    ?? 'Aula',
    duration: l.duration ?? '—',
    status:   l.status   ?? 'available',
    videoUrl: l.videoUrl ?? l.video_url ?? null,
  })
  const flatLessons = (raw.lessons || []).map(mapLesson)
  const flatById    = Object.fromEntries(flatLessons.map(l => [l.id, l]))
  const modules = raw.modules?.length
    ? raw.modules.map(m => ({
        name: m.name,
        lessons: (m.lessons || []).map(l => flatById[String(l.id)] ?? mapLesson(l)),
      }))
    : [{ name: 'Aulas do curso', lessons: flatLessons }]

  const lessonsTotal = raw.lessonsTotal ?? raw.totalLessons ?? flatLessons.length
  const lessonsDone  = flatLessons.filter(l => l.status === 'done').length
  const progress     = raw.progress ?? (lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0)

  return {
    id:            raw.id,
    name:          raw.name          ?? '',
    institution:   raw.institution   ?? raw.institutionName ?? '',
    color:         raw.color         || p.color,
    glow:          raw.glow          || p.glow,
    badge:         raw.badge         || p.badge,
    progress,
    lessonsTotal,
    lessonsDone,
    instructor:    raw.instructor    ?? raw.instructorName  ?? '—',
    totalDuration: raw.totalDuration ?? raw.duration        ?? '—',
    certificate:   raw.certificate   ?? false,
    xpReward:      raw.xpReward      ?? raw.xp              ?? 0,
    modules,
  }
}

// Progress Ring component
function ProgressRing({ pct, color, size = 140 }) {
  const r = (size / 2) - 12
  const circ = 2 * Math.PI * r
  const [dash, setDash] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDash((pct / 100) * circ), 300)
    return () => clearTimeout(t)
  }, [pct, circ])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="cd-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)',
          filter: `drop-shadow(0 0 12px ${color})`,
        }}
      />
    </svg>
  )
}

export default function CourseDetailPage({ user, onNavigate, onLogout, ctx }) {
  const courseId  = ctx?.courseId
  const firstName = user?.name?.split(' ')[0] || 'Aluno'

  const [course,  setCourse]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [denied,  setDenied]  = useState(false)

  useEffect(() => {
    if (!courseId) { onNavigate('my-courses'); return }
    coursesApi.get(courseId)
      .then(data => { setCourse(normalizeCourseDetail(data)); setLoading(false) })
      .catch(err => {
        setLoading(false)
        const msg = err?.message ?? err?.error ?? ''
        if (err?._status === 403 || err?._status === 500 || msg.toLowerCase().includes('acesso negado')) {
          setDenied(true)
        } else {
          onNavigate('my-courses')
        }
      })
  }, [courseId])

  // Must be declared before any early return (rules of hooks)
  useEffect(() => {
    if (!course) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('cd-visible'), Number(e.target.dataset.delay || 0))
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.cd-reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [course])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
        Carregando curso...
      </div>
    )
  }

  if (denied) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem' }}>🔒</div>
        <div style={{ fontSize: '1.1rem', color: '#fff' }}>Acesso negado</div>
        <div>Você não está matriculado neste curso.</div>
        <button className="btn-primary" onClick={() => onNavigate('my-courses')}>Ir para Meus Cursos</button>
      </div>
    )
  }

  if (!course) return null

  const findNextLesson = () => {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.status === 'available') return lesson
      }
    }
    return course.modules[0]?.lessons[0]
  }
  const nextLesson = findNextLesson()

  return (
    <div className="cd-root" style={{ '--cc': course.color, '--cg': course.glow }}>
      {/* Nav */}
      <nav className="cd-nav">
        <div className="cd-nav-inner">
          <div className="cd-nav-left">
            <button className="cd-back-btn" onClick={() => onNavigate(ctx.from || 'dashboard')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {ctx.from === 'my-courses' ? 'Meus Cursos' : 'Início'}
            </button>
            <span className="cd-breadcrumb-sep">/</span>
            <span className="cd-breadcrumb-current">{course.name}</span>
          </div>
          <div className="cd-nav-right">
            <div className="cd-nav-avatar">{firstName[0]}</div>
            <button className="nav-login" onClick={onLogout}>Sair</button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="cd-hero">
        <div className="cd-hero-glow" style={{ background: `radial-gradient(circle at 20% 30%, ${course.glow} 0%, transparent 50%)` }} />
        <div className="cd-hero-inner">
          <div className="cd-hero-left">
            <span className="cd-hero-badge">{course.badge}</span>
            <h1 className="cd-hero-title">{course.name}</h1>
            <p className="cd-hero-inst">{course.institution}</p>
            <button
              className="cd-hero-btn"
              style={{ background: course.color }}
              onClick={() => onNavigate('course-player', { courseId: course.id, lessonId: nextLesson?.id })}
            >
              {course.progress === 100 ? 'Revisar curso' : 'Continuar'}
            </button>
          </div>
          <div className="cd-hero-right">
            <div className="cd-ring-wrap">
              <ProgressRing pct={course.progress} color={course.color} size={140} />
              <div className="cd-ring-center">
                <span className="cd-ring-pct">{course.progress}%</span>
                <span className="cd-ring-label">completo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="cd-content">
        <div className="cd-wrapper">
          <div className="cd-layout">
            {/* Left: Lessons */}
            <div className="cd-lessons-col">
              <h2 className="cd-section-title cd-reveal">Aulas do curso</h2>
              <div className="cd-modules">
                {course.modules.map((mod, mi) => (
                  <div key={mod.name ?? `module-${mi}`} className="cd-module cd-reveal" data-delay={mi * 80}>
                    <div className="cd-module-header">{mod.name}</div>
                    <div className="cd-lessons-list">
                      {mod.lessons.map((lesson, li) => (
                        <button
                          key={lesson.id}
                          className={`cd-lesson-row ${lesson.status}`}
                          disabled={lesson.status === 'locked'}
                          onClick={() =>
                            lesson.status !== 'locked' &&
                            onNavigate('course-player', { courseId: course.id, lessonId: lesson.id })
                          }
                        >
                          <div className="cd-lesson-num">
                            {lesson.status === 'locked' ? (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <rect x="4" y="6" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                                <path d="M5.5 6V4.5a1.5 1.5 0 013 0V6" stroke="currentColor" strokeWidth="1.2"/>
                              </svg>
                            ) : lesson.status === 'done' ? (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M3 7l3 3 5-6" stroke={course.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : lesson.videoUrl ? (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M5 3l6 4-6 4V3z" fill={course.color}/>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.2"/>
                              </svg>
                            )}
                          </div>
                          <div className="cd-lesson-info">
                            <span className="cd-lesson-title">{lesson.title}</span>
                            <span className="cd-lesson-duration">{lesson.duration}</span>
                          </div>
                          <div className="cd-lesson-status">
                            {lesson.status === 'done' && <span style={{ color: course.color }}>Concluída</span>}
                            {lesson.status === 'available' && <span style={{ color: course.color }}>Disponível</span>}
                            {lesson.status === 'locked' && <span>Bloqueada</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Course Info Sidebar */}
            <div className="cd-sidebar-col">
              <div className="cd-info-card cd-reveal" data-delay="100">
                <h3 className="cd-info-title">Informações do curso</h3>
                <div className="cd-info-list">
                  <div className="cd-info-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <span className="cd-info-label">Instrutor</span>
                      <span className="cd-info-value">{course.instructor}</span>
                    </div>
                  </div>
                  <div className="cd-info-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <span className="cd-info-label">Duração total</span>
                      <span className="cd-info-value">{course.totalDuration}</span>
                    </div>
                  </div>
                  <div className="cd-info-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M6 7l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <span className="cd-info-label">Total de aulas</span>
                      <span className="cd-info-value">{course.lessonsTotal} aulas</span>
                    </div>
                  </div>
                  <div className="cd-info-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1l2 4 4.5.7-3.25 3.2.75 4.6L8 11.5l-4 2 .75-4.6L1.5 5.7 6 5l2-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <span className="cd-info-label">Certificado</span>
                      <span className="cd-info-value">{course.certificate ? 'Disponível' : 'Não disponível'}</span>
                    </div>
                  </div>
                  <div className="cd-info-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2l1.5 3 3.5.5-2.5 2.5.6 3.5L8 10l-3.1 1.5.6-3.5L3 5.5 6.5 5 8 2z" fill="#fbbf24"/>
                    </svg>
                    <div>
                      <span className="cd-info-label">XP do curso</span>
                      <span className="cd-info-value" style={{ color: '#fbbf24' }}>{course.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
