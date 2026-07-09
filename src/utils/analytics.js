import { doc, updateDoc, increment, setDoc, collection, getDocs, query, orderBy, where, limit, addDoc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 min
const SESSION_KEY = 'as_session'
const PAGE_START_KEY = 'as_page_start'

export const PAGE_NAMES = {
  dashboard: 'Dashboard', attendance: 'Attendance', internals: 'Internal Marks',
  calendar: 'Calendar', habits: 'Habits', tasks: 'Tasks', exams: 'Exams',
  grades: 'GPA Calculator', notes: 'Notes Hub', profile: 'Profile',
  settings: 'Settings', leaderboard: 'Leaderboard', admin: 'Admin Panel',
  students: 'Students', premium: 'Premium', 'ai-workspace': 'AI Workspace',
  'create-profile': 'Create Profile', tutor: 'Board Tutor', home: 'Home',
  login: 'Login'
}

function pageKey(pathname) { return (pathname || '/').split('/')[1] || 'home' }
function pageName(pathname) { return PAGE_NAMES[pageKey(pathname)] || pageKey(pathname) }
function today() { return new Date().toISOString().split('T')[0] }
function now() { return Date.now() }
function detectDevice() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1024
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}
function detectBrowser() {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent || ''
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'other'
}

// ─── Session Management ──────────────────────────────────────────

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (now() - s.start < SESSION_TIMEOUT) return s
    }
  } catch {}
  const session = { id: crypto.randomUUID?.() || `s_${now()}_${Math.random().toString(36).slice(2)}`, start: now(), pages: [], lastPage: null, lastTime: now() }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

function saveSession(s) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch {}
}

export function endSession() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}

// ─── Daily Counter Updates ────────────────────────────────────────

async function updateDaily(docId, updates) {
  try { await updateDoc(doc(db, 'analytics', docId), updates) }
  catch {
    const init = { date: today(), total_views: 0, total_sessions: 0, total_bounces: 0, active_uids: [], total_time: 0 }
    const pages = Object.keys(PAGE_NAMES)
    for (const p of pages) {
      init[`page_${p}_free`] = 0; init[`page_${p}_premium`] = 0
      init[`page_${p}_premium_plus`] = 0; init[`page_${p}_total`] = 0
      init[`time_${p}`] = 0
    }
    const events = ['signup', 'premium_grant', 'premium_plus_grant', 'ai_usage', 'board_tutor', 'login', 'habit_complete', 'exam_added', 'task_complete', 'flashcard_study', 'export_data']
    for (const e of events) { init[`event_${e}`] = 0 }
    init.session_0_30 = 0; init.session_30_120 = 0; init.session_120_600 = 0; init.session_600_plus = 0
    init.device_mobile = 0; init.device_desktop = 0; init.device_tablet = 0
    init.browser_chrome = 0; init.browser_firefox = 0; init.browser_safari = 0; init.browser_edge = 0; init.browser_other = 0
    init.users_new = 0; init.users_returning = 0
    try { await setDoc(doc(db, 'analytics', docId), init); await updateDoc(doc(db, 'analytics', docId), updates) } catch {}
  }
}

// ─── Main Track Functions ─────────────────────────────────────────

export async function trackPageView(pathname, profile, session) {
  const pk = pageKey(pathname)
  const plan = profile?.plan || 'free'
  const d = today()
  const docId = `daily_${d}`

  const updates = { total_views: increment(1), [`page_${pk}_${plan}`]: increment(1), [`page_${pk}_total`]: increment(1) }
  updates[`device_${detectDevice()}`] = increment(1)
  updates[`browser_${detectBrowser().toLowerCase()}`] = increment(1)

  // Track unique active users
  if (profile?.uid) {
    try {
      const ref = doc(db, 'analytics', docId)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        const uids = data.active_uids || []
        if (!uids.includes(profile.uid)) {
          updates.active_uids = [...uids, profile.uid]
          updates[data.loginCount && data.loginCount > 1 ? 'users_returning' : 'users_new'] = increment(1)
        }
      } else {
        updates.active_uids = [profile.uid]
        updates.users_new = increment(1)
      }
    } catch {}
  }

  // Track session page
  if (session) {
    session.lastPage = pk
    session.lastTime = now()
    if (!session.pages.includes(pk)) session.pages.push(pk)
    saveSession(session)
  }

  // Track time on previous page
  try {
    const prevPage = sessionStorage.getItem(PAGE_START_KEY)
    if (prevPage) {
      const { page, time } = JSON.parse(prevPage)
      const elapsed = Math.round((now() - time) / 1000)
      if (elapsed > 0 && elapsed < 3600) {
        updates[`time_${page}`] = increment(elapsed)
        updates.total_time = increment(elapsed)
      }
    }
  } catch {}
  sessionStorage.setItem(PAGE_START_KEY, JSON.stringify({ page: pk, time: now() }))

  await updateDaily(docId, updates)
}

