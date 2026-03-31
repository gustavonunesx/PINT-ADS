export default function AuthShell({ children, onNavigate }) {
  return (
    <div className="auth-page">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />

      <div className="auth-nav">
        <button className="auth-back" onClick={() => onNavigate('landing')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
        <div className="nav-logo" style={{position:'absolute',left:'50%',transform:'translateX(-50%)'}}>
          Gamify<em>Pro</em>
        </div>
      </div>

      <div className="auth-body">
        <div className="auth-panel">{children}</div>
        <div className="auth-side">
          <div className="auth-side-content">
            <div className="auth-side-quote">
              "Desde que implementamos o GamifyPro, nossa taxa de conclusão de treinamentos obrigatórios saiu de 34% para 96% em dois meses."
            </div>
            <div className="auth-side-author">
              <div className="auth-side-avatar">RM</div>
              <div>
                <div className="auth-side-name">Rafael Mendes</div>
                <div className="auth-side-role">Head de People · Fintech São Paulo</div>
              </div>
            </div>
            <div className="auth-side-stats">
              {[['94%','Adesão média'],['3×','Retenção'],['100%','Compliance']].map(([v,l]) => (
                <div className="auth-stat" key={l}>
                  <div className="auth-stat-value">{v}</div>
                  <div className="auth-stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
