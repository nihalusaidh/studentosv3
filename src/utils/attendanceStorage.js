import { v4 as uuidv4 } from 'uuid'
import { addDays, eachDayOfInterval, format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'

const STORAGE_KEY = 'student-os-attendance'
const HISTORY_KEY = 'student-os-semester-history'

export function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { subjects: [], sessions: [] }
  } catch {
    return { subjects: [], sessions: [] }
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getSubjects() {
  return getData().subjects
}

export function getSubject(id) {
  return getData().subjects.find(s => s.id === id)
}

export function saveSubject(data) {
  const store = getData()
  if (data.id) {
    const idx = store.subjects.findIndex(s => s.id === data.id)
    if (idx >= 0) {
      store.subjects[idx] = data
      const oldSessions = store.sessions.filter(s => s.subjectId === data.id)
      const keepOld = data.startDate && data.endDate
        ? oldSessions.filter(s => s.date >= data.startDate && s.date <= data.endDate)
        : oldSessions
      store.sessions = store.sessions.filter(s => s.subjectId !== data.id)
      keepOld.forEach(s => store.sessions.push(s))
      generateSessionsForSubject(data, store)
    }
  } else {
    data.id = uuidv4()
    data.createdAt = new Date().toISOString()
    store.subjects.push(data)
    generateSessionsForSubject(data, store)
  }
  saveData(store)
  return data
}

export function deleteSubject(id) {
  const store = getData()
  store.subjects = store.subjects.filter(s => s.id !== id)
  store.sessions = store.sessions.filter(s => s.subjectId !== id)
  saveData(store)
}

function generateSessionsForSubject(subject, store) {
  const schedule = subject.schedule || []
  if (!subject.startDate || !subject.endDate || !schedule.length) return
  const start = parseISO(subject.startDate)
  const end = parseISO(subject.endDate)
  const days = eachDayOfInterval({ start, end })
  const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }

  const existingKeys = new Set(
    store.sessions.filter(s => s.subjectId === subject.id).map(s => `${s.date}_${s.slotId}`)
  )

  days.forEach(day => {
    const weekday = format(day, 'EEEE').toLowerCase()
    schedule.forEach(slot => {
      if (slot.day.toLowerCase() !== weekday) return
      const dateStr = format(day, 'yyyy-MM-dd')
      const key = `${dateStr}_${slot.slotId}`
      if (!existingKeys.has(key)) {
        store.sessions.push({
          id: uuidv4(),
          subjectId: subject.id,
          slotId: slot.slotId,
          date: dateStr,
          weekday: format(day, 'EEEE'),
          startTime: slot.startTime || '09:00',
          endTime: slot.endTime || '09:50',
          status: 'unmarked',
          markedAt: null,
          isLocked: false,
          holidayReason: null
        })
      }
    })
  })
}

export function getSessions(subjectId) {
  return getData().sessions.filter(s => s.subjectId === subjectId)
}

export function getAllSessions() {
  return getData().sessions
}

export function markAttendance(sessionId, status) {
  const store = getData()
  const session = store.sessions.find(s => s.id === sessionId)
  if (!session) return null
  if (session.isLocked) return { error: 'Session is locked' }
  if (session.status === 'holiday') return { error: 'Holiday dates cannot be marked' }

  const subject = store.subjects.find(s => s.id === session.subjectId)
  if (subject?.semesterCompleted) return { error: 'Semester is completed. Attendance is locked.' }

  const now = new Date()
  const sessionDate = parseISO(session.date)
  const today = format(now, 'yyyy-MM-dd')

  if (isAfter(sessionDate, startOfDay(now))) {
    return { error: 'Future classes cannot be marked' }
  }

  session.status = status
  session.markedAt = now.toISOString()
  saveData(store)
  return { success: true, session }
}

export function markHoliday(sessionIds, reason, type = 'college holiday') {
  const store = getData()
  sessionIds.forEach(id => {
    const session = store.sessions.find(s => s.id === id)
    if (session) {
      session.status = 'holiday'
      session.holidayReason = reason
      session.isLocked = true
    }
  })
  saveData(store)
}

export function removeHoliday(sessionId) {
  const store = getData()
  const session = store.sessions.find(s => s.id === sessionId)
  if (session && session.status === 'holiday') {
    session.status = 'unmarked'
    session.holidayReason = null
    session.isLocked = false
  }
  saveData(store)
}

export function calculateAttendance(subjectId) {
  const sessions = getSessions(subjectId)
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')

  const totalScheduled = sessions.length
  const conducted = sessions.filter(s => (s.status === 'present' || s.status === 'absent') && s.date <= today)
  const present = sessions.filter(s => s.status === 'present' && s.date <= today)
  const absent = sessions.filter(s => s.status === 'absent' && s.date <= today)
  const holidays = sessions.filter(s => s.status === 'holiday')
  const unmarked = sessions.filter(s => s.status === 'unmarked' && s.date <= today && !s.isLocked)
  const locked = sessions.filter(s => s.isLocked)
  const upcoming = sessions.filter(s => s.date > today)
  const todaySessions = sessions.filter(s => s.date === today)

  const conductedCount = conducted.length
  const presentCount = present.length
  const absentCount = absent.length
  const holidayCount = holidays.length
  const upcomingCount = upcoming.length
  const pendingToday = todaySessions.filter(s => s.status === 'unmarked' && !s.isLocked).length

  const percentage = conductedCount > 0 ? Math.round((presentCount / conductedCount) * 100) : 0

  return {
    totalScheduled, conductedCount, presentCount, absentCount, holidayCount,
    unmarkedCount: unmarked.length, lockedCount: locked.length, upcomingCount,
    todayCount: todaySessions.length, pendingToday, percentage, todaySessions
  }
}

