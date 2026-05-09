import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { leaderboard as leaderboardApi } from '../api/client'

const PERIODS = [
  { label: 'Esta semana', api: 'weekly'   },
  { label: 'Geral',       api: 'all-time' },
]

const ENTRY_COLORS = [
  '#fbbf24','#94a3b8','#cd7c3f',
  '#3be8b0','#63c8ff','#a78bfa','#f87171','#34d399','#60a5fa','#fb923c',
]

const DEPT_BOARD = [
  { rank:1, name:'Engenharia',  score:94, members:18, color:'#3be8b0' },
  { rank:2, name:'Segurança',   score:91, members:6,  color:'#63c8ff' },
  { rank:3, name:'Produto',     score:87, members:14, color:'#a78bfa' },
  { rank:4, name:'RH / People', score:82, members:8,  color:'#fbbf24' },
  { rank:5, name:'Marketing',   score:76, members:11, color:'#f87171' },
]

function initials(name = '') {
  return name.split(' ').map(n => n[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'
}

function normalize(e, currentUserId) {
  const badges = ['🥇', '🥈', '🥉']
  return {
    rank:   e.rank,
    name:   e.name   ?? 'Utilizador',
    xp:     e.xp     ?? 0,
    level:  e.level  ?? 1,
    streak: e.streak ?? 0,
    badge:  badges[e.rank - 1] ?? '',
    avatar: initials(e.name),
    color:  ENTRY_COLORS[(e.rank - 1) % ENTRY_COLORS.length],
    isMe:   e.userId != null && e.userId === currentUserId,
  }
}

function Podium({ top3 }) {
  if (top3.length < 3) return null
  const order   = [top3[1], top3[0], top3[2]]
  const heights = ['140px', '180px', '110px']
  const labels  = ['2º', '1º', '3º']

  return (
    <div className="podium">
      {order.map((p, i) => (
        <div className="podium-col" key={p.rank}>
          <div className="podium-avatar-wrap">
            {p.badge && <span className="podium-badge">{p.badge}</span>}
            <div className="podium-avatar" style={{ background: `${p.color}20`, border: `2px solid ${p.color}`, color: p.color }}>
              {p.avatar}
            </div>
            <div className="podium-name">{p.name.split(' ')[0]}</div>
            <div className="podium-xp" style={{ color: p.color }}>{p.xp.toLocaleString('pt-BR')} XP</div>
          </div>
          <div className="podium-block" style={{ height: heights[i], background: `${p.color}14`, borderTop: `2px solid ${p.color}` }}>
            <span className="podium-pos">{labels[i]}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LeaderboardPage({ user, onNavigate, onLogout }) {
  const [period,  setPeriod] = useState(0)
  const [tab,     setTab]    = useState('individual')
  const [board,   setBoard]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    leaderboardApi.get(PERIODS[period].api, 'individual')
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setBoard(list.map(e => normalize(e, user?.id)))
      })
      .catch(() => setBoard([]))
      .finally(() => setLoading(false))
  }, [period, user?.id])

  const myEntry = board.find(e => e.isMe)
  const top3    = board.slice(0, 3)
  const rest    = board.slice(3)

  return (
    <AppShell user={user} onNavigate={onNavigate} onLogout={onLogout} activePage="leaderboard">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Competição saudável</p>
          <h1 className="page-title">Ranking</h1>
        </div>
        <div className="lb-period-tabs">
          {PERIODS.map((p, i) => (
            <button key={p.label} className={`lb-period-btn ${period === i ? 'active' : ''}`} onClick={() => setPeriod(i)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* My position banner */}
      {myEntry && (
        <div className="my-rank-banner">
          <div className="my-rank-left">
            <div className="my-rank-pos">#{myEntry.rank}</div>
            <div>
              <div className="my-rank-label">Sua posição</div>
              <div className="my-rank-xp">{(user?.xp ?? myEntry.xp).toLocaleString('pt-BR')} XP · {myEntry.streak} dias seguidos</div>
            </div>
          </div>
          {top3.length >= 3 && myEntry.rank > 3 && (
            <div className="my-rank-right">
              <div className="my-rank-gap">
                <span>↑ {Math.max(0, top3[2].xp - (user?.xp ?? myEntry.xp)).toLocaleString('pt-BR')} XP para o top 3</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab switcher */}
      <div className="lb-tabs">
        <button className={`lb-tab ${tab === 'individual' ? 'active' : ''}`} onClick={() => setTab('individual')}>Individual</button>
        <button className={`lb-tab ${tab === 'dept' ? 'active' : ''}`} onClick={() => setTab('dept')}>Por Equipe</button>
      </div>

      {tab === 'individual' ? (
        loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Carregando ranking...</div>
        ) : board.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Nenhum dado disponível.</div>
        ) : (
          <>
            <Podium top3={top3} />
            <div className="lb-list">
              {rest.map(p => (
                <div className={`lb-row ${p.isMe ? 'me' : ''}`} key={p.rank}>
                  <div className="lb-rank">#{p.rank}</div>
                  <div className="lb-avatar" style={{ background: `${p.color}18`, color: p.color }}>{p.avatar}</div>
                  <div className="lb-info">
                    <div className="lb-name">{p.name} {p.isMe && <span className="lb-you">Você</span>}</div>
                    <div className="lb-dept">Nível {p.level} · {p.streak} dias seguidos</div>
                  </div>
                  <div className="lb-right">
                    <div className="lb-xp" style={{ color: p.color }}>{p.xp.toLocaleString('pt-BR')}</div>
                    <div className="lb-delta">XP</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        <div className="dept-board">
          {DEPT_BOARD.map((d, i) => (
            <div className="dept-row" key={d.name} style={{ '--dept-color': d.color }}>
              <div className="dept-rank">{i + 1}</div>
              <div className="dept-info">
                <div className="dept-name">{d.name}</div>
                <div className="dept-members">{d.members} membros</div>
              </div>
              <div className="dept-score-wrap">
                <div className="dept-score-bar">
                  <div className="dept-score-fill" style={{ width: `${d.score}%`, background: d.color }} />
                </div>
                <div className="dept-score-val" style={{ color: d.color }}>{d.score}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
