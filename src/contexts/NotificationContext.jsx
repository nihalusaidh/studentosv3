import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { getUpcomingExams, getExamCountdown } from '../utils/examStorage'
import { getOverdueTasks, getTasks } from '../utils/tasksStorage'
import { getHabits } from '../utils/habitStorage'
import { getData as getAttendance } from '../utils/attendanceStorage'

const NotificationContext = createContext()

const STORAGE_KEY = 'student-os-notifications'
const AUTO_KEY = 'student-os-auto-notif-seen'

function load() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

function getSeenIds() {
  try { return JSON.parse(localStorage.getItem(AUTO_KEY) || '[]') } catch { return [] }
}
function markSeen(id) {
  const seen = getSeenIds()
  if (!seen.includes(id)) { seen.push(id); localStorage.setItem(AUTO_KEY, JSON.stringify(seen)) }
}

function sendBrowserNotification(title, body) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'granted') {
    try { new Notification(title, { body, icon: '/favicon.svg' }) } catch {}
  }
}

export function NotificationProvider({ children }) {
  const { user, profile } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => { setNotifications(load()) }, [])

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const addNotification = useCallback((data) => {
    const n = {
      id: data.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 5)),
      title: data.title,
      message: data.message || '',
      type: data.type || 'info',
      link: data.link || null,
      read: false,
      createdAt: new Date().toISOString()
    }
    const existing = load()
    if (existing.some(e => e.id === n.id)) return n
    const updated = [n, ...existing.slice(0, 99)]
    save(updated)
    setNotifications(updated)

    if (data.browser !== false) {
      sendBrowserNotification(n.title, n.message)
    }
    return n
  }, [])

  const markRead = useCallback((id) => {
    const list = load()
    const idx = list.findIndex(n => n.id === id)
    if (idx >= 0) { list[idx].read = true; save(list); setNotifications(list) }
  }, [])

  const markAllRead = useCallback(() => {
    const list = load().map(n => ({ ...n, read: true }))
    save(list); setNotifications(list)
  }, [])

  const dismiss = useCallback((id) => {
    const list = load().filter(n => n.id !== id)
    save(list); setNotifications(list)
  }, [])

  const clearAll = useCallback(() => {
    save([]); setNotifications([])
  }, [])

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  useEffect(() => {
    if (!user) return
    const check = () => {
      const seen = getSeenIds()

      const exams = getUpcomingExams()
      exams.forEach(exam => {
        const cd = getExamCountdown(exam)
        if (cd && cd.days <= 3 && cd.days >= 0) {
          const nid = `exam-${exam.id}`
          if (!seen.includes(nid)) {
            addNotification({ id: nid, title: `Exam: ${exam.title}`, message: `${cd.label} — ${exam.subjectName || ''}`, type: 'exam', link: '/exams' })
            markSeen(nid)
          }
        }
      })

      const overdue = getOverdueTasks()
      overdue.forEach(task => {
        const nid = `overdue-${task.id}`
        if (!seen.includes(nid)) {
          addNotification({ id: nid, title: `Overdue: ${task.title}`, message: 'Task is past due date', type: 'deadline', link: '/tasks', browser: false })
          markSeen(nid)
        }
      })

      const allTasks = getTasks()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      allTasks.forEach(task => {
        if (!task.dueDate || task.status === 'completed') return
        const due = new Date(task.dueDate + 'T00:00:00')
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
        if (diff >= 0 && diff <= 1) {
          const nid = `due-${task.id}`
          if (!seen.includes(nid)) {
            addNotification({ id: nid, title: `Due: ${task.title}`, message: diff === 0 ? 'Due today!' : 'Due tomorrow', type: 'deadline', link: '/tasks' })
            markSeen(nid)
          }
        }
      })

      const habits = getHabits()
      const todayStr = new Date().toISOString().split('T')[0]
      habits.forEach(habit => {
        if (habit.streak > 0 && habit.lastCompletedDate !== todayStr) {
          const daysSinceLast = habit.lastCompletedDate
            ? Math.floor((Date.now() - new Date(habit.lastCompletedDate).getTime()) / (1000 * 60 * 60 * 24))
            : 99
          if (daysSinceLast === 1) {
            const nid = `streak-${habit.id}`
            if (!seen.includes(nid)) {
              addNotification({ id: nid, title: `Streak at risk: ${habit.name}`, message: `${habit.streak}-day streak! Complete today to keep it going.`, type: 'warning', link: '/habits' })
              markSeen(nid)
            }
          }
          if (daysSinceLast === 2) {
            const nid2 = `streak-lost-${habit.id}`
            if (!seen.includes(nid2)) {
              addNotification({ id: nid2, title: `Streak lost: ${habit.name}`, message: `Your ${habit.streak}-day streak was broken. Start a new one!`, type: 'warning', link: '/habits' })
              markSeen(nid2)
            }
          }
        }
      })

      const att = getAttendance()
      if (att?.sessions) {
        const now = new Date()
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const todayName = dayNames[now.getDay()]
        const currentHour = now.getHours()
        const currentMin = now.getMinutes()

        att.sessions.forEach(session => {
          if (session.status !== 'unmarked') return
          const slot = att.subjects?.find(s => s.id === session.subjectId)?.schedule?.find(sl => sl.slotId === session.slotId)
          if (!slot || slot.day !== todayName) return
          const [sh, sm] = (slot.startTime || '00:00').split(':').map(Number)
          const minsUntil = (sh * 60 + sm) - (currentHour * 60 + currentMin)
          if (minsUntil >= 0 && minsUntil <= 120) {
            const nid = `class-${session.id}`
            if (!seen.includes(nid)) {
              const subjectName = att.subjects?.find(s => s.id === session.subjectId)?.name || 'Class'
              addNotification({ id: nid, title: `Upcoming: ${subjectName}`, message: minsUntil <= 15 ? 'Starting now!' : `Starts in ${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m`, type: 'info', link: '/attendance' })
              markSeen(nid)
            }
          }
        })
      }
    }

    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [user, addNotification])

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, addNotification, markRead, markAllRead, dismiss, clearAll, requestBrowserPermission
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
