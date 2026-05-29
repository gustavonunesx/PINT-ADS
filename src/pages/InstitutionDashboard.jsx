import { useState, useRef, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { courses as coursesApi, institution as institutionApi } from '../api/client'

// ── Constants ──────────────────────────────────────────────────────────────
const MOCK_INSTITUTION = { name: 'Universidade Nova', xp: 0, level: 1, streak: 0 }

const PALETTE = [
  { color: '#3be8b0' }, { color: '#63c8ff' }, { color: '#a78bfa' },
  { color: '#fbbf24' }, { color: '#f87171' }, { color: '#34d399' },
]

function toPalette(id) {
  const n = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTE[n % PALETTE.length]
}

function normalizeCourse(c) {
  return {
    ...c,
    color:        c.color        || toPalette(c.id).color,
    students:     c.students     ?? c.enrolledCount ?? 0,
    lessons:      c.lessons      ?? c.lessonsCount  ?? 0,
    published:    c.published    ?? false,
    lessons_data: (c.lessons_data ?? c.lessons_list ?? []).map(l => ({ ...l, published: true })),
    accessCode:   c.accessCode   ?? null,
    description:  c.description  ?? '',
    category:     c.category     ?? '',
    difficulty:   c.difficulty   ?? '',
    thumbnailUrl: c.thumbnailUrl ?? c.thumbnail_url ?? null,
  }
}

const COLORS = ['#3be8b0', '#63c8ff', '#a78bfa', '#fbbf24', '#f87171', '#34d399', '#fb923c', '#e879f9']

// ── Sub-components ─────────────────────────────────────────────────────────

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function BannerDrop({ value, onChange, color }) {
  const ref = useRef()
  const [drag, setDrag] = useState(false)

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const b64 = await fileToBase64(file)
    onChange(b64)
  }

  return (
    <div
      className={`banner-upload ${drag ? 'drag-over' : ''}`}
      style={{
        background: value ? 'transparent' : `${color}08`,
        borderColor: drag ? color : undefined,
        cursor: 'pointer',
        position: 'relative',
      }}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => ref.current.click()}
    >
      {value ? (
        <>
          <img src={value} alt="banner" className="banner-preview" />
          <button
            className="banner-remove-btn"
            onClick={e => { e.stopPropagation(); onChange('') }}
            title="Remover banner"
          >✕</button>
        </>
      ) : (
        <div className="banner-placeholder">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color, opacity: 0.6 }}>
            <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="11" cy="13" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 22l8-6 6 5 4-3 10 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <span style={{ color }}>Clique ou arraste o banner aqui</span>
          <span className="banner-hint">PNG, JPG · Recomendado 1280×360px</span>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])} />
    </div>
  )
}

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

function VideoPreview({ url, color }) {
  const [debouncedUrl, setDebouncedUrl] = useState(url)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUrl(url), 400)
    return () => clearTimeout(timer)
  }, [url])

  const { type, id } = parseVideoUrl(debouncedUrl)

  if (!debouncedUrl || !type) {
    return (
      <div className="video-preview-empty">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.4 }}>
          <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M13 11l8 5-8 5V11z" fill="currentColor"/>
        </svg>
        <span>Nenhum video adicionado</span>
      </div>
    )
  }

  if (type === 'youtube') {
    return (
      <div className="video-preview" style={{ borderColor: `${color}40`, boxShadow: `0 0 24px ${color}15` }}>
        <iframe
          src={`https://www.youtube.com/embed/${id}?rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    )
  }

  if (type === 'vimeo') {
    return (
      <div className="video-preview" style={{ borderColor: `${color}40`, boxShadow: `0 0 24px ${color}15` }}>
        <iframe
          src={`https://player.vimeo.com/video/${id}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo video"
        />
      </div>
    )
  }

  // Direct video
  return (
    <div className="video-preview" style={{ borderColor: `${color}40`, boxShadow: `0 0 24px ${color}15` }}>
      <video src={id} controls />
    </div>
  )
}

