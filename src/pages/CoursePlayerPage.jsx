import { useState, useEffect, useRef } from 'react'

// Helper to extract video ID and type
function parseVideoUrl(url) {
  if (!url) return { type: null, id: null }
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return { type: 'youtube', id: ytMatch[1] }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] }
  // Direct video (mp4, webm, etc)
  if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i) || url.startsWith('http')) {
    return { type: 'direct', id: url }
  }
  return { type: 'direct', id: url }
}

// Dynamic Video Player component
function VideoPlayer({ videoUrl, color, onTimeUpdate, onEnded }) {
  const videoRef = useRef(null)
  const { type, id } = parseVideoUrl(videoUrl)

  if (!videoUrl || !type) {
    return (
      <div className="cp-video-placeholder">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ color }}>
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
          <path d="M26 22l18 10-18 10V22z" fill="currentColor"/>
        </svg>
        <span>Video nao disponivel para esta aula</span>
      </div>
    )
  }

  if (type === 'youtube') {
    return (
      <iframe
        className="cp-video-iframe"
        src={`https://www.youtube.com/embed/${id}?autoplay=0&rel=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    )
  }

  if (type === 'vimeo') {
    return (
      <iframe
        className="cp-video-iframe"
        src={`https://player.vimeo.com/video/${id}`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo video"
      />
    )
  }

  // Direct video with HTML5 player
  return (
    <video
      ref={videoRef}
      className="cp-video-direct"
      src={id}
      controls
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
    />
  )
}

