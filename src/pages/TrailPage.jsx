import { useState } from 'react'
import AppShell from '../components/AppShell'

const TRAILS_DATA = {
  security: {
    title:'Segurança da Informação', color:'#3be8b0', glow:'rgba(59,232,176,0.15)', badge:'🛡️',
    desc:'Proteja sistemas e dados com as melhores práticas de cibersegurança corporativa.',
    xpTotal: 1200, xpEarned: 1104,
    modules: [
      { id:'s1', title:'Fundamentos de Segurança',     type:'video',  xp:120, done:true,  locked:false, duration:'12 min' },
      { id:'s2', title:'Engenharia Social & Phishing',  type:'quiz',   xp:150, done:true,  locked:false, duration:'8 min' },
      { id:'s3', title:'Senhas e Autenticação',         type:'quiz',   xp:130, done:true,  locked:false, duration:'10 min' },
      { id:'s4', title:'Criptografia na Prática',       type:'lesson', xp:160, done:true,  locked:false, duration:'15 min' },
      { id:'s5', title:'Segurança em Dispositivos',     type:'video',  xp:110, done:true,  locked:false, duration:'9 min' },
      { id:'s6', title:'Resposta a Incidentes',         type:'quiz',   xp:180, done:true,  locked:false, duration:'14 min' },
      { id:'s7', title:'Criptografia Avançada',         type:'lesson', xp:200, done:true,  locked:false, duration:'20 min' },
      { id:'s8', title:'Certificação Final',            type:'exam',   xp:250, done:false, locked:false, duration:'30 min' },
    ]
  },
  lgpd: {
    title:'Compliance & LGPD', color:'#63c8ff', glow:'rgba(99,200,255,0.15)', badge:'⚖️',
    desc:'Entenda a legislação de proteção de dados e aplique na rotina da sua equipe.',
    xpTotal: 900, xpEarned: 585,
    modules: [
      { id:'l1', title:'Introdução à LGPD',            type:'video',  xp:100, done:true,  locked:false, duration:'10 min' },
      { id:'l2', title:'Dados Pessoais e Sensíveis',   type:'lesson', xp:120, done:true,  locked:false, duration:'12 min' },
      { id:'l3', title:'Bases Legais de Tratamento',   type:'quiz',   xp:150, done:true,  locked:false, duration:'15 min' },
      { id:'l4', title:'Direitos dos Titulares',       type:'quiz',   xp:140, done:true,  locked:false, duration:'11 min' },
      { id:'l5', title:'DPO e Responsabilidades',      type:'lesson', xp:160, done:false, locked:false, duration:'18 min' },
      { id:'l6', title:'Avaliação Final LGPD',         type:'exam',   xp:230, done:false, locked:true,  duration:'25 min' },
    ]
  },
  devops: {
    title:'Boas Práticas Dev', color:'#a78bfa', glow:'rgba(167,139,250,0.15)', badge:'💻',
    desc:'Clean code, versionamento e cultura DevOps para equipes de alta performance.',
    xpTotal: 850, xpEarned: 850,
    modules: [
      { id:'d1', title:'Clean Code Fundamentos',       type:'lesson', xp:150, done:true, locked:false, duration:'14 min' },
      { id:'d2', title:'Git Avançado',                 type:'video',  xp:180, done:true, locked:false, duration:'16 min' },
      { id:'d3', title:'Code Review na Prática',       type:'quiz',   xp:160, done:true, locked:false, duration:'12 min' },
      { id:'d4', title:'CI/CD Pipelines',              type:'lesson', xp:200, done:true, locked:false, duration:'22 min' },
      { id:'d5', title:'Certificação Dev',             type:'exam',   xp:160, done:true, locked:false, duration:'20 min' },
    ]
  },
  gov:  { title:'Governança Interna', color:'#fbbf24', glow:'rgba(251,191,36,0.15)', badge:'🏛️', desc:'Estruturas, políticas e processos que sustentam a operação corporativa.', xpTotal:1100, xpEarned:418, modules:[
    { id:'g1', title:'Intro Governança',   type:'video',  xp:100, done:true,  locked:false, duration:'8 min' },
    { id:'g2', title:'Políticas Internas', type:'lesson', xp:130, done:true,  locked:false, duration:'12 min' },
    { id:'g3', title:'Controle de Riscos', type:'quiz',   xp:150, done:true,  locked:false, duration:'15 min' },
    { id:'g4', title:'Auditoria Interna',  type:'lesson', xp:180, done:false, locked:false, duration:'18 min' },
    { id:'g5', title:'Compliance na Prática',type:'quiz', xp:200, done:false, locked:true,  duration:'20 min' },
    { id:'g6', title:'Frameworks GRC',     type:'lesson', xp:160, done:false, locked:true,  duration:'16 min' },
    { id:'g7', title:'Simulação de Crise', type:'quiz',   xp:130, done:false, locked:true,  duration:'14 min' },
    { id:'g8', title:'Avaliação Final',    type:'exam',   xp:250, done:false, locked:true,  duration:'30 min' },
  ]},
  soft: { title:'Soft Skills & Liderança', color:'#f87171', glow:'rgba(248,113,113,0.15)', badge:'🌱', desc:'Desenvolva comunicação, inteligência emocional e liderança de equipes.', xpTotal:950, xpEarned:190, modules:[
    { id:'ss1', title:'Inteligência Emocional', type:'video',  xp:120, done:true,  locked:false, duration:'11 min' },
    { id:'ss2', title:'Comunicação Não-Violenta',type:'lesson',xp:150, done:false, locked:false, duration:'15 min' },
    { id:'ss3', title:'Liderança Situacional',   type:'quiz',  xp:180, done:false, locked:true,  duration:'17 min' },
    { id:'ss4', title:'Feedback Assertivo',      type:'lesson',xp:160, done:false, locked:true,  duration:'14 min' },
    { id:'ss5', title:'Gestão de Conflitos',     type:'quiz',  xp:140, done:false, locked:true,  duration:'12 min' },
    { id:'ss6', title:'Avaliação Final',         type:'exam',  xp:200, done:false, locked:true,  duration:'25 min' },
  ]},
}

