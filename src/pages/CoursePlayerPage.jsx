import { useState, useEffect, useRef } from 'react'
import { activities, courses as coursesApi } from '../api/client'

// ── Helpers ────────────────────────────────────────────────────────────────

function parseVideoUrl(url) {
  if (!url) return { type: null, id: null }
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return { type: 'youtube', id: ytMatch[1] }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] }
  return { type: 'direct', id: url }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

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

function normalizeCourse(raw) {
  const p = toPalette(raw.id)
  const mapLesson = (l) => ({
    id:          String(l.id),
    title:       l.title       ?? 'Aula',
    duration:    l.duration    ?? '10 min',
    status:      l.status      ?? 'available',
    videoUrl:    l.videoUrl    ?? l.video_url ?? null,
    description: l.description ?? '',
  })
  const flatLessons = (raw.lessons || []).map(mapLesson)
  const flatById    = Object.fromEntries(flatLessons.map(l => [l.id, l]))
  const modules = raw.modules?.length
    ? raw.modules.map(m => ({
        name: m.name,
        lessons: (m.lessons || []).map(l => flatById[String(l.id)] ?? mapLesson(l)),
      }))
    : [{ name: 'Aulas do curso', lessons: flatLessons }]

  return {
    id:          raw.id,
    name:        raw.name        ?? '',
    institution: raw.institution ?? raw.institutionName ?? '',
    color:       raw.color       || p.color,
    glow:        raw.glow        || p.glow,
    badge:       raw.badge       || p.badge,
    modules,
  }
}

// ── Confetti ───────────────────────────────────────────────────────────────

function launchConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight

  const colors = ['#3be8b0','#63c8ff','#a78bfa','#fbbf24','#f87171','#34d399','#ffffff','#fb923c']
  const pieces = Array.from({ length: 140 }, () => {
    const angle = Math.PI + Math.random() * Math.PI
    const speed = Math.random() * 10 + 4
    return {
      x:     canvas.width  * (0.3 + Math.random() * 0.4),
      y:     canvas.height * 0.65,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      r:     Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.25,
      g:     0.25 + Math.random() * 0.15,
      rect:  Math.random() < 0.6,
    }
  })

  let frame = 0
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    frame++
    const fade = frame > 150 ? Math.max(0, 1 - (frame - 150) / 50) : 1
    pieces.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.rotV
      ctx.save()
      ctx.globalAlpha = fade
      ctx.fillStyle   = p.color
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      if (p.rect) ctx.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8)
      else { ctx.beginPath(); ctx.arc(0, 0, p.r * 0.55, 0, Math.PI * 2); ctx.fill() }
      ctx.restore()
    })
    if (frame < 200) requestAnimationFrame(tick)
    else canvas.remove()
  }
  requestAnimationFrame(tick)
}

// ── Video Player ───────────────────────────────────────────────────────────