// Course data (shared with CourseDetailPage)
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
    modules: [
      {
        name: 'Módulo 1 — Fundamentos',
        lessons: [
          { id: 'l1', title: 'Introdução à Segurança', duration: '12 min', status: 'done', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Nesta aula, você aprenderá os conceitos fundamentais de segurança da informação, incluindo confidencialidade, integridade e disponibilidade.' },
          { id: 'l2', title: 'Ameaças e Vulnerabilidades', duration: '18 min', status: 'done', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Explore os diferentes tipos de ameaças cibernéticas e como identificar vulnerabilidades em sistemas.' },
          { id: 'l3', title: 'Criptografia Básica', duration: '22 min', status: 'done', videoUrl: 'https://vimeo.com/123456789', description: 'Introdução aos princípios de criptografia simétrica e assimétrica.' },
        ],
      },
      {
        name: 'Módulo 2 — Aplicações Práticas',
        lessons: [
          { id: 'l4', title: 'Criptografia Avançada', duration: '25 min', status: 'done', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Aprofunde-se em algoritmos de criptografia modernos e suas aplicações práticas.' },
          { id: 'l5', title: 'Gestão de Incidentes', duration: '20 min', status: 'done', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Aprenda a identificar, responder e documentar incidentes de segurança.' },
          { id: 'l6', title: 'Análise de Riscos', duration: '28 min', status: 'done', videoUrl: null, description: 'Metodologias para avaliação e mitigação de riscos em ambientes corporativos.' },
          { id: 'l7', title: 'Normas ISO 27001', duration: '30 min', status: 'done', videoUrl: null, description: 'Conheça os requisitos e implementação da norma ISO 27001.' },
        ],
      },
      {
        name: 'Módulo 3 — Certificação',
        lessons: [{ id: 'l8', title: 'Certificação Final', duration: '35 min', status: 'available', videoUrl: null, description: 'Prepare-se para a certificação final do curso com uma revisão completa.' }],
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
    modules: [
      {
        name: 'Módulo 1 — Fundamentos',
        lessons: [
          { id: 'l1', title: 'O que é LGPD', duration: '15 min', status: 'done', description: 'Introdução à Lei Geral de Proteção de Dados e seus objetivos.' },
          { id: 'l2', title: 'Princípios da Lei', duration: '20 min', status: 'done', description: 'Os 10 princípios que regem o tratamento de dados pessoais.' },
        ],
      },
      {
        name: 'Módulo 2 — Implementação',
        lessons: [
          { id: 'l3', title: 'Mapeamento de Dados', duration: '25 min', status: 'done', description: 'Como realizar o mapeamento de dados pessoais na organização.' },
          { id: 'l4', title: 'DPO e Responsabilidades', duration: '22 min', status: 'done', description: 'O papel do Data Protection Officer e suas responsabilidades.' },
          { id: 'l5', title: 'Políticas de Privacidade', duration: '28 min', status: 'available', description: 'Criação e implementação de políticas de privacidade eficazes.' },
          { id: 'l6', title: 'Avaliação Final', duration: '30 min', status: 'locked', description: 'Avaliação final do módulo de LGPD.' },
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
    modules: [
      {
        name: 'Módulo 1 — Clean Code',
        lessons: [
          { id: 'l1', title: 'Fundamentos Clean Code', duration: '18 min', status: 'done', description: 'Princípios fundamentais de código limpo e legível.' },
          { id: 'l2', title: 'Naming Conventions', duration: '15 min', status: 'done', description: 'Boas práticas de nomenclatura em código.' },
          { id: 'l3', title: 'Refactoring', duration: '22 min', status: 'done', description: 'Técnicas de refatoração para melhorar a qualidade do código.' },
        ],
      },
      {
        name: 'Módulo 2 — Padrões',
        lessons: [
          { id: 'l4', title: 'Design Patterns', duration: '30 min', status: 'done', description: 'Os principais padrões de projeto utilizados no desenvolvimento.' },
          { id: 'l5', title: 'Code Review', duration: '20 min', status: 'done', description: 'Como conduzir revisões de código eficientes.' },
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
    modules: [
      {
        name: 'Módulo 1 — Comunicação',
        lessons: [
          { id: 'l1', title: 'Comunicação Efetiva', duration: '20 min', status: 'done', description: 'Técnicas para comunicação clara e eficiente.' },
          { id: 'l2', title: 'Comunicação Não-Violenta', duration: '25 min', status: 'available', description: 'Princípios da comunicação não-violenta no ambiente de trabalho.' },
          { id: 'l3', title: 'Feedback Construtivo', duration: '22 min', status: 'locked', description: 'Como dar e receber feedback de forma construtiva.' },
        ],
      },
      {
        name: 'Módulo 2 — Liderança',
        lessons: [
          { id: 'l4', title: 'Estilos de Liderança', duration: '28 min', status: 'locked', description: 'Os diferentes estilos de liderança e quando aplicá-los.' },
          { id: 'l5', title: 'Gestão de Equipes', duration: '30 min', status: 'locked', description: 'Técnicas para gestão eficiente de equipes.' },
          { id: 'l6', title: 'Delegação', duration: '18 min', status: 'locked', description: 'A arte de delegar tarefas de forma eficaz.' },
          { id: 'l7', title: 'Avaliação Final', duration: '35 min', status: 'locked', description: 'Avaliação final do curso de soft skills.' },
        ],
      },
    ],
  },
}

export default function CoursePlayerPage({ user, onNavigate, onLogout, ctx }) {
  const courseId = ctx?.courseId || 'seguranca-info'
  const lessonId = ctx?.lessonId || 'l1'
  const course = COURSES_DATA[courseId] || COURSES_DATA['seguranca-info']

  // Find current lesson and its index
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId)
  const currentLesson = allLessons[currentLessonIndex] || allLessons[0]
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState('0:00')
  const [volume, setVolume] = useState(80)
  const [activeTab, setActiveTab] = useState('descricao')
  const [toast, setToast] = useState(null)
  const progressInterval = useRef(null)
  const toastTimer = useRef(null)

  // Simulated video duration in seconds
  const videoDuration = parseInt(currentLesson.duration) * 60

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const showToast = (msg, color = course.color) => {
    clearTimeout(toastTimer.current)
    setToast({ msg, color })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      clearInterval(progressInterval.current)
    } else {
      progressInterval.current = setInterval(() => {
        setProgress((p) => {
          const newProgress = Math.min(p + 0.5, 100)
          setCurrentTime(formatTime((newProgress / 100) * videoDuration))
          if (newProgress >= 100) {
            clearInterval(progressInterval.current)
            setIsPlaying(false)
          }
          return newProgress
        })
      }, 100)
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newProgress = (x / rect.width) * 100
    setProgress(Math.max(0, Math.min(100, newProgress)))
    setCurrentTime(formatTime((newProgress / 100) * videoDuration))
  }

  const handleMarkComplete = () => {
    showToast(`Aula "${currentLesson.title}" marcada como concluída!`)
    setProgress(100)
    setCurrentTime(formatTime(videoDuration))
  }

  useEffect(() => {
    return () => {
      clearInterval(progressInterval.current)
      clearTimeout(toastTimer.current)
    }
  }, [])

  // Reset progress when lesson changes
  useEffect(() => {
    setProgress(currentLesson.status === 'done' ? 100 : 0)
    setCurrentTime(currentLesson.status === 'done' ? formatTime(videoDuration) : '0:00')
    setIsPlaying(false)
    clearInterval(progressInterval.current)
  }, [lessonId, currentLesson.status, videoDuration])

  return (
    <div className="cp-root" style={{ '--cc': course.color, '--cg': course.glow }}>
      {/* Toast */}
      {toast && (
        <div
          className="cp-toast"
          style={{
            borderLeftColor: toast.color,
            borderColor: `${toast.color}40`,
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Top Nav */}
      <nav className="cp-nav">
        <div className="cp-nav-inner">
          <div className="cp-nav-left">
            <button className="cp-back-btn" onClick={() => onNavigate('course-detail', { courseId: course.id })}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {course.name}
            </button>
          </div>
          <div className="cp-nav-center">
            <span className="cp-nav-lesson">{currentLesson.title}</span>
          </div>
          <div className="cp-nav-right">
            <span className="cp-nav-progress">
              {currentLessonIndex + 1}/{allLessons.length}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="cp-main">
        {/* Video Area */}
        <div className="cp-video-col">
          {/* Video Player */}
          <div 
            className="cp-player"
            style={currentLesson.videoUrl ? { 
              border: `1px solid ${course.color}40`,
              boxShadow: `0 0 40px ${course.color}15`
            } : {}}
          >
            <div className="cp-video-area">
              <VideoPlayer 
                videoUrl={currentLesson.videoUrl} 
                color={course.color}
              />
            </div>
          </div>

          {/* Lesson Info */}
          <div className="cp-lesson-info">
            <h1 className="cp-lesson-title">{currentLesson.title}</h1>
            <p className="cp-lesson-desc">{currentLesson.description}</p>

            {/* Action Buttons */}
            <div className="cp-actions">
              <button
                className="cp-action-btn primary"
                style={{ background: course.color }}
                onClick={handleMarkComplete}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Marcar como concluída
              </button>

              <div className="cp-nav-btns">
                <button
                  className="cp-action-btn secondary"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && onNavigate('course-player', { courseId: course.id, lessonId: prevLesson.id })}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Aula anterior
                </button>
                <button
                  className="cp-action-btn secondary"
                  disabled={!nextLesson || nextLesson.status === 'locked'}
                  onClick={() => nextLesson && nextLesson.status !== 'locked' && onNavigate('course-player', { courseId: course.id, lessonId: nextLesson.id })}
                >
                  Próxima aula
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="cp-tabs">
              <div className="cp-tabs-header">
                {[
                  ['descricao', 'Descrição'],
                  ['recursos', 'Recursos'],
                  ['discussao', 'Discussão'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={`cp-tab-btn ${activeTab === id ? 'active' : ''}`}
                    onClick={() => setActiveTab(id)}
                    style={activeTab === id ? { color: course.color, borderBottomColor: course.color } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="cp-tab-content">
                {activeTab === 'descricao' && (
                  <div className="cp-tab-text">
                    <p>{currentLesson.description}</p>
                    <p style={{ marginTop: '1rem' }}>
                      Esta aula faz parte do curso {course.name}, oferecido pela {course.institution}.
                      Ao completar todas as aulas, você receberá um certificado de conclusão.
                    </p>
                  </div>
                )}
                {activeTab === 'recursos' && (
                  <div className="cp-tab-text">
                    <div className="cp-resource-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 2h8l2 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      <span>Material complementar (PDF)</span>
                    </div>
                    <div className="cp-resource-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M8 5v3l2 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      <span>Exercícios práticos</span>
                    </div>
                  </div>
                )}
                {activeTab === 'discussao' && (
                  <div className="cp-tab-text">
                    <p style={{ color: 'var(--text-muted)' }}>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Lesson List */}
        <div className="cp-sidebar">
          <div className="cp-sidebar-header">
            <h3>Conteúdo do curso</h3>
          </div>
          <div className="cp-sidebar-content">
            {course.modules.map((mod) => (
              <div key={mod.name} className="cp-sidebar-module">
                <div className="cp-sidebar-module-name">{mod.name}</div>
                <div className="cp-sidebar-lessons">
                  {mod.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      className={`cp-sidebar-lesson ${lesson.id === lessonId ? 'active' : ''} ${lesson.status}`}
                      disabled={lesson.status === 'locked'}
                      onClick={() =>
                        lesson.status !== 'locked' &&
                        onNavigate('course-player', { courseId: course.id, lessonId: lesson.id })
                      }
                      style={lesson.id === lessonId ? { background: `${course.color}15`, borderLeftColor: course.color } : {}}
                    >
                      <div className="cp-sidebar-lesson-icon">
                        {lesson.status === 'locked' ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="3" y="5" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1"/>
                            <path d="M4.5 5V3.5a1.5 1.5 0 013 0V5" stroke="currentColor" strokeWidth="1"/>
                          </svg>
                        ) : lesson.status === 'done' ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-6" stroke={course.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : lesson.videoUrl ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M4 2l6 4-6 4V2z" fill={course.color}/>
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1"/>
                          </svg>
                        )}
                      </div>
                      <div className="cp-sidebar-lesson-info">
                        <span className="cp-sidebar-lesson-title">{lesson.title}</span>
                        <span className="cp-sidebar-lesson-duration">{lesson.duration}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
