import { useState } from 'react'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: 'trail',
    label: 'Trilhas',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 4h12M3 9h8M3 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="13.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: 'leaderboard',
    label: 'Ranking',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2l1.8 3.6 4 .6-2.9 2.8.7 4L9 11l-3.6 1.9.7-4L3.2 6.2l4-.6L9 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function AppShell({ user, onNavigate, onLogout, activePage, children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`shell ${collapsed ? 'shell--collapsed' : ''}`}>
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo" onClick={() => onNavigate('dashboard')}>
          <div className="sidebar-logo-icon">G</div>
          {!collapsed && (
            <span className="sidebar-logo-text">Gamify<em>Pro</em></span>
          )}
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {!collapsed && (
                <span className="sidebar-item-label">{item.label}</span>
              )}
              {activePage === item.id && (
                <span className="sidebar-active-pip" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom: user + actions */}
        <div className="sidebar-bottom">

          {/* User info */}
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name ?? 'Usuário'}</div>
                <div className="sidebar-user-xp">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{marginRight:'3px'}}>
                    <path d="M5 1l1.2 2.4 2.7.4-1.95 1.9.46 2.7L5 7.4 2.57 8.44l.46-2.7L1.1 3.8l2.7-.4L5 1z" fill="#fbbf24"/>
                  </svg>
                  {(user?.xp ?? 0).toLocaleString('pt-BR')} XP
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-divider" />

          {/* Collapse toggle */}
          <button
            className="sidebar-action-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d={collapsed ? 'M6 4l4 4-4 4' : 'M10 4L6 8l4 4'}
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            {!collapsed && <span>Recolher</span>}
          </button>

          {/* Logout */}
          <button
            className="sidebar-action-btn sidebar-logout"
            onClick={onLogout}
            title="Sair"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10.5 2.5h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M7 11l3.5-3L7 5M10.5 8H2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!collapsed && <span>Sair</span>}
          </button>

        </div>
      </aside>

      <main className="shell-main">
        {children}
      </main>
    </div>
  )
}