function VideoPlayer({ videoUrl, color }) {
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

  return <video className="cp-video-direct" src={id} controls />
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CoursePlayerPage({ user, setUser, onNavigate, onLogout, ctx }) {
  const courseId = ctx?.courseId
  const lessonId = ctx?.lessonId

  // ── All hooks declared before any early return ──
  const [course,        setCourse]       = useState(null)
  const [loading,       setLoading]      = useState(true)
  const [isPlaying,     setIsPlaying]    = useState(false)
  const [progress,      setProgress]     = useState(0)
  const [currentTime,   setCurrentTime]  = useState('0:00')
  const [activeTab,     setActiveTab]    = useState('descricao')
  const [toast,         setToast]        = useState(null)
  const progressInterval = useRef(null)
  const toastTimer       = useRef(null)

  useEffect(() => {
    if (!courseId) { onNavigate('my-courses'); return }
    coursesApi.get(courseId)
      .then(data => { setCourse(normalizeCourse(data)); setLoading(false) })
      .catch(() => { setLoading(false); onNavigate('my-courses') })
  }, [courseId])

  // Derived values — safe when course is null
  const allLessons         = course ? course.modules.flatMap(m => m.lessons) : []
  const currentLessonIndex = allLessons.findIndex(l => l.id === String(lessonId))
  const currentLesson      = allLessons[currentLessonIndex] ?? allLessons[0] ?? null
  const prevLesson         = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null
  const nextLesson         = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null
  const videoDuration      = currentLesson ? parseInt(currentLesson.duration) * 60 : 0

  useEffect(() => {
    return () => {
      clearInterval(progressInterval.current)
      clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!currentLesson) return
    setProgress(currentLesson.status === 'done' ? 100 : 0)
    setCurrentTime(currentLesson.status === 'done' ? formatTime(videoDuration) : '0:00')
    setIsPlaying(false)
    clearInterval(progressInterval.current)
  }, [lessonId, currentLesson?.status, videoDuration])

  // ── Early returns after all hooks ──
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
        Carregando aula...
      </div>
    )
  }

  if (!course || !currentLesson) return null

  // ── Handlers ──
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
        setProgress(p => {
          const next = Math.min(p + 0.5, 100)
          setCurrentTime(formatTime((next / 100) * videoDuration))
          if (next >= 100) { clearInterval(progressInterval.current); setIsPlaying(false) }
          return next
        })
      }, 100)
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const next = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setProgress(next)
    setCurrentTime(formatTime((next / 100) * videoDuration))
  }

  const handleMarkComplete = async () => {
    if (currentLesson.status === 'done') return

    const courseWillComplete = allLessons.every(
      l => l.id === currentLesson.id || l.status === 'done'
    )

    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(mod => ({
        ...mod,
        lessons: mod.lessons.map(l =>
          l.id === currentLesson.id ? { ...l, status: 'done' } : l
        ),
      })),
    }))
    setProgress(100)
    setCurrentTime(formatTime(videoDuration))
    launchConfetti()

    if (courseWillComplete) {
      showToast(`Curso "${course.name}" concluído! 🎓`, '#fbbf24')
    } else {
      showToast(`Aula "${currentLesson.title}" concluída! 🎉`)
    }

    try {
      const res = await activities.completeLesson(currentLesson.id)
      if (res && setUser) {
        setUser(prev => ({
          ...prev,
          xp:    res.totalXp ?? prev.xp,
          level: res.level   ?? prev.level,
        }))
      }
    } catch (err) {
      console.error('completeLesson error:', err)
      showToast('Erro ao salvar progresso no servidor.', '#f87171')
    }

    if (courseWillComplete) {
      try {
        const res = await activities.completeCourse(course.id)
        if (res && setUser) {
          setUser(prev => ({
            ...prev,
            xp:    res.totalXp ?? prev.xp,
            level: res.level   ?? prev.level,
          }))
        }
      } catch (_) {}
    }
  }

  // ── Render ──
  return (
    <div className="cp-root" style={{ '--cc': course.color, '--cg': course.glow }}>
      {toast && (
        <div className="cp-toast" style={{ borderLeftColor: toast.color, borderColor: `${toast.color}40` }}>
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
            <span className="cp-nav-progress">{currentLessonIndex + 1}/{allLessons.length}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="cp-main">
        {/* Video Area */}
        <div className="cp-video-col">
          <div
            className="cp-player"
            style={currentLesson.videoUrl ? { border: `1px solid ${course.color}40`, boxShadow: `0 0 40px ${course.color}15` } : {}}
          >
            <div className="cp-video-area">
              <VideoPlayer videoUrl={currentLesson.videoUrl} color={course.color} />
            </div>
          </div>

          {/* Lesson Info */}
          <div className="cp-lesson-info">
            <h1 className="cp-lesson-title">{currentLesson.title}</h1>
            {currentLesson.description && (
              <p className="cp-lesson-desc">{currentLesson.description}</p>
            )}

            <div className="cp-actions">
              <button
                className={`cp-action-btn primary${currentLesson.status === 'done' ? ' done' : ''}`}
                style={{ background: currentLesson.status === 'done' ? '#22c55e' : course.color }}
                onClick={handleMarkComplete}
                disabled={currentLesson.status === 'done'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {currentLesson.status === 'done' ? 'Aula concluída' : 'Marcar como concluída'}
              </button>

              <div className="cp-nav-btns">
                <button className="cp-action-btn secondary" disabled={!prevLesson}
                  onClick={() => prevLesson && onNavigate('course-player', { courseId: course.id, lessonId: prevLesson.id })}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Aula anterior
                </button>
                <button className="cp-action-btn secondary" disabled={!nextLesson || nextLesson.status === 'locked'}
                  onClick={() => nextLesson && nextLesson.status !== 'locked' && onNavigate('course-player', { courseId: course.id, lessonId: nextLesson.id })}>
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
                {[['descricao', 'Descrição'], ['recursos', 'Recursos'], ['discussao', 'Discussão']].map(([id, label]) => (
                  <button key={id} className={`cp-tab-btn ${activeTab === id ? 'active' : ''}`}
                    onClick={() => setActiveTab(id)}
                    style={activeTab === id ? { color: course.color, borderBottomColor: course.color } : {}}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="cp-tab-content">
                {activeTab === 'descricao' && (
                  <div className="cp-tab-text">
                    <p>{currentLesson.description || 'Sem descrição disponível.'}</p>
                    {course.institution && (
                      <p style={{ marginTop: '1rem' }}>
                        Esta aula faz parte do curso {course.name}, oferecido pela {course.institution}.
                      </p>
                    )}
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
            {course.modules.map((mod, mi) => (
              <div key={mod.name ?? `module-${mi}`} className="cp-sidebar-module">
                <div className="cp-sidebar-module-name">{mod.name}</div>
                <div className="cp-sidebar-lessons">
                  {mod.lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      className={`cp-sidebar-lesson ${lesson.id === String(lessonId) ? 'active' : ''} ${lesson.status}`}
                      disabled={lesson.status === 'locked'}
                      onClick={() => lesson.status !== 'locked' && onNavigate('course-player', { courseId: course.id, lessonId: lesson.id })}
                      style={lesson.id === String(lessonId) ? { background: `${course.color}15`, borderLeftColor: course.color } : {}}
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
                      {lesson.status === 'done' && (
                        <div className="cp-sidebar-lesson-done">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" fill={course.color} fillOpacity="0.2" stroke={course.color} strokeWidth="1.2"/>
                            <path d="M5 8l2.5 2.5L11 5.5" stroke={course.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
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
