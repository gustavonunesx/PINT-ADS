import { useState, useEffect, useRef } from 'react'
import AppShell from '../components/AppShell'

// ── Quiz module ──────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    q: 'O que é phishing?',
    opts: [
      'Técnica de pesca esportiva',
      'Ataque que tenta enganar usuários para obter dados sensíveis',
      'Tipo de firewall corporativo',
      'Protocolo de criptografia de e-mails',
    ],
    correct: 1,
    explain: 'Phishing é um ataque de engenharia social onde o atacante se disfarça de entidade confiável para roubar credenciais ou instalar malware.',
  },
  {
    q: 'Qual das opções representa uma senha segura?',
    opts: ['senha123', '12345678', 'P@ssw0rd!2024#X', 'qwerty'],
    correct: 2,
    explain: 'Uma senha forte combina letras maiúsculas e minúsculas, números, símbolos e tem no mínimo 12 caracteres.',
  },
  {
    q: 'O que é autenticação de dois fatores (2FA)?',
    opts: [
      'Fazer login duas vezes',
      'Um segundo método de verificação além da senha',
      'Duas senhas diferentes',
      'Autenticação biométrica apenas',
    ],
    correct: 1,
    explain: 'O 2FA adiciona uma camada extra de segurança: mesmo que a senha seja comprometida, o acesso exige um segundo fator.',
  },
  {
    q: 'Qual é a principal função de um firewall?',
    opts: [
      'Armazenar backups',
      'Gerenciar senhas',
      'Monitorar e controlar o tráfego de rede',
      'Criptografar arquivos locais',
    ],
    correct: 2,
    explain: 'O firewall filtra o tráfego de rede baseado em regras de segurança, bloqueando acessos não autorizados.',
  },
]

function QuizModule({ mod, trail, onComplete }) {
  const [qIdx, setQIdx]         = useState(0)
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore]       = useState(0)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers]   = useState([])
  const [showXP, setShowXP]     = useState(false)

  const q = QUIZ_QUESTIONS[qIdx]
  const isLast = qIdx === QUIZ_QUESTIONS.length - 1
  const correct = selected === q.correct

  const confirm = () => {
    if (selected === null) return
    setConfirmed(true)
    if (selected === q.correct) setScore(s => s + 1)
    setAnswers(a => [...a, { q: q.q, correct: selected === q.correct }])
  }

  const next = () => {
    if (isLast) {
      setFinished(true)
      setTimeout(() => setShowXP(true), 400)
    } else {
      setQIdx(i => i + 1)
      setSelected(null)
      setConfirmed(false)
    }
  }

  const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100)

  if (finished) return (
    <div className="quiz-result">
      <div className={`quiz-result-ring ${showXP ? 'show' : ''}`}
        style={{'--score-color': pct >= 75 ? '#3be8b0' : pct >= 50 ? '#fbbf24' : '#f87171'}}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{transform:'rotate(-90deg)'}}>
          <circle cx="80" cy="80" r="66" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
          <circle cx="80" cy="80" r="66" fill="none"
            stroke={pct >= 75 ? '#3be8b0' : pct >= 50 ? '#fbbf24' : '#f87171'}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 66}
            strokeDashoffset={showXP ? 2 * Math.PI * 66 * (1 - pct/100) : 2 * Math.PI * 66}
            style={{transition:'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)', filter:`drop-shadow(0 0 12px ${pct>=75?'#3be8b0':pct>=50?'#fbbf24':'#f87171'})`}}/>
        </svg>
        <div className="quiz-result-center">
          <div className="quiz-result-pct">{pct}%</div>
          <div className="quiz-result-label">{score}/{QUIZ_QUESTIONS.length}</div>
        </div>
      </div>
      <h2 className="quiz-result-title">
        {pct >= 75 ? '🎉 Excelente!' : pct >= 50 ? '👍 Bom trabalho!' : '💪 Continue tentando!'}
      </h2>
      <p className="quiz-result-desc">
        {pct >= 75 ? 'Você domina o assunto! Continue assim.' : pct >= 50 ? 'Boa performance! Revise os erros para fixar o conteúdo.' : 'Revise o material e tente novamente.'}
      </p>
      <div className={`quiz-xp-badge ${showXP ? 'show' : ''}`}>
        <span>⚡</span>+{Math.round(mod.xp * (score / QUIZ_QUESTIONS.length))} XP ganhos
      </div>
      <div className="quiz-result-answers">
        {answers.map((a, i) => (
          <div key={i} className={`result-answer-row ${a.correct ? 'ok' : 'err'}`}>
            <span>{a.correct ? '✓' : '✗'}</span>
            <span>{a.q}</span>
          </div>
        ))}
      </div>
      <button className="activity-cta-btn" onClick={onComplete}>
        Concluir e voltar à trilha →
      </button>
    </div>
  )

  return (
    <div className="quiz-wrap">
      {/* Progress bar */}
      <div className="quiz-prog-row">
        <span className="quiz-prog-label">{qIdx + 1} / {QUIZ_QUESTIONS.length}</span>
        <div className="quiz-prog-bar">
          <div className="quiz-prog-fill"
            style={{width:`${((qIdx + (confirmed ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%`,
              background: trail.color}} />
        </div>
        <span className="quiz-xp-pill">⚡ {mod.xp} XP</span>
      </div>

      <div className="quiz-question">{q.q}</div>

      <div className="quiz-options">
        {q.opts.map((opt, i) => {
          let state = ''
          if (confirmed) {
            if (i === q.correct) state = 'correct'
            else if (i === selected) state = 'wrong'
          } else if (i === selected) state = 'selected'
          return (
            <button key={i}
              className={`quiz-option ${state}`}
              disabled={confirmed}
              onClick={() => setSelected(i)}
              style={{'--trail-color': trail.color}}>
              <span className="quiz-opt-letter">{String.fromCharCode(65+i)}</span>
              {opt}
            </button>
          )
        })}
      </div>

      {confirmed && (
        <div className={`quiz-feedback ${correct ? 'correct' : 'wrong'}`}>
          <div className="quiz-feedback-icon">{correct ? '✓' : '✗'}</div>
          <div>
            <div className="quiz-feedback-title">{correct ? 'Correto!' : 'Ops, não foi dessa vez.'}</div>
            <div className="quiz-feedback-explain">{q.explain}</div>
          </div>
        </div>
      )}

      <div className="quiz-actions">
        {!confirmed
          ? <button className="activity-cta-btn" disabled={selected === null} onClick={confirm}
              style={{background: selected !== null ? trail.color : undefined}}>
              Confirmar resposta
            </button>
          : <button className="activity-cta-btn" onClick={next}
              style={{background: trail.color}}>
              {isLast ? 'Ver resultado →' : 'Próxima pergunta →'}
            </button>
        }
      </div>
    </div>
  )
}

