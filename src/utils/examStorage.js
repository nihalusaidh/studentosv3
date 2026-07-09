import { v4 as uuidv4 } from 'uuid'
import { format, differenceInDays, parseISO, isBefore } from 'date-fns'

const KEY = 'student-os-exams'
const CAL_KEY = 'student-os-calendar-events'

function get() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function set(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

function getCal() {
  try { const r = localStorage.getItem(CAL_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function setCal(data) { localStorage.setItem(CAL_KEY, JSON.stringify(data)) }

function syncToCalendar(exam) {
  const events = getCal()
  const calId = `exam-${exam.id}`
  const existing = events.findIndex(e => e.id === calId)
  const calEvent = {
    id: calId,
    title: `📝 ${exam.title}`,
    date: exam.examDate,
    startTime: exam.startTime || '',
    endTime: exam.endTime || '',
    description: exam.syllabus ? `Syllabus: ${exam.syllabus}` : (exam.notes || ''),
    location: exam.room || '',
    color: exam.color || '#ef4444',
    type: 'exam',
    source: 'exam'
  }
  if (existing >= 0) { events[existing] = { ...events[existing], ...calEvent, updatedAt: new Date().toISOString() } }
  else { calEvent.createdAt = new Date().toISOString(); events.push(calEvent) }
  setCal(events)
}

function removeFromCalendar(examId) {
  setCal(getCal().filter(e => e.id !== `exam-${examId}`))
}

export function getExams() { return get() }

export function saveExam(data) {
  const exams = get()
  if (data.id) {
    const idx = exams.findIndex(e => e.id === data.id)
    if (idx >= 0) exams[idx] = { ...exams[idx], ...data, updatedAt: new Date().toISOString() }
  } else {
    data.id = uuidv4(); data.createdAt = new Date().toISOString()
    exams.push(data)
  }
  exams.sort((a, b) => a.examDate.localeCompare(b.examDate) || (a.startTime || '').localeCompare(b.startTime || ''))
  set(exams)
  syncToCalendar(data)
  return data
}

export function deleteExam(id) {
  removeFromCalendar(id)
  set(get().filter(e => e.id !== id))
}

export function getUpcomingExams() {
  const now = new Date()
  return get().filter(e => !isBefore(parseISO(e.examDate), now))
    .sort((a, b) => a.examDate.localeCompare(b.examDate) || (a.startTime || '').localeCompare(b.startTime || ''))
}

export function getPastExams() {
  const now = new Date()
  return get().filter(e => isBefore(parseISO(e.examDate), now))
    .sort((a, b) => b.examDate.localeCompare(a.examDate))
}

export function getNextExam() {
  const upcoming = getUpcomingExams()
  return upcoming.length > 0 ? upcoming[0] : null
}

export function getExamCountdown(exam) {
  if (!exam) return null
  const days = differenceInDays(parseISO(exam.examDate), new Date())
  if (days < 0) return { days: 0, label: 'Past', urgent: false }
  if (days === 0) return { days: 0, label: 'Today!', urgent: true }
  if (days === 1) return { days: 1, label: 'Tomorrow!', urgent: true }
  if (days <= 7) return { days, label: `${days} days`, urgent: true }
  return { days, label: `${days} days`, urgent: false }
}

export function getExamsByMonth() {
  const exams = get()
  const grouped = {}
  exams.forEach(e => {
    const month = format(parseISO(e.examDate), 'MMMM yyyy')
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(e)
  })
  return grouped
}
