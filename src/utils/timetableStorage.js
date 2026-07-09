import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'

const KEY = 'student-os-timetable'

function get() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function set(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

export function getSlots() { return get() }

export function saveSlot(data) {
  const slots = get()
  if (data.id) {
    const idx = slots.findIndex(s => s.id === data.id)
    if (idx >= 0) slots[idx] = { ...slots[idx], ...data }
  } else {
    data.id = uuidv4(); data.createdAt = new Date().toISOString()
    slots.push(data)
  }
  set(slots)
  return data
}

export function deleteSlot(id) { set(get().filter(s => s.id !== id)) }

export function getSlotsForDay(day) {
  return get().filter(s => s.day === day && s.isActive !== false).sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function getTodaySlots() {
  const day = new Date().getDay()
  return getSlotsForDay(day)
}

export function getSubjectSlots(subjectId) {
  return get().filter(s => s.subjectId === subjectId)
}

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export { DAY_LABELS }

export function getDefaultTimeSlots() {
  const times = []
  for (let h = 7; h <= 18; h++) {
    times.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 18) times.push(`${String(h).padStart(2, '0')}:30`)
  }
  return times
}
