import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { trails as trailsApi } from '../api/client'

// ── Palette / helpers ──────────────────────────────────────────────────────

const PALETTE = [
  { color: '#3be8b0', glow: 'rgba(59,232,176,0.15)',  badge: '🛡️' },
  { color: '#63c8ff', glow: 'rgba(99,200,255,0.15)',  badge: '⚖️' },
  { color: '#a78bfa', glow: 'rgba(167,139,250,0.15)', badge: '💻' },
  { color: '#fbbf24', glow: 'rgba(251,191,36,0.15)',  badge: '🏛️' },
  { color: '#f87171', glow: 'rgba(248,113,113,0.15)', badge: '🌱' },
  { color: '#34d399', glow: 'rgba(52,211,153,0.15)',  badge: '🔥' },
]

const TYPE_META = {
  video:  { icon: '▶', label: 'Vídeo',  color: '#63c8ff' },
  quiz:   { icon: '⚡', label: 'Quiz',   color: '#fbbf24' },
  lesson: { icon: '◈', label: 'Lição',  color: '#3be8b0' },
  exam:   { icon: '★', label: 'Exame',  color: '#a78bfa' },
}

function toPalette(id) {
  const n = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTE[n % PALETTE.length]
}

function normalizeModule(m, i) {
  return {
    id:       m.id,
    title:    m.title    ?? m.name     ?? `Módulo ${i + 1}`,
    type:     m.type     ?? 'lesson',
    quiz:     m.quiz     ?? false,
    xp:       m.xp       ?? m.xpReward ?? 0,
    done:     m.done     ?? m.completed ?? false,
    locked:   m.locked   ?? false,
    duration: m.duration ?? '—',
  }
}

function normalizeTrail(t) {
  const p       = toPalette(t.id)
  const modules = (t.modules ?? t.trailModules ?? []).map(normalizeModule)
  const xpTotal  = t.xpTotal  ?? t.totalXp  ?? modules.reduce((s, m) => s + m.xp, 0)
  const xpEarned = t.xpEarned ?? t.earnedXp ?? modules.filter(m => m.done).reduce((s, m) => s + m.xp, 0)
  return {
    id:       t.id,
    title:    t.title ?? t.name ?? 'Trilha',
    desc:     t.description ?? t.desc ?? '',
    color:    t.color ?? p.color,
    glow:     t.glow  ?? p.glow,
    badge:    t.badge ?? p.badge,
    modules,
    xpTotal,
    xpEarned,
    progress: xpTotal > 0 ? Math.round((xpEarned / xpTotal) * 100) : 0,
    done:     t.completedModules ?? modules.filter(m => m.done).length,
    total:    t.totalModules     ?? modules.length,
  }
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TrailPage({ user, onNavigate, onLogout }) {
  const [trails,        setTrails]        = useState([])
  const [selected,      setSelected]      = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    trailsApi.list()
      .then(data => setTrails((Array.isArray(data) ? data : []).map(normalizeTrail)))
      .catch(() => setTrails([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = async (trail) => {
    setDetailLoading(true)
    try {
      const detail = await trailsApi.get(trail.id)
      setSelected(normalizeTrail(detail))
    } catch {
      setSelected(trail)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <AppShell user={user} onNavigate={onNavigate} onLogout={onLogout} activePage="trail">
      {!selected ? (
        <>
          <div className="page-header">
            <div>
              <p className="page-eyebrow">Jornada de aprendizado</p>
              <h1 className="page-title">Trilhas</h1>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
              Carregando trilhas...
            </div>
          ) : trails.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
              <div>Nenhuma trilha disponível no momento.</div>
            </div>
          ) : (
            <div className="trail-list">
              {trails.map(t => (
                <button
                  className="trail-row"
                  key={t.id}
                  style={{ '--trail-color': t.color, '--trail-glow': t.glow }}
                  onClick={() => handleSelect(t)}
                >
                  <div className="trail-row-badge">{t.badge}</div>
                  <div className="trail-row-info">
                    <div className="trail-row-title">{t.title}</div>
                    <div className="trail-row-desc">{t.desc}</div>
                    <div className="trail-row-meta">{t.done}/{t.total} módulos concluídos</div>
                  </div>
                  <div className="trail-row-right">
                    <div className="trail-row-pct" style={{ color: t.color }}>{t.progress}%</div>
                    <div className="trail-mini-bar">
                      <div className="trail-mini-fill" style={{ width: `${t.progress}%`, background: t.color }} />
                    </div>
                    <div className="trail-row-xp">{t.xpEarned} / {t.xpTotal} XP</div>
                  </div>
                  <svg className="trail-row-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          )}
        </>
      ) : detailLoading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
          Carregando trilha...
        </div>
      ) : (
        <>
          <div className="trail-detail-header" style={{ '--trail-color': selected.color, '--trail-glow': selected.glow }}>
            <button className="back-btn" onClick={() => setSelected(null)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Trilhas
            </button>
            <div className="trail-detail-top">
              <span className="trail-detail-badge">{selected.badge}</span>
              <div>
                <h1 className="trail-detail-title">{selected.title}</h1>
                <p className="trail-detail-desc">{selected.desc}</p>
              </div>
            </div>
            <div className="trail-detail-stats">
              <div className="tds-item">
                <div className="tds-value" style={{ color: selected.color }}>{selected.xpEarned}</div>
                <div className="tds-label">XP ganhos</div>
              </div>
              <div className="tds-item">
                <div className="tds-value">{selected.done}/{selected.total}</div>
                <div className="tds-label">Módulos</div>
              </div>
              <div className="tds-item">
                <div className="tds-value" style={{ color: selected.color }}>{selected.progress}%</div>
                <div className="tds-label">Concluído</div>
              </div>
            </div>
            <div className="trail-detail-bar-bg">
              <div className="trail-detail-bar-fill"
                style={{ width: `${selected.progress}%`, background: selected.color }} />
            </div>
          </div>

          <div className="module-list">
            {selected.modules.map((mod, idx) => {
              const meta = TYPE_META[mod.quiz ? 'quiz' : mod.type] ?? TYPE_META.lesson
              return (
                <div
                  className={`module-row ${mod.done ? 'done' : ''} ${mod.locked ? 'locked' : ''}`}
                  key={mod.id}
                  style={{ '--trail-color': selected.color }}
                >
                  {idx < selected.modules.length - 1 && (
                    <div className={`module-connector ${mod.done ? 'done' : ''}`} />
                  )}
                  <div className="module-num">
                    {mod.done
                      ? <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : mod.locked ? '🔒' : idx + 1}
                  </div>
                  <div className="module-info">
                    <div className="module-title">{mod.title}</div>
                    <div className="module-meta">
                      <span className="module-type-badge" style={{ color: meta.color, background: `${meta.color}14` }}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="module-duration">⏱ {mod.duration}</span>
                      <span className="module-xp">⚡ {mod.xp} XP</span>
                    </div>
                  </div>
                  <button
                    className={`module-cta ${mod.locked ? 'locked' : ''} ${mod.done ? 'done' : ''}`}
                    disabled={mod.locked}
                    onClick={() => !mod.locked && onNavigate('activity', { mod, trail: selected })}
                  >
                    {mod.done ? 'Rever' : mod.locked ? 'Bloqueado' : 'Iniciar →'}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </AppShell>
  )
}
