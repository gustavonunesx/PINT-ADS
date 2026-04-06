import { useEffect } from 'react'

export default function LandingPage({ user, onNavigate, onLogout }) {
  useEffect(() => {
    // Scroll reveal
    const els = document.querySelectorAll('.reveal, .step')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.delay || 0
          setTimeout(() => e.target.classList.add('visible'), Number(delay))
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.15 })
    els.forEach(el => obs.observe(el))

    // Stat counters
    const animateCounter = (el, target, suffix) => {
      let start = 0
      const step = target / (1800 / 16)
      const update = () => {
        start = Math.min(start + step, target)
        el.textContent = Math.round(start) + suffix
        if (start < target) requestAnimationFrame(update)
      }
      requestAnimationFrame(update)
    }
    const statObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target, parseInt(e.target.dataset.target), e.target.dataset.suffix || '')
          statObs.unobserve(e.target)
        }
      })
    }, { threshold: 0.5 })
    document.querySelectorAll('[data-target]').forEach(el => statObs.observe(el))

    // Dashboard bars
    const dashObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          document.querySelectorAll('.dash-bar .fill').forEach(b => { b.style.height = b.dataset.h })
          document.querySelectorAll('.dp-bar-fill').forEach(f => { f.style.width = f.dataset.w })
          dashObs.unobserve(e.target)
        }
      })
    }, { threshold: 0.3 })
    const dash = document.querySelector('.dashboard-mock')
    if (dash) dashObs.observe(dash)

    // Benefit cards stagger
    const grid = document.querySelector('.benefits-grid')
    if (grid) {
      const cards = grid.querySelectorAll('.benefit-card')
      cards.forEach(c => {
        c.style.opacity = '0'
        c.style.transform = 'translateY(18px)'
        c.style.transition = 'opacity 0.45s ease, transform 0.45s ease, background 0.22s'
      })
      const gridObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            cards.forEach((c, i) => setTimeout(() => { c.style.opacity = '1'; c.style.transform = 'translateY(0)' }, i * 90))
            gridObs.unobserve(e.target)
          }
        })
      }, { threshold: 0.1 })
      gridObs.observe(grid)
    }

    // Step delays
    document.querySelectorAll('.step').forEach((s, i) => { s.style.transitionDelay = `${i * 0.1}s` })

    // Smooth scroll
    const handleClick = (e) => {
      e.preventDefault()
      const t = document.querySelector(e.currentTarget.getAttribute('href'))
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const links = document.querySelectorAll('a[href^="#"]')
    links.forEach(l => l.addEventListener('click', handleClick))

    // Parallax glow
    const onScroll = () => {
      const glow = document.querySelector('.hero-glow')
      if (glow) glow.style.transform = `translate(${window.scrollY * 0.04}px, ${window.scrollY * 0.06}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      obs.disconnect(); statObs.disconnect(); dashObs.disconnect()
      links.forEach(l => l.removeEventListener('click', handleClick))
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const benefits = [
    ['🎮','Alta Adesão','Mecânicas de gamificação que reduzem a resistência e estimulam a participação dos colaboradores.'],
    ['🔥','Engajamento Real','Conteúdos dinâmicos e interativos que transformam a obrigatoriedade em interesse genuíno.'],
    ['🧠','Retenção de Conhecimento','Atividades práticas, trilhas personalizadas e feedback contínuo que ampliam a absorção em até 3×.'],
    ['⚙️','Padronização e Controle','Centralize treinamentos obrigatórios com atualização simples e uniformidade em toda a organização.'],
    ['📊','Dashboard Completo','Acompanhe conclusões, notas e progresso por equipe com alertas inteligentes de compliance.'],
    ['📈','Escalabilidade Total','Inclua novos treinamentos, áreas e times sem complexidade operacional adicional.'],
    ['🔒','Segurança & Cultura Tech','Ambiente aderente à cultura tecnológica, reforçando inovação e aprendizagem contínua.'],
  ]

  const features = [
    ['🏆','Rankings & Competição Saudável','Leaderboards por time ou empresa que aumentam o envolvimento e criam senso de progresso coletivo.'],
    ['🎯','Trilhas Personalizadas por Cargo','Cada colaborador recebe um caminho de aprendizagem relevante ao seu papel e senioridade.'],
    ['⚡','Formatos Interativos','Quiz, vídeos e microlearning que tornam o conteúdo fácil de absorver e aplicar no dia a dia.'],
    ['📡','Monitoramento em Tempo Real','Alertas proativos, histórico completo e relatórios para auditoria e tomada de decisão.'],
    ['🔔','Lembretes Inteligentes','Automações que notificam colaboradores e gestores sobre prazos, reduzindo inadimplência.'],
    ['🌐','Integração Corporativa','Conecta com Slack, Teams, HRIS e SSO para uma experiência fluida sem barreiras de acesso.'],
  ]

  const steps = [
    ['Crie ou importe trilhas','Suba conteúdos existentes ou construa módulos interativos com quiz, vídeos e desafios práticos.'],
    ['Atribua por equipe ou área','Configure quem recebe qual treinamento, prazos e lembretes automáticos personalizados.'],
    ['Colaboradores se engajam','Pontos, badges e rankings mantêm a motivação do início ao fim da trilha.'],
    ['Acompanhe em tempo real','Dashboard completo com alertas de compliance e relatórios exportáveis para gestores.'],
  ]

  return (
    <>
      {/* ─── NAV ─── */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-logo">Gamify<em>Pro</em></div>
          <ul className="nav-links">
            <li><a href="#beneficios">Benefícios</a></li>
            <li><a href="#como-funciona">Como Funciona</a></li>
            <li><a href="#funcionalidades">Funcionalidades</a></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
          <div className="nav-auth">
            {user ? (
              <>
                <span className="nav-user-name">Olá, {user.name.split(' ')[0]}</span>
                <button className="nav-login" onClick={onLogout}>Sair</button>
              </>
            ) : (
              <>
                <button className="nav-login"  onClick={() => onNavigate('login')}>Entrar</button>
                <button className="nav-signup" onClick={() => onNavigate('register')}>Criar conta</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-glow-right" />
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-eyebrow"><span className="dot" />Plataforma Corporativa de Treinamento</div>
            <h1>Treinamentos obrigatórios<br />que as pessoas<br /><em>querem fazer.</em></h1>
            <p>Transforme compliance e capacitação em experiências motivadoras com gamificação, trilhas personalizadas e monitoramento em tempo real.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => onNavigate('register')}>Criar conta grátis</button>
              <button className="btn-ghost">Ver demonstração</button>
            </div>
            <div className="hero-stats">
              {[['94','%','Taxa de adesão'],['3','×','Mais retenção'],['100','%','Compliance']].map(([t,s,l]) => (
                <div className="stat-card" key={l}>
                  <div className="stat-value" data-target={t} data-suffix={s}>0{s}</div>
                  <div className="stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right">
            <div className="float-card">
              <div className="float-card-top">
                <div className="float-card-icon green">📈</div>
                <span className="float-badge up">+12% semana</span>
              </div>
              <div className="float-card-label">Engajamento geral</div>
              <div className="float-card-value">87<span style={{fontSize:'0.9rem',color:'var(--text-muted)'}}>%</span></div>
              <div className="float-progress">
                {[['Segurança','92%','var(--accent)'],['LGPD','78%','var(--accent2)'],['Governança','65%','#fbbf24']].map(([l,p,c]) => (
                  <div className="fp-row" key={l}>
                    <span style={{minWidth:'68px'}}>{l}</span>
                    <div className="fp-bar"><div className="fp-fill" style={{width:p,background:c}} /></div>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="float-card">
              <div className="float-card-top">
                <div className="float-card-icon blue">👥</div>
                <span className="float-badge live">● Ao vivo</span>
              </div>
              <div className="float-card-label">Colaboradores ativos agora</div>
              <div className="float-card-value">143</div>
              <div className="float-avatars">
                {[['A','#3be8b0'],['R','#63c8ff'],['M','#fbbf24'],['L','#a78bfa'],['C','#f87171']].map(([l,c]) => (
                  <div className="float-avatar" key={l} style={{background:c}}>{l}</div>
                ))}
                <span className="float-avatar-count">+138 mais</span>
              </div>
            </div>

            <div className="float-card">
              <div className="float-card-top">
                <div className="float-card-icon amber">🏆</div>
                <span className="float-badge new">Novo</span>
              </div>
              <div className="float-card-label">Conquista desbloqueada</div>
              <div className="float-card-value" style={{fontSize:'1rem',marginTop:'0.05rem'}}>Mestre em Compliance</div>
              <div className="float-card-sub">Ana completou 5 trilhas obrigatórias</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENEFÍCIOS ─── */}
      <section className="benefits" id="beneficios">
        <div className="wrapper">
          <div className="benefits-header reveal">
            <div className="section-eyebrow">Por que GamifyPro</div>
            <h2 className="section-title">Benefícios que impactam<br />a sua operação</h2>
            <p className="section-desc">Sete pilares desenhados para resolver os desafios reais de empresas de base tecnológica.</p>
          </div>
          <div className="benefits-grid">
            {benefits.map(([icon, title, desc]) => (
              <div className="benefit-card" key={title}>
                <div className="benefit-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section className="how" id="como-funciona">
        <div className="wrapper">
          <div className="how-inner">
            <div>
              <div className="section-eyebrow reveal">Como funciona</div>
              <h2 className="section-title reveal">Do onboarding ao<br />compliance em um<br />único lugar.</h2>
              <div className="how-steps">
                {steps.map(([h, p], i) => (
                  <div className="step" key={i}>
                    <div className="step-num">{i + 1}</div>
                    <div className="step-content"><h4>{h}</h4><p>{p}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="dashboard-mock reveal">
              <div className="dash-top">
                <div className="dash-dot r" /><div className="dash-dot y" /><div className="dash-dot g" />
                <span className="dash-title">GamifyPro · Dashboard</span>
              </div>
              <div className="dash-section-label">Conclusões por mês</div>
              <div className="dash-bars">
                {['55%','70%','45%','85%','60%','95%','78%'].map((h,i) => (
                  <div className="dash-bar" key={i}><div className="fill" data-h={h} /></div>
                ))}
              </div>
              <div className="dash-section-label">Progresso por trilha</div>
              <div className="dash-progress-list">
                {[['Segurança da Info.','92%'],['Compliance & LGPD','87%'],['Governança Interna','74%'],['Boas Práticas Dev','96%']].map(([label,pct]) => (
                  <div className="dash-progress-item" key={label}>
                    <span className="dp-label">{label}</span>
                    <div className="dp-bar-bg"><div className="dp-bar-fill" data-w={pct} /></div>
                    <span className="dp-pct">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FUNCIONALIDADES ─── */}
      <section className="features-strip" id="funcionalidades">
        <div className="wrapper">
          <div className="features-strip-header reveal">
            <div className="section-eyebrow">Funcionalidades</div>
            <h2 className="section-title">Tudo que sua empresa<br />de tecnologia precisa.</h2>
          </div>
          <div className="features-list">
            {features.map(([icon, title, desc]) => (
              <div className="feature-item reveal" key={title}>
                <div className="fi-icon">{icon}</div>
                <div className="fi-text"><h4>{title}</h4><p>{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section" id="contato">
        <div className="wrapper">
          <div className="cta-inner reveal">
            <div className="section-eyebrow">Pronto para começar?</div>
            <h2>Eleve a cultura de<br />aprendizagem da sua empresa.</h2>
            <p>Comece gratuitamente e veja como o GamifyPro transforma treinamentos obrigatórios em vantagem competitiva.</p>
            <div className="cta-actions">
              <button className="btn-primary" onClick={() => onNavigate('register')}>Criar conta grátis</button>
              <button className="btn-ghost"   onClick={() => onNavigate('login')}>Já tenho uma conta</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">GamifyPro</div>
          <div>Plataforma Gamificada para Treinamentos Corporativos</div>
          <div>© 2025 GamifyPro. Todos os direitos reservados.</div>
        </div>
      </footer>
    </>
  )
}