export async function trackSessionEnd(session, profile) {
  if (!session) return
  const d = today()
  const docId = `daily_${d}`
  const duration = Math.round((now() - session.start) / 1000) // seconds
  const pageCount = session.pages.length || 1

  const updates = { total_sessions: increment(1) }
  if (pageCount <= 1) updates.total_bounces = increment(1)

  if (duration < 30) updates.session_0_30 = increment(1)
  else if (duration < 120) updates.session_30_120 = increment(1)
  else if (duration < 600) updates.session_120_600 = increment(1)
  else updates.session_600_plus = increment(1)

  // Track page transitions
  if (session.pages.length >= 2) {
    const transitions = session.pages.slice(0, -1).map((p, i) => `${p}→${session.pages[i + 1]}`)
    if (transitions.length > 0) {
      const batch = writeBatch(db)
      const flowDoc = doc(db, 'analytics', `flow_${d}`)
      for (const t of transitions.slice(0, 5)) {
        batch.set(flowDoc, { [`flow_${t}`]: increment(1) }, { merge: true })
      }
      try { await batch.commit() } catch {}
    }
  }

  await updateDaily(docId, updates)
  endSession()
}

export async function trackEvent(eventName, profile) {
  const plan = profile?.plan || 'free'
  const d = today()
  const docId = `daily_${d}`
  const updates = { [`event_${eventName}`]: increment(1) }

  // Also log to events subcollection for detailed analysis
  try {
    await addDoc(collection(db, 'analytics_events'), {
      event: eventName, plan, uid: profile?.uid || 'anon',
      timestamp: serverTimestamp(), date: d
    })
  } catch {}

  await updateDaily(docId, updates)
}

// ─── Fetch Functions ──────────────────────────────────────────────