// ── Lesson module ────────────────────────────────────────────────────
function LessonModule({ mod, trail, onComplete }) {
  const [readPct, setReadPct] = useState(0)
  const [done, setDone]       = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const pct = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100))
      setReadPct(pct)
      if (pct >= 90) setDone(true)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="lesson-wrap">
      <div className="lesson-read-bar">
        <div className="lesson-read-fill" style={{width:`${readPct}%`, background:trail.color}} />
      </div>
      <div className="lesson-content" ref={contentRef}>
        <h2 className="lesson-title">{mod.title}</h2>
        <p className="lesson-body">
          A criptografia é o pilar fundamental da segurança digital moderna. Ela transforma dados legíveis em
          um formato codificado que só pode ser decifrado com a chave correta, garantindo confidencialidade,
          integridade e autenticidade das informações.
        </p>
        <h3 className="lesson-subtitle">Tipos de Criptografia</h3>
        <p className="lesson-body">
          <strong style={{color:trail.color}}>Simétrica:</strong> utiliza a mesma chave para cifrar e decifrar.
          É rápida e eficiente para grandes volumes de dados, mas exige compartilhamento seguro da chave.
          Exemplos: AES-256, ChaCha20.
        </p>
        <p className="lesson-body">
          <strong style={{color:trail.color}}>Assimétrica:</strong> utiliza um par de chaves — pública e privada.
          A chave pública cifra, somente a privada decifra. Base do TLS/HTTPS e assinaturas digitais.
          Exemplos: RSA-2048, Ed25519.
        </p>
        <div className="lesson-callout" style={{borderColor:trail.color, background:`${trail.color}08`}}>
          <span className="lesson-callout-icon">💡</span>
          <span>O HTTPS usa criptografia assimétrica para trocar chaves simétricas de sessão — combinando segurança e performance.</span>
        </div>
        <h3 className="lesson-subtitle">Hashing</h3>
        <p className="lesson-body">
          Hash é uma função unidirecional: transforma qualquer dado em uma string de tamanho fixo.
          Não é criptografia (não há chave, não é reversível), mas é essencial para verificar integridade
          de arquivos e armazenar senhas. Exemplos: SHA-256, bcrypt.
        </p>
        <h3 className="lesson-subtitle">Boas Práticas</h3>
        <ul className="lesson-list">
          <li>Nunca implemente criptografia do zero — use bibliotecas auditadas</li>
          <li>Prefira AES-256-GCM para dados em repouso</li>
          <li>Use TLS 1.3 para dados em trânsito</li>
          <li>Rotacione chaves periodicamente</li>
          <li>Armazene senhas com bcrypt, Argon2 ou scrypt</li>
        </ul>
        <div style={{height:'3rem'}} />
      </div>
      <div className="lesson-footer">
        <span className="lesson-read-pct">{readPct}% lido</span>
        <button className="activity-cta-btn" disabled={!done} onClick={onComplete}
          style={{background: done ? trail.color : undefined}}>
          {done ? 'Conteúdo lido — Continuar →' : 'Role para baixo para continuar'}
        </button>
      </div>
    </div>
  )
}

