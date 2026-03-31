import { useState, useEffect, useRef } from 'react'
import AppShell from '../components/AppShell'

const MOCK_USER = { name: 'Ana Silva', xp: 3840, level: 12, streak: 7 }

const TRAILS = [
  { id:'security', title:'Segurança da Informação', color:'#3be8b0', glow:'rgba(59,232,176,0.18)',
    progress:92, modules:8, done:7, badge:'🛡️', category:'Compliance' },
  { id:'lgpd',     title:'Compliance & LGPD',       color:'#63c8ff', glow:'rgba(99,200,255,0.18)',
    progress:65, modules:6, done:4, badge:'⚖️', category:'Compliance' },
  { id:'devops',   title:'Boas Práticas Dev',        color:'#a78bfa', glow:'rgba(167,139,250,0.18)',
    progress:96, modules:5, done:5, badge:'💻', category:'Técnico' },
  { id:'gov',      title:'Governança Interna',       color:'#fbbf24', glow:'rgba(251,191,36,0.18)',
    progress:38, modules:9, done:3, badge:'🏛️', category:'Corporativo' },
  { id:'soft',     title:'Soft Skills & Liderança',  color:'#f87171', glow:'rgba(248,113,113,0.18)',
    progress:20, modules:7, done:1, badge:'🌱', category:'Desenvolvimento' },
]

const ACHIEVEMENTS = [
  { icon:'🔥', label:'7 dias seguidos', unlocked:true },
  { icon:'🎯', label:'100% em Segurança', unlocked:true },
  { icon:'⚡', label:'Velocista', unlocked:true },
  { icon:'🧠', label:'Mestre LGPD', unlocked:false },
  { icon:'🏆', label:'Top 3 ranking', unlocked:false },
  { icon:'🌟', label:'Trilha completa', unlocked:false },
]

const ACTIVITY_FEED = [
  { time:'há 2h',  text:'Completou o módulo "Criptografia Avançada"', xp:'+120 XP', color:'#3be8b0' },
  { time:'ontem',  text:'Atingiu nível 12 🎉',                        xp:'+0',     color:'#fbbf24' },
  { time:'ontem',  text:'Quiz perfeito em "LGPD na Prática"',         xp:'+200 XP', color:'#63c8ff' },
  { time:'3 dias', text:'Completou trilha "Boas Práticas Dev"',       xp:'+500 XP', color:'#a78bfa' },
]

function XPRing({ pct, color }) {
  const r = 44, c = 2 * Math.PI * r
  const [dash, setDash] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setDash((pct / 100) * c), 200)
    return () => clearTimeout(t)
  }, [pct, c])
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" style={{transform:'rotate(-90deg)'}}>
      <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
      <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={c} strokeDashoffset={c - dash}
        strokeLinecap="round"
        style={{transition:'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)',filter:`drop-shadow(0 0 8px ${color})`}}/>
    </svg>
  )
}

export default function DashboardPage({ user, onNavigate, onLogout }) {
  const u = user ? { ...MOCK_USER, name: user.name } : MOCK_USER
  const xpToNext = 5000
  const xpPct = Math.round((u.xp / xpToNext) * 100)

  return (
    <AppShell user={u} onNavigate={onNavigate} onLogout={onLogout} activePage="dashboard">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Bem-vinda de volta 👋</p>
          <h1 className="page-title">{u.name.split(' ')[0]}</h1>
        </div>
        <div className="header-streak">
          <span className="streak-flame">🔥</span>
          <div>
            <div className="streak-number">{u.streak}</div>
            <div className="streak-label">dias seguidos</div>
          </div>
        </div>
      </div>

      {/* ── Top stats ── */}
      <div className="stats-row">
        {/* XP Ring */}
        <div className="xp-card">
          <div className="xp-ring-wrap">
            <XPRing pct={xpPct} color="#3be8b0" />
            <div className="xp-ring-center">
              <div className="xp-ring-level">Nv {u.level}</div>
              <div className="xp-ring-pct">{xpPct}%</div>
            </div>
          </div>
          <div className="xp-card-info">
            <div className="xp-card-title">Progresso de Nível</div>
            <div className="xp-card-value">{u.xp.toLocaleString('pt-BR')} <span>/ {xpToNext.toLocaleString('pt-BR')} XP</span></div>
            <div className="xp-bar-bg"><div className="xp-bar-fill" style={{width:`${xpPct}%`}} /></div>
            <div className="xp-card-sub">{xpToNext - u.xp} XP para o nível {u.level + 1}</div>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="quick-metrics">
          {[
            { label:'Trilhas ativas',   value:'5',   sub:'2 próx. do fim',    color:'#3be8b0', icon:'◈' },
            { label:'Módulos feitos',   value:'20',  sub:'esta semana',       color:'#63c8ff', icon:'⬡' },
            { label:'Ranking global',   value:'#14', sub:'top 5% da empresa', color:'#fbbf24', icon:'◉' },
            { label:'Certificados',     value:'3',   sub:'emitidos',          color:'#a78bfa', icon:'★' },
          ].map(m => (
            <div className="qm-card" key={m.label}>
              <div className="qm-icon" style={{color:m.color}}>{m.icon}</div>
              <div className="qm-value" style={{color:m.color}}>{m.value}</div>
              <div className="qm-label">{m.label}</div>
              <div className="qm-sub">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trails ── */}
      <section className="dash-section">
        <div className="dash-section-hd">
          <h2 className="dash-section-title">Suas Trilhas</h2>
          <button className="dash-section-link" onClick={() => onNavigate('trail')}>Ver todas →</button>
        </div>
        <div className="trails-grid">
          {TRAILS.map(trail => (
            <button className="trail-card" key={trail.id}
              style={{'--trail-color': trail.color, '--trail-glow': trail.glow}}
              onClick={() => onNavigate('trail', { trailId: trail.id, trail })}>
              <div className="trail-card-top">
                <span className="trail-badge-chip">{trail.category}</span>
                <span className="trail-badge-icon">{trail.badge}</span>
              </div>
              <div className="trail-card-title">{trail.title}</div>
              <div className="trail-card-meta">{trail.done}/{trail.modules} módulos</div>
              <div className="trail-progress-bg">
                <div className="trail-progress-fill" style={{width:`${trail.progress}%`}} />
              </div>
              <div className="trail-pct">{trail.progress}%</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Bottom: Achievements + Activity ── */}
      <div className="dash-bottom">
        <section className="dash-section">
          <h2 className="dash-section-title">Conquistas</h2>
          <div className="achievements-grid">
            {ACHIEVEMENTS.map(a => (
              <div key={a.label} className={`achievement-chip ${a.unlocked ? 'unlocked' : 'locked'}`}>
                <span className="achievement-icon">{a.icon}</span>
                <span className="achievement-label">{a.label}</span>
                {!a.unlocked && <span className="achievement-lock">🔒</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="dash-section">
          <h2 className="dash-section-title">Atividade Recente</h2>
          <div className="activity-feed">
            {ACTIVITY_FEED.map((item, i) => (
              <div className="feed-item" key={i}>
                <div className="feed-pip" style={{background: item.color}} />
                <div className="feed-content">
                  <div className="feed-text">{item.text}</div>
                  <div className="feed-meta">
                    <span className="feed-time">{item.time}</span>
                    {item.xp !== '+0' && <span className="feed-xp" style={{color:item.color}}>{item.xp}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