export async function fetchAnalytics(days = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const startDate = cutoff.toISOString().split('T')[0]
  const dailyData = []
  const totals = { views: 0, sessions: 0, bounces: 0, time: 0, free: 0, premium: 0, premium_plus: 0, newUsers: 0, returningUsers: 0 }
  const pageStats = {}
  const eventTotals = {}
  const flowData = {}
  const deviceStats = { mobile: 0, desktop: 0, tablet: 0 }
  const browserStats = {}
  const sessionDurations = { under30: 0, '30_120': 0, '120_600': 0, over600: 0 }
  const activeDays = {}
  const dailyViews = []
  const dailyUsers = []
  const dailySessions = []
  const dailyBounce = []

  try {
    const q = query(collection(db, 'analytics'), where('date', '>=', startDate), orderBy('date', 'asc'))
    const snap = await getDocs(q)
    snap.forEach(d => {
      const data = d.data()
      const entry = { date: data.date, views: 0, sessions: 0 }
      const views = data.total_views || 0
      const sessions = data.total_sessions || 0
      entry.views = views; entry.sessions = sessions
      dailyViews.push({ date: data.date, views })
      dailyUsers.push({ date: data.date, users: (data.active_uids || []).length })
      dailySessions.push({ date: data.date, sessions })
      dailyBounce.push({ date: data.date, rate: sessions > 0 ? Math.round(((data.total_bounces || 0) / sessions) * 100) : 0 })

      totals.views += views
      totals.sessions += sessions
      totals.bounces += data.total_bounces || 0
      totals.time += data.total_time || 0

      for (const key of Object.keys(data)) {
        if (key.startsWith('page_')) {
          const parts = key.split('_')
          const p = parts[1]; const t = parts.slice(2).join('_') || 'total'
          if (!pageStats[p]) pageStats[p] = { free: 0, premium: 0, premium_plus: 0, total: 0, time: 0, name: PAGE_NAMES[p] || p }
          pageStats[p][t] = (pageStats[p][t] || 0) + data[key]
        }
        if (key.startsWith('time_') && key !== 'total_time') {
          const p = key.slice(5)
          if (!pageStats[p]) pageStats[p] = { free: 0, premium: 0, premium_plus: 0, total: 0, time: 0, name: PAGE_NAMES[p] || p }
          pageStats[p].time += data[key] || 0
        }
        if (key.startsWith('event_')) {
          const e = key.slice(6)
          eventTotals[e] = (eventTotals[e] || 0) + data[key]
        }
        if (key.startsWith('device_')) deviceStats[key.slice(7)] = (deviceStats[key.slice(7)] || 0) + data[key]
        if (key.startsWith('browser_')) browserStats[key.slice(8)] = (browserStats[key.slice(8)] || 0) + data[key]
        if (key.startsWith('session_')) sessionDurations[key.slice(8)] = (sessionDurations[key.slice(8)] || 0) + data[key]
      }

      totals.free += data.page_dashboard_free || 0
      totals.premium += data.page_dashboard_premium || 0
      totals.premium_plus += data.page_dashboard_premium_plus || 0
      totals.newUsers += data.users_new || 0
      totals.returningUsers += data.users_returning || 0

      if (data.active_uids) {
        for (const uid of data.active_uids) { activeDays[uid] = (activeDays[uid] || 0) + 1 }
      }
      dailyData.push(entry)
    })

    // Fetch flow data
    try {
      const flowQ = query(collection(db, 'analytics'), where('date', '>=', startDate), orderBy('date', 'asc'))
      const flowSnap = await getDocs(flowQ)
      flowSnap.forEach(d => {
        const data = d.data()
        if (d.id.startsWith('flow_')) {
          for (const key of Object.keys(data)) {
            if (key.startsWith('flow_')) flowData[key.slice(5)] = (flowData[key.slice(5)] || 0) + data[key]
          }
        }
      })
    } catch {}
  } catch {}

  // Top flows
  const topFlows = Object.entries(flowData).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => {
    const parts = k.split('→')
    return { from: PAGE_NAMES[parts[0]] || parts[0], to: PAGE_NAMES[parts[1]] || parts[1], count: v }
  })

  const pageList = Object.values(pageStats).sort((a, b) => b.total - a.total)

  const totalPlan = totals.free + totals.premium + totals.premium_plus

  // Avg time per page
  for (const p of pageList) {
    p.avgTime = p.total > 0 && p.time > 0 ? Math.round(p.time / p.total) : 0
  }

  return {
    totals,
    pageStats: pageList,
    events: Object.entries(eventTotals).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ name: k, count: v })),
    devices: Object.entries(deviceStats).filter(([_, v]) => v > 0).map(([k, v]) => ({ name: k, value: v })),
    browsers: Object.entries(browserStats).filter(([_, v]) => v > 0).map(([k, v]) => ({ name: k, value: v })),
    sessions: Object.entries(sessionDurations).filter(([_, v]) => v > 0).map(([k, v]) => ({ name: k, value: v })),
    flows: topFlows,
    charts: { dailyViews, dailyUsers, dailySessions, dailyBounce },
    retention: { newUsers: totals.newUsers, returningUsers: totals.returningUsers },
    days
  }
}

export async function fetchRealtime() {
  const d = today()
  const docId = `daily_${d}`
  try {
    const snap = await getDoc(doc(db, 'analytics', docId))
    if (!snap.exists()) return { activeToday: 0, viewsToday: 0, sessionsToday: 0 }
    const data = snap.data()
    return {
      activeToday: (data.active_uids || []).length,
      viewsToday: data.total_views || 0,
      sessionsToday: data.total_sessions || 0,
      bouncesToday: data.total_bounces || 0
    }
  } catch { return { activeToday: 0, viewsToday: 0, sessionsToday: 0 } }
}

export async function updateAdminPlan(uid, plan) {
  try { await updateDoc(doc(db, 'users', uid), { plan }); return true }
  catch { return false }
}
