import { v4 as uuidv4 } from 'uuid'
import { format, isBefore, parseISO, startOfDay, addDays, addWeeks, addMonths } from 'date-fns'

const KEY = 'student-os-tasks'

function get() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function set(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

export function getTasks() { return get() }

function computeNextDue(currentDue, recurring) {
  if (!currentDue || !recurring?.enabled) return null
  const base = parseISO(currentDue)
  switch (recurring.type) {
    case 'daily': return format(addDays(base, recurring.interval || 1), 'yyyy-MM-dd')
    case 'weekly': return format(addWeeks(base, recurring.interval || 1), 'yyyy-MM-dd')
    case 'monthly': return format(addMonths(base, recurring.interval || 1), 'yyyy-MM-dd')
    default: return null
  }
}

export function saveTask(data) {
  const tasks = get()
  if (data.id) {
    const idx = tasks.findIndex(t => t.id === data.id)
    if (idx >= 0) tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() }
  } else {
    data.id = uuidv4(); data.createdAt = new Date().toISOString(); data.completedAt = null
    tasks.unshift(data)
  }
  set(tasks)
  return data
}

export function deleteTask(id) { set(get().filter(t => t.id !== id)) }

export function toggleTaskStatus(id) {
  const tasks = get()
  const idx = tasks.findIndex(t => t.id === id)
  if (idx >= 0) {
    const task = tasks[idx]
    if (task.status !== 'completed') {
      if (task.recurring?.enabled && task.dueDate) {
        const nextDue = computeNextDue(task.dueDate, task.recurring)
        const newTask = { ...task, id: uuidv4(), dueDate: nextDue, status: 'pending', completedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        tasks.push(newTask)
      }
      task.status = 'completed'
      task.completedAt = new Date().toISOString()
    } else {
      task.status = 'pending'
      task.completedAt = null
    }
    task.updatedAt = new Date().toISOString()
  }
  set(tasks)
  return tasks[idx]
}

export function getTasksByStatus(status) {
  return get().filter(t => (status === 'overdue'
    ? t.status !== 'completed' && t.dueDate && isBefore(parseISO(t.dueDate), startOfDay(new Date()))
    : t.status === status
  )).sort((a, b) => a.dueDate?.localeCompare(b.dueDate) || 0)
}

export function getUpcomingTasks(days = 7) {
  const today = startOfDay(new Date())
  const end = addDays(today, days)
  return get().filter(t =>
    t.status !== 'completed' && t.dueDate &&
    !isBefore(parseISO(t.dueDate), today) &&
    isBefore(parseISO(t.dueDate), end)
  ).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export function getOverdueTasks() {
  return getTasksByStatus('overdue')
}

export function getTodayTasks() {
  const today = format(new Date(), 'yyyy-MM-dd')
  return get().filter(t =>
    t.status !== 'completed' && t.dueDate === today
  )
}

export function getTasksBySubject(subjectId) {
  return get().filter(t => t.subjectId === subjectId)
}