function CoverDrop({ url, onUpload, small }) {
  const ref = useRef()
  const [drag, setDrag] = useState(false)

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const b64 = await fileToBase64(file)
    onUpload(b64)
  }

  if (small) {
    return (
      <div
        className={`cover-upload cover-upload--sm ${drag ? 'drag-over' : ''}`}
        style={{ cursor: 'pointer', position: 'relative' }}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); e.stopPropagation(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={e => { e.stopPropagation(); ref.current.click() }}
      >
        {url
          ? <img src={url} alt="capa" className="cover-preview" />
          : <div className="cover-placeholder">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="1" y="3" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1 14l5-4 4 3 3-2 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </div>
        }
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])} />
      </div>
    )
  }

  return (
    <div
      className={`cover-drop-large ${drag ? 'drag-over' : ''}`}
      style={{ cursor: 'pointer', position: 'relative' }}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
      onClick={() => ref.current.click()}
    >
      {url ? (
        <>
          <img src={url} alt="capa" className="cover-drop-preview" />
          <button
            className="banner-remove-btn"
            onClick={e => { e.stopPropagation(); onUpload(null) }}
            title="Remover capa"
          >✕</button>
        </>
      ) : (
        <div className="cover-drop-placeholder">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ opacity: 0.5 }}>
            <rect x="1" y="4" width="26" height="20" rx="3" stroke="currentColor" strokeWidth="1.4"/>
            <circle cx="9" cy="11" r="3" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M1 20l7-6 6 5 4-3 9 7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
          <span>Clique ou arraste a capa aqui</span>
          <span style={{ fontSize: '0.72rem', opacity: 0.5 }}>PNG, JPG</span>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])} />
    </div>
  )
}

const DIFFICULTY_OPTIONS = ['Iniciante', 'Intermédio', 'Avançado']

