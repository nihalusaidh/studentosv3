import { v4 as uuidv4 } from 'uuid'

const KEY = 'student-os-gpa-semesters'
const GRADE_POINTS = { 'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0 }

export function getGradePoint(grade) { return GRADE_POINTS[grade] || 0 }
export function getGradeFromPercent(pct) {
  if (pct >= 90) return 'S'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  if (pct >= 40) return 'E'
  return 'F'
}

function get() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function set(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

export function getSemesters() { return get() }

export function saveSemester(data) {
  const semesters = get()
  if (data.id) {
    const idx = semesters.findIndex(s => s.id === data.id)
    if (idx >= 0) semesters[idx] = { ...semesters[idx], ...data }
  } else {
    data.id = uuidv4(); data.createdAt = new Date().toISOString()
    semesters.push(data)
  }
  set(semesters); return data
}

export function deleteSemester(id) { set(get().filter(s => s.id !== id)) }

export function calculateGPA(subjects) {
  if (!subjects || subjects.length === 0) return { gpa: 0, totalCredits: 0, earnedCredits: 0, subjects: [] }
  let totalPoints = 0, totalCredits = 0, earnedCredits = 0
  const results = subjects.map(sub => {
    const credit = Number(sub.credits) || 3
    const pct = Number(sub.percentage) || 0
    const grade = getGradeFromPercent(pct)
    const points = getGradePoint(grade)
    totalPoints += points * credit
    totalCredits += credit
    if (grade !== 'F') earnedCredits += credit
    return { ...sub, grade, points, credit }
  })
  return { gpa: totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0, totalCredits, earnedCredits, subjects: results }
}

export function calculateCGPA(semesters) {
  let totalPoints = 0, totalCredits = 0
  semesters.forEach(sem => {
    (sem.subjects || []).forEach(sub => {
      const credit = Number(sub.credits) || 3
      const pct = Number(sub.percentage) || 0
      const grade = getGradeFromPercent(pct)
      totalPoints += getGradePoint(grade) * credit
      totalCredits += credit
    })
  })
  return totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0
}

export function getEmptySubjects(count = 5) {
  return Array.from({ length: count }, () => ({ name: '', credits: 3, percentage: '' }))
}