export function getRecovery(subjectId, requiredPct = 75) {
  const stats = calculateAttendance(subjectId)
  const { conductedCount, presentCount, upcomingCount } = stats
  if (conductedCount === 0) return { needed: 0, message: 'No classes yet' }
  const currentPct = (presentCount / conductedCount) * 100
  if (currentPct >= requiredPct) return { needed: 0, message: 'Already above target' }

  let needed = 0
  let tc = conductedCount
  let tp = presentCount
  while (tc > 0 && (tp / tc) < (requiredPct / 100) && needed <= upcomingCount + 100) {
    tc++
    tp++
    needed++
  }

  return {
    needed,
    message: needed <= upcomingCount
      ? `Attend next ${needed} classes to reach ${requiredPct}%`
      : `Need ${needed} classes but only ${upcomingCount} remain`
  }
}

export function getSkipCount(subjectId, requiredPct = 75) {
  const stats = calculateAttendance(subjectId)
  const { conductedCount, presentCount } = stats
  if (conductedCount === 0) return { canSkip: 0, message: 'No classes yet' }
  const currentPct = (presentCount / conductedCount) * 100
  if (currentPct < requiredPct) return { canSkip: 0, message: 'Below required percentage' }

  let canSkip = 0
  let tc = conductedCount
  let tp = presentCount
  while (tc > 0 && (tp / tc) >= (requiredPct / 100)) {
    tc++
    canSkip++
    if (canSkip > 500) break
  }
  canSkip = Math.max(0, canSkip - 1)

  return {
    canSkip,
    message: canSkip > 0 ? `Safely skip ${canSkip} more classes` : 'Cannot skip any'
  }
}

export function completeSemester(subjectId) {
  const store = getData()
  const subject = store.subjects.find(s => s.id === subjectId)
  if (!subject) return null
  subject.semesterCompleted = true

  store.sessions.filter(s => s.subjectId === subjectId).forEach(s => { s.isLocked = true })

  const stats = calculateAttendance(subjectId)
  const historyEntry = {
    id: uuidv4(),
    subjectName: subject.name,
    faculty: subject.faculty || '',
    semester: subject.semester || 'Unknown',
    color: subject.color || '#a855f7',
    stats: {
      presentCount: stats.presentCount,
      absentCount: stats.absentCount,
      conductedCount: stats.conductedCount,
      holidayCount: stats.holidayCount,
      percentage: stats.percentage,
      totalScheduled: stats.totalScheduled
    },
    completedAt: new Date().toISOString()
  }

  let history = []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    history = raw ? JSON.parse(raw) : []
  } catch { history = [] }
  history.push(historyEntry)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))

  saveData(store)
  return historyEntry
}

export function getSemesterHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function deleteSemesterHistory(id) {
  let history = getSemesterHistory()
  history = history.filter(h => h.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function getInsights() {
  const store = getData()
  const insights = []
  const today = format(new Date(), 'yyyy-MM-dd')

  store.subjects.filter(s => !s.semesterCompleted).forEach(sub => {
    const stats = calculateAttendance(sub.id)
    const recovery = getRecovery(sub.id, sub.requiredPct || 75)
    const skip = getSkipCount(sub.id, sub.requiredPct || 75)

    if (stats.pendingToday > 0) insights.push(`"${sub.name}" has ${stats.pendingToday} class to mark today.`)
    if (stats.percentage < (sub.requiredPct || 75) && stats.conductedCount > 0) {
      insights.push(`"${sub.name}" is at risk. ${recovery.message}`)
    }
    if (skip.canSkip > 0) insights.push(`You can skip ${skip.canSkip} "${sub.name}" class safely.`)
  })

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  if (store.subjects.length > 0) {
    const best = store.subjects.reduce((best, sub) => {
      if (sub.semesterCompleted) return best
      const stats = calculateAttendance(sub.id)
      return stats.percentage > (best.pct || 0) && stats.conductedCount > 0 ? { name: sub.name, pct: stats.percentage } : best
    }, { name: '', pct: 0 })
    if (best.name) insights.push(`"${best.name}" has the best attendance (${best.pct}%).`)
  }

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  let missedThisWeek = 0
  store.sessions.forEach(s => {
    const d = parseISO(s.date)
    if (d >= weekStart && s.status === 'absent' && !s.isLocked) missedThisWeek++
  })
  if (missedThisWeek > 0) insights.push(`You missed ${missedThisWeek} classes this week.`)

  return insights
}