function CreateCourseModal({ onClose, onCreate, initialData }) {
  const isEdit = !!initialData
  const [name, setName]               = useState(initialData?.name        ?? '')
  const [institution, setInst]        = useState(initialData?.institution ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [category, setCategory]       = useState(initialData?.category    ?? '')
  const [difficulty, setDifficulty]   = useState(initialData?.difficulty  ?? '')
  const [xpReward, setXpReward]       = useState(initialData?.xpReward != null ? String(initialData.xpReward) : '')
  const [thumbnailUrl, setThumbnail]  = useState(initialData?.thumbnailUrl ?? '')
  const [color, setColor]             = useState(initialData?.color ?? COLORS[0])
  const [errors, setErrors]           = useState({})

  const submit = () => {
    const e = {}
    if (!name.trim())        e.name = 'Informe o nome do curso'
    if (!institution.trim()) e.inst = 'Informe o nome da instituição'
    if (Object.keys(e).length) { setErrors(e); return }
    const xp = xpReward !== '' ? Number(xpReward) : undefined
    onCreate({ name, institution, description, category, difficulty, xpReward: xp, thumbnailUrl: thumbnailUrl || null, color })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Editar Curso' : 'Novo Curso'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className={`form-group ${errors.inst ? 'has-error' : ''}`}>
            <label className="form-label">Nome da instituição</label>
            <input className="form-input" type="text" placeholder="Ex: Universidade Nova"
              value={institution} onChange={e => { setInst(e.target.value); setErrors(er => ({ ...er, inst: '' })) }} />
            {errors.inst && <span className="form-error">{errors.inst}</span>}
          </div>

          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label className="form-label">Nome do curso</label>
            <input className="form-input" type="text" placeholder="Ex: Segurança da Informação"
              value={name} onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: '' })) }} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Descrição <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></label>
            <textarea className="form-input" rows={3} placeholder="Descreva o conteúdo e objetivos do curso..."
              value={description} onChange={e => setDescription(e.target.value)}
              style={{ resize: 'vertical', minHeight: '72px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Categoria <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></label>
              <input className="form-input" type="text" placeholder="Ex: Tecnologia"
                value={category} onChange={e => setCategory(e.target.value)} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Dificuldade <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></label>
              <select className="form-input" value={difficulty} onChange={e => setDifficulty(e.target.value)}
                style={{ cursor: 'pointer' }}>
                <option value="">Selecionar...</option>
                {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">XP do curso <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></label>
              <input className="form-input" type="number" min="0" placeholder="Ex: 500"
                value={xpReward} onChange={e => setXpReward(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cor do curso</label>
            <div className="color-picker-row">
              {COLORS.map(c => (
                <button key={c} className={`color-swatch ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)} />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Banner do curso <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></label>
            <BannerDrop value={thumbnailUrl} onChange={setThumbnail} color={color} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={submit}>{isEdit ? 'Guardar alterações' : 'Criar curso'}</button>
        </div>
      </div>
    </div>
  )
}

async function fetchVideoDuration(url) {
  if (!url) return null

  // Vimeo — oEmbed (sem chave de API)
  if (/vimeo\.com\/\d+/.test(url)) {
    try {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.duration) return `${Math.ceil(data.duration / 60)} min`
      }
    } catch {}
    return null
  }

  // URL direta de vídeo (.mp4, .webm, etc.)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        const mins = Math.ceil(video.duration / 60)
        video.src = ''
        resolve(`${mins} min`)
      }
      video.onerror = () => resolve(null)
      video.src = url
    })
  }

  return null
}

function LessonEditor({ course, onClose, onSave }) {
  const [lessons, setLessons] = useState(course.lessons_data || [])
  const [editing, setEditing]  = useState(null)
  const [fetchingDuration, setFetchingDuration] = useState(null)
  const originalLessons = useRef(course.lessons_data || [])

  const addLesson = () => {
    const newL = {
      id: `l${Date.now()}`,
      title: `Aula ${lessons.length + 1}`,
      thumbnailUrl: null,
      duration: '10 min',
      videoUrl: null,
      published: true,
    }
    setLessons(ls => [...ls, newL])
    setEditing(newL.id)
  }

  const updateLesson = (id, field, val) => {
    setLessons(ls => ls.map(l => l.id === id ? { ...l, [field]: val } : l))
  }

  const removeLesson = (id) => {
    setLessons(ls => ls.filter(l => l.id !== id))
    if (editing === id) setEditing(null)
  }

  const togglePublish = (id) => {
    setLessons(ls => ls.map(l => l.id === id ? { ...l, published: !l.published } : l))
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel modal-panel--wide">
        <div className="modal-header" style={{ borderColor: `${course.color}30` }}>
          <div>
            <div className="modal-eyebrow" style={{ color: course.color }}>Editando aulas</div>
            <h2 className="modal-title">{course.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="lesson-editor-body">
          {/* Lesson list */}
          <div className="lesson-editor-list">
            <div className="lesson-editor-list-hd">
              <span>Aulas ({lessons.length})</span>
              <button className="btn-add-lesson" onClick={addLesson}
                style={{ color: course.color, borderColor: `${course.color}30`, background: `${course.color}0a` }}>
                + Nova aula
              </button>
            </div>

            {lessons.length === 0 && (
              <div className="lesson-empty">
                <span>📭</span>
                <p>Nenhuma aula ainda.<br />Clique em "+ Nova aula" para começar.</p>
              </div>
            )}

            {lessons.map((lesson, idx) => (
              <div key={lesson.id}
                className={`lesson-item ${editing === lesson.id ? 'active' : ''}`}
                style={{ '--course-color': course.color }}
                onClick={() => setEditing(lesson.id)}>
                <div className="lesson-item-num"
                  style={{ background: `${course.color}18`, color: course.color }}>
                  {lesson.videoUrl ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 1l7 4-7 4V1z" fill="currentColor"/>
                    </svg>
                  ) : idx + 1}
                </div>
                <CoverDrop url={lesson.thumbnailUrl} small
                  onUpload={url => updateLesson(lesson.id, 'thumbnailUrl', url)} />
                <div className="lesson-item-info">
                  <div className="lesson-item-title">{lesson.title}</div>
                  <div className="lesson-item-meta">
                    <span>{lesson.duration}</span>
                    <span className={`lesson-status ${lesson.published ? 'pub' : 'draft'}`}>
                      {lesson.published ? '● Publicado' : '○ Rascunho'}
                    </span>
                  </div>
                </div>
                <div className="lesson-item-actions">
                  <button className="lesson-del-btn"
                    onClick={e => { e.stopPropagation(); removeLesson(lesson.id) }}
                    title="Remover aula">✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Right: detail editor */}
          <div className="lesson-detail-panel">
            {editing ? (() => {
              const lesson = lessons.find(l => l.id === editing)
              if (!lesson) return null
              const idx = lessons.findIndex(l => l.id === editing)
              return (
                <div className="lesson-detail">
                  <div className="lesson-detail-hd">
                    <span style={{ color: course.color, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Aula {idx + 1}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Título da aula</label>
                    <input className="form-input" type="text"
                      value={lesson.title}
                      onChange={e => updateLesson(lesson.id, 'title', e.target.value)}
                      placeholder="Ex: Introdução ao tema..." />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Duração estimada
                      {fetchingDuration === lesson.id && (
                        <span style={{ marginLeft: 8, fontSize: '0.72rem', opacity: 0.6 }}>Detectando...</span>
                      )}
                    </label>
                    <input className="form-input" type="text"
                      value={lesson.duration}
                      disabled={fetchingDuration === lesson.id}
                      onChange={e => updateLesson(lesson.id, 'duration', e.target.value)}
                      placeholder="Ex: 15 min" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Video da aula</label>
                    <div className="video-input-wrap">
                      <svg className="video-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 8h4M8 6v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        <path d="M3 9V7a4 4 0 018 0v2M5 9a2 2 0 004 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      <input className="form-input video-input" type="text"
                        value={lesson.videoUrl || ''}
                        onChange={e => updateLesson(lesson.id, 'videoUrl', e.target.value || null)}
                        onBlur={async (e) => {
                          const url = e.target.value
                          if (!url) return
                          setFetchingDuration(lesson.id)
                          const dur = await fetchVideoDuration(url)
                          setFetchingDuration(null)
                          if (dur) updateLesson(lesson.id, 'duration', dur)
                        }}
                        placeholder="Cole o link do YouTube, Vimeo ou outro..." />
                    </div>
                    <VideoPreview url={lesson.videoUrl} color={course.color} />
                    <span className="video-helper">Suporta YouTube, Vimeo e links diretos de video (.mp4)</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Capa da aula <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></label>
                    <CoverDrop
                      url={lesson.thumbnailUrl}
                      onUpload={url => updateLesson(lesson.id, 'thumbnailUrl', url)}
                    />
                  </div>

                </div>
              )
            })() : (
              <div className="lesson-detail-empty">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: course.color, opacity: 0.3 }}>
                  <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M16 16l8 4-8 4V16z" fill="currentColor"/>
                </svg>
                <p>Selecione uma aula para editar</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => { onSave(course.id, lessons, originalLessons.current); onClose() }}>
            Salvar aulas
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function InstitutionDashboard({ user, onNavigate, onLogout }) {
  const u = user ? { ...MOCK_INSTITUTION, name: user.company || user.name, type: user.type } : MOCK_INSTITUTION
  const [courses, setCourses]         = useState([])
  const [showCreate, setShowCreate]   = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [editingLessons, setEditing]  = useState(null)
  const [deletingId,   setDeletingId] = useState(null)
  const [refreshing,   setRefreshing] = useState(false)
  const [activeTab, setActiveTab]     = useState('courses') // 'courses' | 'stats'
  const [copiedId, setCopiedId]       = useState(null)
  const [globalStats, setGlobalStats] = useState(null)
  const [courseStatsMap, setCourseStatsMap] = useState({}) // courseId → CourseStatsDto
  const [statsLoading, setStatsLoading]     = useState(false)

  useEffect(() => {
    coursesApi.list()
      .then(data => { if (Array.isArray(data)) setCourses(data.map(normalizeCourse)) })
      .catch(() => {})
    institutionApi.stats()
      .then(s => setGlobalStats(s))
      .catch(() => {})
  }, [])

  // Lazy-load per-course stats when the stats tab opens
  useEffect(() => {
    if (activeTab !== 'stats' || courses.length === 0) return
    const missing = courses.filter(c => !courseStatsMap[c.id])
    if (missing.length === 0) return
    setStatsLoading(true)
    Promise.allSettled(
      missing.map(c => institutionApi.courseStats(c.id).then(s => [c.id, s]))
    ).then(results => {
      const map = {}
      results.forEach(r => { if (r.status === 'fulfilled') { const [id, s] = r.value; map[id] = s } })
      setCourseStatsMap(prev => ({ ...prev, ...map }))
      setStatsLoading(false)
    })
  }, [activeTab, courses])

  const totalStudents  = courses.reduce((s, c) => s + (c.students || 0), 0)
  const totalLessons   = courses.reduce((s, c) => s + (c.lessons_data?.length || 0), 0)
  const publishedCount = courses.filter(c => c.published).length

  const refreshCourses = async () => {
    setRefreshing(true)
    try {
      const fresh = await coursesApi.list()
      if (Array.isArray(fresh)) setCourses(fresh.map(normalizeCourse))
    } catch {}
    setRefreshing(false)
  }

  const deleteCourse = async (id) => {
    try {
      await coursesApi.delete(id)
      setCourses(cs => cs.filter(c => c.id !== id))
    } catch {}
    setDeletingId(null)
  }

  const buildPayload = (data) => ({
    name:         data.name,
    institution:  data.institution,
    color:        data.color,
    description:  data.description  || null,
    category:     data.category     || null,
    difficulty:   data.difficulty   || null,
    xpReward:     data.xpReward != null ? Number(data.xpReward) : 0,
    thumbnailUrl: data.thumbnailUrl || null,
  })

  const addCourse = async (data) => {
    try {
      await coursesApi.create(buildPayload(data))
      const fresh = await coursesApi.list()
      if (Array.isArray(fresh)) setCourses(fresh.map(normalizeCourse))
    } catch (e) {}
  }

  const updateCourse = async (data) => {
    if (!editingCourse) return
    const payload = buildPayload(data)
    // Optimistic update so the banner appears immediately
    setCourses(cs => cs.map(c => c.id === editingCourse.id ? normalizeCourse({ ...c, ...payload }) : c))
    setEditingCourse(null)
    try {
      await coursesApi.update(editingCourse.id, payload)
      const fresh = await coursesApi.list()
      if (Array.isArray(fresh)) setCourses(fresh.map(normalizeCourse))
    } catch (e) {}
  }

  const copyCode = (course) => {
    navigator.clipboard.writeText(course.accessCode).then(() => {
      setCopiedId(course.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const togglePublish = (id) => setCourses(cs => cs.map(c => c.id === id ? { ...c, published: !c.published } : c))
  const saveLessons = async (courseId, lessons, originalLessons = []) => {
    const isTemp = (id) => String(id).startsWith('l')

    const newLessons      = lessons.filter(l => isTemp(l.id))
    const existingLessons = lessons.filter(l => !isTemp(l.id))
    const keptIds         = new Set(existingLessons.map(l => String(l.id)))
    const removedLessons  = originalLessons.filter(l => !isTemp(l.id) && !keptIds.has(String(l.id)))

    const lessonPayload = (l) => ({
      title:        l.title,
      duration:     l.duration,
      videoUrl:     l.videoUrl,
      thumbnailUrl: l.thumbnailUrl || null,
      published:    l.published,
    })

    for (const lesson of newLessons) {
      try { await coursesApi.addLesson(courseId, lessonPayload(lesson)) } catch {}
    }
    for (const lesson of existingLessons) {
      try { await coursesApi.updateLesson(courseId, lesson.id, lessonPayload(lesson)) } catch {}
    }
    for (const lesson of removedLessons) {
      try { await coursesApi.deleteLesson(courseId, lesson.id) } catch {}
    }

    try {
      const fresh = await coursesApi.list()
      if (Array.isArray(fresh)) setCourses(fresh.map(normalizeCourse))
    } catch {
      setCourses(cs => cs.map(c => c.id === courseId
        ? { ...c, lessons_data: lessons, lessons: lessons.length }
        : c))
    }
  }

  return (
    <AppShell user={u} onNavigate={onNavigate} onLogout={onLogout} activePage="dashboard">

      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Painel da Instituição</p>
          <h1 className="page-title">{u.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            className="btn-ghost"
            onClick={refreshCourses}
            disabled={refreshing}
            title="Recarregar cursos"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
              style={{ transition: 'transform 0.6s', transform: refreshing ? 'rotate(360deg)' : 'none' }}>
              <path d="M13 7.5A5.5 5.5 0 112.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2.5 2v2.5H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {refreshing ? 'A carregar...' : 'Atualizar'}
          </button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + Novo Curso
          </button>
        </div>
      </div>

      {/* Top metrics */}
      <div className="inst-metrics">
        {[
          { label: 'Cursos publicados',  value: publishedCount,                                                             sub: `${courses.length} no total`,    color: '#3be8b0', icon: '◈' },
          { label: 'Alunos inscritos',   value: globalStats?.totalStudents       ?? totalStudents,                          sub: 'nos cursos desta instituição',   color: '#63c8ff', icon: '⬡' },
          { label: 'Aulas concluídas',   value: globalStats?.totalLessonsCompleted != null ? globalStats.totalLessonsCompleted.toLocaleString('pt-BR') : totalLessons, sub: 'por todos os alunos', color: '#a78bfa', icon: '▶' },
          { label: 'XP distribuído',     value: globalStats?.totalXpDistributed  != null ? globalStats.totalXpDistributed.toLocaleString('pt-BR')  : '—',          sub: 'acumulado pelos alunos',        color: '#fbbf24', icon: '◉' },
        ].map(m => (
          <div className="qm-card" key={m.label}>
            <div className="qm-icon" style={{ color: m.color }}>{m.icon}</div>
            <div className="qm-value" style={{ color: m.color }}>{m.value}</div>
            <div className="qm-label">{m.label}</div>
            <div className="qm-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="lb-tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`lb-tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Meus Cursos</button>
        <button className={`lb-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Estatísticas</button>
      </div>

      {activeTab === 'courses' && (
        <div className="inst-courses-grid">
          {courses.map(course => (
            <div className="inst-course-card" key={course.id}
              style={{ '--course-color': course.color, '--course-glow': `${course.color}18` }}>

              {/* Banner */}
              <div className="inst-course-banner"
                style={{ background: course.thumbnailUrl ? 'transparent' : `${course.color}12` }}>
                {course.thumbnailUrl
                  ? <img src={course.thumbnailUrl} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div className="inst-banner-placeholder" style={{ color: course.color }}>
                      <span style={{ fontSize: '2rem' }}>🎓</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>{course.institution}</span>
                    </div>}
                <div className="inst-course-badge" style={{ color: course.color, background: `${course.color}18`, borderColor: `${course.color}30` }}>
                  {'● Publicado'}
                </div>
              </div>

              {/* Info */}
              <div className="inst-course-info">
                <div className="inst-course-inst">{course.institution}</div>
                <div className="inst-course-name">{course.name}</div>
                <div className="inst-course-meta">
                  <span>📚 {course.lessons_data?.length || 0} aulas</span>
                  <span>👥 {course.students} alunos</span>
                </div>

                {/* Access code */}
                {course.accessCode && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                    <span style={{
                      fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700,
                      letterSpacing: '0.12em', color: course.color,
                      background: `${course.color}12`, border: `1px solid ${course.color}30`,
                      borderRadius: '6px', padding: '3px 8px',
                    }}>{course.accessCode}</span>
                    <button
                      onClick={() => copyCode(course)}
                      style={{
                        fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px',
                        border: `1px solid ${course.color}30`, background: `${course.color}0a`,
                        color: copiedId === course.id ? course.color : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'color 0.2s',
                      }}>
                      {copiedId === course.id ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}

                {/* Lesson previews */}
                {course.lessons_data && course.lessons_data.length > 0 && (
                  <div className="inst-lessons-preview">
                    {course.lessons_data.slice(0, 3).map((l, i) => (
                      <div className="inst-lesson-chip" key={l.id}>
                        <span className="inst-lesson-num" style={{ color: course.color }}>{i + 1}</span>
                        <span className="inst-lesson-title">{l.title}</span>
                        <span className={`lesson-status ${l.published ? 'pub' : 'draft'}`} style={{ fontSize: '0.65rem' }}>
                          {l.published ? '●' : '○'}
                        </span>
                      </div>
                    ))}
                    {course.lessons_data.length > 3 && (
                      <div className="inst-lesson-more">+{course.lessons_data.length - 3} aulas</div>
                    )}
                  </div>
                )}

                <div className="inst-course-actions">
                  <button className="inst-btn-lessons"
                    style={{ color: course.color, borderColor: `${course.color}30`, background: `${course.color}0a` }}
                    onClick={() => setEditingCourse(course)}>
                    ⚙️ Detalhes
                  </button>
                  <button className="inst-btn-lessons"
                    style={{ color: course.color, borderColor: `${course.color}30`, background: `${course.color}0a` }}
                    onClick={() => setEditing(course)}>
                    ✏️ Aulas
                  </button>
                  {deletingId === course.id ? (
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Excluir?</span>
                      <button
                        style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid #f8717140', background: '#f8717114', color: '#f87171', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        onClick={() => deleteCourse(course.id)}>
                        Sim
                      </button>
                      <button
                        style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer' }}
                        onClick={() => setDeletingId(null)}>
                        Não
                      </button>
                    </div>
                  ) : (
                    <button className="inst-btn-lessons"
                      style={{ color: '#f87171', borderColor: '#f8717130', background: 'transparent' }}
                      onClick={() => setDeletingId(course.id)}>
                      🗑 Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty add card */}
          <button className="inst-course-card inst-add-card" onClick={() => setShowCreate(true)}>
            <div className="inst-add-inner">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M16 10v12M10 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Criar novo curso</span>
            </div>
          </button>
        </div>
      )}

      {activeTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Per-course student progress */}
          <div className="inst-stat-card">
            <div className="inst-stat-title">Avanço dos alunos por curso</div>
            {statsLoading && courses.some(c => !courseStatsMap[c.id]) && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>A carregar dados…</div>
            )}
            {courses.map(c => {
              const cs = courseStatsMap[c.id]
              const pct = cs?.avgProgress ?? 0
              const completionRate = cs && cs.enrolledCount > 0
                ? Math.round((cs.completedCount / cs.enrolledCount) * 100)
                : 0
              return (
                <div key={c.id} className="inst-stat-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.82rem', color: c.color, fontWeight: 600 }}>{c.name}</span>
                    {cs ? (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {cs.enrolledCount} alunos · {cs.completedCount} concluíram ({completionRate}%)
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </div>
                  <div className="inst-stat-bar-wrap">
                    <div className="inst-stat-bar">
                      <div className="inst-stat-bar-fill" style={{ width: `${pct}%`, background: c.color }} />
                    </div>
                    <span style={{ color: c.color, fontSize: '0.78rem', minWidth: 40, textAlign: 'right' }}>
                      {cs ? `${pct}%` : '—'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Two-column: publication status + enrolled counts */}
          <div className="inst-stats-grid">
            <div className="inst-stat-card">
              <div className="inst-stat-title">Alunos inscritos por curso</div>
              {courses.map(c => {
                const cs = courseStatsMap[c.id]
                const maxEnrolled = Math.max(...courses.map(x => courseStatsMap[x.id]?.enrolledCount ?? x.students ?? 0), 1)
                const enrolled = cs?.enrolledCount ?? c.students ?? 0
                return (
                  <div key={c.id} className="inst-stat-row">
                    <div className="inst-stat-row-name">{c.name}</div>
                    <div className="inst-stat-bar-wrap">
                      <div className="inst-stat-bar">
                        <div className="inst-stat-bar-fill" style={{ width: `${Math.round((enrolled / maxEnrolled) * 100)}%`, background: c.color }} />
                      </div>
                      <span style={{ color: c.color, fontSize: '0.78rem', minWidth: 30, textAlign: 'right' }}>{enrolled}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="inst-stat-card">
              <div className="inst-stat-title">Status das aulas</div>
              {courses.map(c => {
                const pub   = c.lessons_data?.filter(l => l.published).length || 0
                const total = c.lessons_data?.length || 0
                return (
                  <div key={c.id} className="inst-stat-row">
                    <div className="inst-stat-row-name">{c.name}</div>
                    <div className="inst-stat-bar-wrap">
                      <div className="inst-stat-bar">
                        <div className="inst-stat-bar-fill" style={{ width: total ? `${(pub / total) * 100}%` : '0%', background: c.color }} />
                      </div>
                      <span style={{ color: c.color, fontSize: '0.78rem', minWidth: 50, textAlign: 'right' }}>{pub}/{total} pub.</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreate && <CreateCourseModal onClose={() => setShowCreate(false)} onCreate={addCourse} />}
      {editingCourse && (
        <CreateCourseModal
          onClose={() => setEditingCourse(null)}
          onCreate={updateCourse}
          initialData={editingCourse}
        />
      )}
      {editingLessons && (
        <LessonEditor
          course={editingLessons}
          onClose={() => setEditing(null)}
          onSave={saveLessons}
        />
      )}
    </AppShell>
  )
}