const TYPE_META = {
  video:  { icon:'▶', label:'Vídeo',    color:'#63c8ff' },
  quiz:   { icon:'⚡',label:'Quiz',     color:'#fbbf24' },
  lesson: { icon:'◈', label:'Lição',    color:'#3be8b0' },
  exam:   { icon:'★', label:'Exame',    color:'#a78bfa' },
}

const ALL_TRAILS = Object.entries(TRAILS_DATA).map(([id, t]) => ({ id, ...t,
  progress: Math.round((t.xpEarned / t.xpTotal) * 100),
  done: t.modules.filter(m => m.done).length,
  total: t.modules.length,
}))

export default function TrailPage({ user, onNavigate, onLogout, ctx }) {
  const [selected, setSelected] = useState(ctx?.trailId ? TRAILS_DATA[ctx.trailId] ? ctx.trailId : null : null)

  const trail = selected ? TRAILS_DATA[selected] : null

  return (
    <AppShell user={user} onNavigate={onNavigate} onLogout={onLogout} activePage="trail">
      {!trail ? (
        /* ── Trail list ── */
        <>
          <div className="page-header">
            <div>
              <p className="page-eyebrow">Jornada de aprendizado</p>
              <h1 className="page-title">Trilhas</h1>
            </div>
          </div>
          <div className="trail-list">
            {ALL_TRAILS.map(t => (
              <button className="trail-row" key={t.id}
                style={{'--trail-color': t.color, '--trail-glow': t.glow}}
                onClick={() => setSelected(t.id)}>
                <div className="trail-row-badge">{t.badge}</div>
                <div className="trail-row-info">
                  <div className="trail-row-title">{t.title}</div>
                  <div className="trail-row-desc">{TRAILS_DATA[t.id].desc}</div>
                  <div className="trail-row-meta">{t.done}/{t.total} módulos concluídos</div>
                </div>
                <div className="trail-row-right">
                  <div className="trail-row-pct" style={{color:t.color}}>{t.progress}%</div>
                  <div className="trail-mini-bar">
                    <div className="trail-mini-fill" style={{width:`${t.progress}%`, background:t.color}} />
                  </div>
                  <div className="trail-row-xp">{TRAILS_DATA[t.id].xpEarned} / {TRAILS_DATA[t.id].xpTotal} XP</div>
                </div>
                <svg className="trail-row-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </>
      ) : (
        /* ── Trail detail ── */
        <>
          <div className="trail-detail-header" style={{'--trail-color': trail.color, '--trail-glow': trail.glow}}>
            <button className="back-btn" onClick={() => setSelected(null)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Trilhas
            </button>
            <div className="trail-detail-top">
              <span className="trail-detail-badge">{trail.badge}</span>
              <div>
                <h1 className="trail-detail-title">{trail.title}</h1>
                <p className="trail-detail-desc">{trail.desc}</p>
              </div>
            </div>
            <div className="trail-detail-stats">
              <div className="tds-item">
                <div className="tds-value" style={{color:trail.color}}>{trail.xpEarned}</div>
                <div className="tds-label">XP ganhos</div>
              </div>
              <div className="tds-item">
                <div className="tds-value">{trail.modules.filter(m=>m.done).length}/{trail.modules.length}</div>
                <div className="tds-label">Módulos</div>
              </div>
              <div className="tds-item">
                <div className="tds-value" style={{color:trail.color}}>
                  {Math.round((trail.xpEarned/trail.xpTotal)*100)}%
                </div>
                <div className="tds-label">Concluído</div>
              </div>
            </div>
            <div className="trail-detail-bar-bg">
              <div className="trail-detail-bar-fill"
                style={{width:`${Math.round((trail.xpEarned/trail.xpTotal)*100)}%`, background:trail.color}} />
            </div>
          </div>

          <div className="module-list">
            {trail.modules.map((mod, idx) => {
              const meta = TYPE_META[mod.type]
              return (
                <div className={`module-row ${mod.done?'done':''} ${mod.locked?'locked':''}`}
                  key={mod.id}
                  style={{'--trail-color': trail.color}}>
                  {/* connector line */}
                  {idx < trail.modules.length - 1 && (
                    <div className={`module-connector ${mod.done?'done':''}`} />
                  )}
                  <div className="module-num">
                    {mod.done
                      ? <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : mod.locked
                        ? '🔒'
                        : idx + 1}
                  </div>
                  <div className="module-info">
                    <div className="module-title">{mod.title}</div>
                    <div className="module-meta">
                      <span className="module-type-badge" style={{color:meta.color, background:`${meta.color}14`}}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="module-duration">⏱ {mod.duration}</span>
                      <span className="module-xp">⚡ {mod.xp} XP</span>
                    </div>
                  </div>
                  <button
                    className={`module-cta ${mod.locked?'locked':''} ${mod.done?'done':''}`}
                    disabled={mod.locked}
                    onClick={() => !mod.locked && onNavigate('activity', { mod, trail: { ...trail, id: selected } })}>
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
