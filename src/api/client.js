const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(BASE_URL + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw { ...err, _status: res.status }
  }
  if (res.status === 204) return null
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (data) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),
}

// ── User ──────────────────────────────────────────────────────────────────────
export const user = {
  profile: () => request('/user/profile'),
  dashboard: () => request('/user/dashboard'),
  achievements: () => request('/user/achievements'),
}

// ── Courses ───────────────────────────────────────────────────────────────────
export const courses = {
  list: (filter = 'all', search = '') =>
    request(`/courses?filter=${filter}&search=${encodeURIComponent(search)}`),

  get: (id) => request(`/courses/${id}`),

  create: (data) =>
    request('/courses', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  addLesson: (courseId, data) =>
    request(`/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),

  updateLesson: (courseId, lessonId, data) =>
    request(`/courses/${courseId}/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteLesson: (courseId, lessonId) =>
    request(`/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' }),

  delete: (id) =>
    request(`/courses/${id}`, { method: 'DELETE' }),

  enroll: (code) =>
    request('/courses/enroll', { method: 'POST', body: JSON.stringify({ code }) }),
}

// ── Trails ────────────────────────────────────────────────────────────────────
export const trails = {
  list: () => request('/trails'),
  get: (id) => request(`/trails/${id}`),
}

// ── Activities ────────────────────────────────────────────────────────────────
export const activities = {
  completeTrailModule: (moduleId, data = {}) =>
    request(`/activities/trail-module/${moduleId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeLesson: (lessonId) =>
    request(`/activities/lessons/${lessonId}/complete`, { method: 'POST', body: '{}' }),

  completeCourse: (courseId) =>
    request(`/activities/courses/${courseId}/complete`, { method: 'POST', body: '{}' }),
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
export const leaderboard = {
  get: (period = 'week', tab = 'individual') =>
    request(`/leaderboard?period=${period}&tab=${tab}`),
}

// ── Institution ───────────────────────────────────────────────────────────────
export const institution = {
  stats: () => request('/institution/stats'),
  courseStats: (courseId) => request(`/institution/courses/${courseId}/stats`),
}
