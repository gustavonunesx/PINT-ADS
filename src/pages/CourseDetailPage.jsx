import { useState, useEffect } from 'react'

// Course data
const COURSES_DATA = {
  'seguranca-info': {
    id: 'seguranca-info',
    name: 'Segurança da Informação',
    institution: 'Universidade Nova',
    color: '#3be8b0',
    glow: 'rgba(59,232,176,0.15)',
    badge: '🛡️',
    progress: 87,
    lessonsTotal: 8,
    lessonsDone: 7,
    instructor: 'Dr. Carlos Mendes',
    totalDuration: '4h 30min',
    certificate: true,
    xpReward: 850,
    modules: [
      {
        name: 'Módulo 1 — Fundamentos',
        lessons: [
          { id: 'l1', title: 'Introdução à Segurança', duration: '12 min', status: 'done', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
          { id: 'l2', title: 'Ameaças e Vulnerabilidades', duration: '18 min', status: 'done', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
          { id: 'l3', title: 'Criptografia Básica', duration: '22 min', status: 'done', videoUrl: 'https://vimeo.com/123456789' },
        ],
      },
      {
        name: 'Módulo 2 — Aplicações Práticas',
        lessons: [
          { id: 'l4', title: 'Criptografia Avançada', duration: '25 min', status: 'done', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
          { id: 'l5', title: 'Gestão de Incidentes', duration: '20 min', status: 'done', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
          { id: 'l6', title: 'Análise de Riscos', duration: '28 min', status: 'done', videoUrl: null },
          { id: 'l7', title: 'Normas ISO 27001', duration: '30 min', status: 'done', videoUrl: null },
        ],
      },
      {
        name: 'Módulo 3 — Certificação',
        lessons: [{ id: 'l8', title: 'Certificação Final', duration: '35 min', status: 'available', videoUrl: null }],
      },
    ],
  },
  'compliance-lgpd': {
    id: 'compliance-lgpd',
    name: 'Compliance & LGPD',
    institution: 'Universidade Nova',
    color: '#63c8ff',
    glow: 'rgba(99,200,255,0.15)',
    badge: '⚖️',
    progress: 65,
    lessonsTotal: 6,
    lessonsDone: 4,
    instructor: 'Dra. Ana Paula Silva',
    totalDuration: '3h 15min',
    certificate: true,
    xpReward: 720,
    modules: [
      {
        name: 'Módulo 1 — Fundamentos',
        lessons: [
          { id: 'l1', title: 'O que é LGPD', duration: '15 min', status: 'done' },
          { id: 'l2', title: 'Princípios da Lei', duration: '20 min', status: 'done' },
        ],
      },
      {
        name: 'Módulo 2 — Implementação',
        lessons: [
          { id: 'l3', title: 'Mapeamento de Dados', duration: '25 min', status: 'done' },
          { id: 'l4', title: 'DPO e Responsabilidades', duration: '22 min', status: 'done' },
          { id: 'l5', title: 'Políticas de Privacidade', duration: '28 min', status: 'available' },
          { id: 'l6', title: 'Avaliação Final', duration: '30 min', status: 'locked' },
        ],
      },
    ],
  },
  'boas-praticas-dev': {
    id: 'boas-praticas-dev',
    name: 'Boas Práticas Dev',
    institution: 'Tech Academy',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    badge: '💻',
    progress: 100,
    lessonsTotal: 5,
    lessonsDone: 5,
    instructor: 'João Pedro Costa',
    totalDuration: '2h 45min',
    certificate: true,
    xpReward: 650,
    modules: [
      {
        name: 'Módulo 1 — Clean Code',
        lessons: [
          { id: 'l1', title: 'Fundamentos Clean Code', duration: '18 min', status: 'done' },
          { id: 'l2', title: 'Naming Conventions', duration: '15 min', status: 'done' },
          { id: 'l3', title: 'Refactoring', duration: '22 min', status: 'done' },
        ],
      },
      {
        name: 'Módulo 2 — Padrões',
        lessons: [
          { id: 'l4', title: 'Design Patterns', duration: '30 min', status: 'done' },
          { id: 'l5', title: 'Code Review', duration: '20 min', status: 'done' },
        ],
      },
    ],
  },
  'soft-skills': {
    id: 'soft-skills',
    name: 'Soft Skills & Liderança',
    institution: 'Universidade Nova',
    color: '#f87171',
    glow: 'rgba(248,113,113,0.15)',
    badge: '🌱',
    progress: 20,
    lessonsTotal: 7,
    lessonsDone: 1,
    instructor: 'Maria Fernanda Alves',
    totalDuration: '5h 00min',
    certificate: true,
    xpReward: 920,
    modules: [
      {
        name: 'Módulo 1 — Comunicação',
        lessons: [
          { id: 'l1', title: 'Comunicação Efetiva', duration: '20 min', status: 'done' },
          { id: 'l2', title: 'Comunicação Não-Violenta', duration: '25 min', status: 'available' },
          { id: 'l3', title: 'Feedback Construtivo', duration: '22 min', status: 'locked' },
        ],
      },
      {
        name: 'Módulo 2 — Liderança',
        lessons: [
          { id: 'l4', title: 'Estilos de Liderança', duration: '28 min', status: 'locked' },
          { id: 'l5', title: 'Gestão de Equipes', duration: '30 min', status: 'locked' },
          { id: 'l6', title: 'Delegação', duration: '18 min', status: 'locked' },
          { id: 'l7', title: 'Avaliação Final', duration: '35 min', status: 'locked' },
        ],
      },
    ],
  },
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
  const courseId = ctx?.courseId || 'seguranca-info'
  const course = COURSES_DATA[courseId] || COURSES_DATA['seguranca-info']
  const firstName = user?.name?.split(' ')[0] || 'Aluno'

  // Find next available lesson
  const findNextLesson = () => {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.status === 'available') return lesson
      }
    }
    return course.modules[0]?.lessons[0]
  }
  const nextLesson = findNextLesson()

  useEffect(() => {
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
  }, [])

  return (
    <div className="cd-root" style={{ '--cc': course.color, '--cg': course.glow }}>
      {/* Nav */}
      <nav className="cd-nav">
        <div className="cd-nav-inner">
          <div className="cd-nav-left">
            <button className="cd-back-btn" onClick={() => onNavigate('my-courses')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Meus Cursos
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
                  <div key={mod.name} className="cd-module cd-reveal" data-delay={mi * 80}>
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
