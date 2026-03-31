import { useState } from 'react'
import AppShell from '../components/AppShell'

const PERIODS = ['Esta semana', 'Este mês', 'Geral']

const BOARD = [
  { rank:1,  name:'Carlos Menezes',  dept:'Engenharia',   xp:9840, badge:'🥇', avatar:'CM', color:'#fbbf24', delta:'+320' },
  { rank:2,  name:'Beatriz Oliveira',dept:'Produto',       xp:9210, badge:'🥈', avatar:'BO', color:'#94a3b8', delta:'+210' },
  { rank:3,  name:'Rafael Lima',     dept:'Segurança',     xp:8760, badge:'🥉', avatar:'RL', color:'#cd7c3f', delta:'+180' },
  { rank:4,  name:'Ana Silva',       dept:'Design',        xp:7430, badge:'',   avatar:'AS', color:'#3be8b0', delta:'+150', isMe:true },
  { rank:5,  name:'Pedro Souza',     dept:'RH',            xp:6980, badge:'',   avatar:'PS', color:'#63c8ff', delta:'+90' },
  { rank:6,  name:'Juliana Martins', dept:'Financeiro',    xp:6540, badge:'',   avatar:'JM', color:'#a78bfa', delta:'+75' },
  { rank:7,  name:'Marcos Ferreira', dept:'Engenharia',    xp:5920, badge:'',   avatar:'MF', color:'#f87171', delta:'+60' },
  { rank:8,  name:'Larissa Costa',   dept:'Marketing',     xp:5610, badge:'',   avatar:'LC', color:'#34d399', delta:'+55' },
  { rank:9,  name:'Diego Alves',     dept:'Produto',       xp:5100, badge:'',   avatar:'DA', color:'#60a5fa', delta:'+40' },
  { rank:10, name:'Fernanda Reis',   dept:'Jurídico',      xp:4880, badge:'',   avatar:'FR', color:'#fb923c', delta:'+38' },
]

const DEPT_BOARD = [
  { rank:1, name:'Engenharia',  score:94, members:18, color:'#3be8b0' },
  { rank:2, name:'Segurança',   score:91, members:6,  color:'#63c8ff' },
  { rank:3, name:'Produto',     score:87, members:14, color:'#a78bfa' },
  { rank:4, name:'RH / People', score:82, members:8,  color:'#fbbf24' },
  { rank:5, name:'Marketing',   score:76, members:11, color:'#f87171' },
]

function Podium({ top3 }) {
  const order = [top3[1], top3[0], top3[2]] // silver, gold, bronze
  const heights = ['140px', '180px', '110px']
  const labels  = ['2º', '1º', '3º']

  return (
    <div className="podium">
      {order.map((p, i) => (
        <div className="podium-col" key={p.rank}>
          <div className="podium-avatar-wrap">
            {p.badge && <span className="podium-badge">{p.badge}</span>}
            <div className="podium-avatar" style={{background:`${p.color}20`, border:`2px solid ${p.color}`, color:p.color}}>
              {p.avatar}
            </div>
            <div className="podium-name">{p.name.split(' ')[0]}</div>
            <div className="podium-xp" style={{color:p.color}}>{p.xp.toLocaleString('pt-BR')} XP</div>
          </div>
          <div className="podium-block" style={{height:heights[i], background:`${p.color}14`, borderTop:`2px solid ${p.color}`}}>
            <span className="podium-pos">{labels[i]}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LeaderboardPage({ user, onNavigate, onLogout }) {
  const [period, setPeriod] = useState(0)
  const [tab, setTab]       = useState('individual') // 'individual' | 'dept'
  const myRank = BOARD.find(b => b.isMe)

  return (
    <AppShell user={user} onNavigate={onNavigate} onLogout={onLogout} activePage="leaderboard">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Competição saudável</p>
          <h1 className="page-title">Ranking</h1>
        </div>
        <div className="lb-period-tabs">
          {PERIODS.map((p, i) => (
            <button key={p} className={`lb-period-btn ${period === i ? 'active' : ''}`} onClick={() => setPeriod(i)}>{p}</button>
          ))}
        </div>
      </div>

      {/* My position banner */}
      <div className="my-rank-banner">
        <div className="my-rank-left">
          <div className="my-rank-pos">#{myRank.rank}</div>
          <div>
            <div className="my-rank-label">Sua posição</div>
            <div className="my-rank-xp">{myRank.xp.toLocaleString('pt-BR')} XP · {myRank.delta} essa semana</div>
          </div>
        </div>
        <div className="my-rank-right">
          <div className="my-rank-gap">
            <span>↑ {(BOARD[2].xp - myRank.xp).toLocaleString('pt-BR')} XP para o top 3</span>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="lb-tabs">
        <button className={`lb-tab ${tab==='individual'?'active':''}`} onClick={()=>setTab('individual')}>Individual</button>
        <button className={`lb-tab ${tab==='dept'?'active':''}`} onClick={()=>setTab('dept')}>Por Equipe</button>
      </div>

      {tab === 'individual' ? (
        <>
          <Podium top3={BOARD.slice(0,3)} />

          <div className="lb-list">
            {BOARD.slice(3).map(p => (
              <div className={`lb-row ${p.isMe ? 'me' : ''}`} key={p.rank}>
                <div className="lb-rank">#{p.rank}</div>
                <div className="lb-avatar" style={{background:`${p.color}18`, color:p.color}}>{p.avatar}</div>
                <div className="lb-info">
                  <div className="lb-name">{p.name} {p.isMe && <span className="lb-you">Você</span>}</div>
                  <div className="lb-dept">{p.dept}</div>
                </div>
                <div className="lb-right">
                  <div className="lb-xp" style={{color:p.color}}>{p.xp.toLocaleString('pt-BR')}</div>
                  <div className="lb-delta">{p.delta}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="dept-board">
          {DEPT_BOARD.map((d, i) => (
            <div className="dept-row" key={d.name} style={{'--dept-color':d.color}}>
              <div className="dept-rank">{i+1}</div>
              <div className="dept-info">
                <div className="dept-name">{d.name}</div>
                <div className="dept-members">{d.members} membros</div>
              </div>
              <div className="dept-score-wrap">
                <div className="dept-score-bar">
                  <div className="dept-score-fill" style={{width:`${d.score}%`, background:d.color}} />
                </div>
                <div className="dept-score-val" style={{color:d.color}}>{d.score}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