// ── Video module ─────────────────────────────────────────────────────
function VideoModule({ mod, trail, onComplete }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)
  const TOTAL = 42 // seconds (simulated)

  const toggle = () => {
    if (done) return
    setPlaying(p => {
      if (!p) {
        intervalRef.current = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) { clearInterval(intervalRef.current); setDone(true); return 100 }
            return prev + (100 / TOTAL / 10)
          })
        }, 100)
      } else {
        clearInterval(intervalRef.current)
      }
      return !p
    })
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const secs = Math.round((progress / 100) * TOTAL)
  const fmt  = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="video-wrap">
      <div className="video-player" style={{'--trail-color': trail.color}} onClick={toggle}>
        <div className="video-thumb">
          <div className="video-thumb-grid">
            {Array.from({length:16}).map((_,i)=>(
              <div key={i} className="video-thumb-cell"
                style={{opacity:0.04+Math.random()*0.08, background:trail.color}} />
            ))}
          </div>
          <div className="video-play-btn" style={{
            background: playing ? 'rgba(0,0,0,0.5)' : trail.color,
            boxShadow: `0 0 40px ${trail.glow || trail.color}44`}}>
            {done
              ? <svg width="28" height="28" viewBox="0 0 28 28"><path d="M5 14l5.5 5.5L23 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : playing
                ? <svg width="28" height="28" viewBox="0 0 28 28"><rect x="7" y="5" width="4.5" height="18" rx="1.5" fill="white"/><rect x="16.5" y="5" width="4.5" height="18" rx="1.5" fill="white"/></svg>
                : <svg width="28" height="28" viewBox="0 0 28 28"><path d="M8 5l16 9-16 9V5z" fill="white"/></svg>}
          </div>
          <div className="video-title-overlay">{mod.title}</div>
        </div>
        <div className="video-controls">
          <div className="video-prog-bar">
            <div className="video-prog-fill" style={{width:`${progress}%`, background:trail.color}} />
          </div>
          <div className="video-time-row">
            <span>{fmt(secs)}</span>
            <span className="video-dur">{fmt(TOTAL)}</span>
          </div>
        </div>
      </div>
      <p className="video-desc">
        Assista ao vídeo completo sobre <strong>{mod.title}</strong>. O conteúdo aborda os conceitos
        essenciais com exemplos práticos aplicados ao ambiente corporativo.
      </p>
      {done && (
        <div className="video-done-banner" style={{borderColor:trail.color, background:`${trail.color}0d`}}>
          <span style={{color:trail.color}}>✓</span>
          Vídeo assistido! +{mod.xp} XP desbloqueados.
        </div>
      )}
      <button className="activity-cta-btn" disabled={!done} onClick={onComplete}
        style={{background: done ? trail.color : undefined, marginTop:'1.5rem'}}>
        {done ? 'Continuar para o próximo módulo →' : 'Assista ao vídeo completo para continuar'}
      </button>
    </div>
  )
}

// ── Main ActivityPage ────────────────────────────────────────────────
export default function ActivityPage({ user, onNavigate, onLogout, ctx }) {
  const mod   = ctx?.mod   || { id:'s7', title:'Criptografia Avançada', type:'lesson', xp:200, duration:'20 min' }
  const trail = ctx?.trail || { title:'Segurança da Informação', color:'#3be8b0', glow:'rgba(59,232,176,0.15)', badge:'🛡️', id:'security' }

  const [completed, setCompleted] = useState(false)

  const handleComplete = () => {
    setCompleted(true)
    setTimeout(() => onNavigate('trail', { trailId: trail.id, trail }), 2000)
  }

  return (
    <AppShell user={user} onNavigate={onNavigate} onLogout={onLogout} activePage="trail">
      {/* Header */}
      <div className="activity-header" style={{'--trail-color':trail.color,'--trail-glow':trail.glow}}>
        <button className="back-btn" onClick={() => onNavigate('trail', { trailId: trail.id, trail })}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {trail.title}
        </button>
        <div className="activity-header-meta">
          <span className="activity-badge">{trail.badge}</span>
          <h1 className="activity-title">{mod.title}</h1>
          <div className="activity-chips">
            <span className="activity-chip">⏱ {mod.duration}</span>
            <span className="activity-chip" style={{color:trail.color, background:`${trail.color}14`}}>⚡ {mod.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Module content */}
      <div className="activity-body">
        {completed ? (
          <div className="activity-complete">
            <div className="complete-ring" style={{borderColor:trail.color, boxShadow:`0 0 40px ${trail.color}44`}}>
              <svg width="56" height="56" viewBox="0 0 56 56"><path d="M12 28l10 10 22-22" stroke={trail.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{color:trail.color}}>Módulo concluído!</h2>
            <p>+{mod.xp} XP adicionados ao seu perfil</p>
            <p className="complete-redirect">Voltando para a trilha...</p>
          </div>
        ) : mod.type === 'quiz' ? (
          <QuizModule mod={mod} trail={trail} onComplete={handleComplete} />
        ) : mod.type === 'lesson' ? (
          <LessonModule mod={mod} trail={trail} onComplete={handleComplete} />
        ) : (
          <VideoModule mod={mod} trail={trail} onComplete={handleComplete} />
        )}
      </div>
    </AppShell>
  )
}
