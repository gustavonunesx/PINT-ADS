import { useState, useCallback } from 'react'
import LandingPage          from './pages/LandingPage'
import LoginPage            from './pages/LoginPage'
import RegisterPage         from './pages/RegisterPage'
import DashboardPage        from './pages/DashboardPage'
import StudentDashboard     from './pages/StudentDashboard'
import InstitutionDashboard from './pages/InstitutionDashboard'
import TrailPage            from './pages/TrailPage'
import ActivityPage         from './pages/ActivityPage'
import LeaderboardPage      from './pages/LeaderboardPage'
import MyCoursesPage        from './pages/MyCoursesPage'
import CourseDetailPage     from './pages/CourseDetailPage'
import CoursePlayerPage     from './pages/CoursePlayerPage'

export default function App() {
  const [page, setPage] = useState('landing')
  const [user, setUser] = useState(null)
  const [ctx,  setCtx]  = useState({})

  const navigate = useCallback((p, extra = {}) => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setCtx(extra)
    setPage(p)
  }, [])

  const handleLogin = (u) => {
    setUser(u)
    // Login page doesn't collect type yet — default to student.
    // If you add a type field to LoginPage in the future, use u.type here.
    navigate(u.type === 'institution' ? 'institution' : 'dashboard')
  }

  const handleRegister = (u) => {
    setUser(u)
    navigate(u.type === 'institution' ? 'institution' : 'dashboard')
  }

  const handleLogout = () => { setUser(null); navigate('landing') }

  const props = { user, onNavigate: navigate, onLogout: handleLogout, ctx }

  switch (page) {
    case 'login':         return <LoginPage            onLogin={handleLogin}       onNavigate={navigate} />
    case 'register':      return <RegisterPage         onRegister={handleRegister} onNavigate={navigate} />
    case 'dashboard':     return <StudentDashboard     {...props} />
    case 'institution':   return <InstitutionDashboard {...props} />
    case 'trail':         return <TrailPage            {...props} />
    case 'activity':      return <ActivityPage         {...props} />
    case 'leaderboard':   return <LeaderboardPage      {...props} />
    case 'my-courses':    return <MyCoursesPage        {...props} />
    case 'course-detail': return <CourseDetailPage     {...props} />
    case 'course-player': return <CoursePlayerPage     {...props} />
    default:              return <LandingPage          {...props} />
  }
}
