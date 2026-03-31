import { useState, useCallback } from 'react'
import LandingPage   from './pages/LandingPage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TrailPage     from './pages/TrailPage'
import ActivityPage  from './pages/ActivityPage'
import LeaderboardPage from './pages/LeaderboardPage'

export default function App() {
  const [page, setPage]   = useState('landing')
  const [user, setUser]   = useState(null)
  const [ctx,  setCtx]    = useState({})   // extra context (trailId, activityId…)

  const navigate = useCallback((p, extra = {}) => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setCtx(extra)
    setPage(p)
  }, [])

  const handleLogin    = (u) => { setUser(u); navigate('dashboard') }
  const handleRegister = (u) => { setUser(u); navigate('dashboard') }
  const handleLogout   = ()  => { setUser(null); navigate('landing') }

  const props = { user, onNavigate: navigate, onLogout: handleLogout, ctx }

  switch (page) {
    case 'login':       return <LoginPage      onLogin={handleLogin}       onNavigate={navigate} />
    case 'register':    return <RegisterPage   onRegister={handleRegister} onNavigate={navigate} />
    case 'dashboard':   return <DashboardPage  {...props} />
    case 'trail':       return <TrailPage      {...props} />
    case 'activity':    return <ActivityPage   {...props} />
    case 'leaderboard': return <LeaderboardPage {...props} />
    default:            return <LandingPage    {...props} />
  }
}
