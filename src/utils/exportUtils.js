function toCsv(data, headers) {
  const rows = [headers.join(',')]
  data.forEach(item => {
    const row = headers.map(h => {
      const val = item[h] !== undefined ? item[h] : ''
      const str = String(val).replace(/"/g, '""')
      return `"${str}"`
    })
    rows.push(row.join(','))
  })
  return rows.join('\n')
}

function download(content, filename, type = 'text/csv') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportAttendance(data) {
  const headers = ['subject', 'date', 'status', 'startTime', 'endTime', 'type', 'notes']
  const rows = []
  data.subjects.forEach(sub => {
    const subSessions = (data.sessions || []).filter(s => s.subjectId === sub.id)
    subSessions.forEach(s => {
      rows.push({ subject: sub.name, date: s.date, status: s.status, startTime: s.startTime || '', endTime: s.endTime || '', type: s.type || 'regular', notes: s.notes || '' })
    })
  })
  return toCsv(rows, headers)
}

export function downloadAttendanceCsv(data) {
  const csv = exportAttendance(data)
  download(csv, `attendance-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportMarks(data) {
  const headers = ['subject', 'faculty', 'credits', 'assessment', 'marksObtained', 'maxMarks', 'weightage', 'status']
  const rows = []
  data.forEach(sub => {
    (sub.assessments || []).forEach(a => {
      rows.push({ subject: sub.name, faculty: sub.faculty || '', credits: sub.credits || '', assessment: a.name, marksObtained: a.obtained !== undefined ? a.obtained : '', maxMarks: a.maxMarks || '', weightage: a.weightage || '', status: a.status || '' })
    })
  })
  return toCsv(rows, headers)
}

export function downloadMarksCsv(data) {
  const csv = exportMarks(data)
  download(csv, `marks-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportTasks(data) {
  const headers = ['title', 'subject', 'dueDate', 'dueTime', 'priority', 'status', 'description', 'notes']
  const rows = data.map(t => ({ title: t.title, subject: t.subjectName || '', dueDate: t.dueDate || '', dueTime: t.dueTime || '', priority: t.priority || '', status: t.status || '', description: t.description || '', notes: t.notes || '' }))
  return toCsv(rows, headers)
}

export function downloadTasksCsv(data) {
  const csv = exportTasks(data)
  download(csv, `tasks-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function downloadAllData() {
  const keys = ['student-os-attendance', 'student-os-semester-history', 'student-os-marks', 'student-os-calendar-events', 'student-os-tasks', 'student-os-exams', 'student-os-gpa-semesters']
  const data = {}
  keys.forEach(key => {
    try { data[key] = JSON.parse(localStorage.getItem(key) || 'null') } catch { data[key] = null }
  })
  data._exportedAt = new Date().toISOString()
  data._version = '1.0'
  const json = JSON.stringify(data, null, 2)
  download(json, `student-os-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
}

// ─── Exams CSV ───

export function exportExams(data) {
  const headers = ['title', 'examDate', 'startTime', 'endTime', 'room', 'syllabus', 'maxMarks', 'type', 'notes', 'subjectName']
  return toCsv(data.map(e => ({
    title: e.title, examDate: e.examDate || '', startTime: e.startTime || '', endTime: e.endTime || '',
    room: e.room || '', syllabus: e.syllabus || '', maxMarks: e.maxMarks || '', type: e.type || '',
    notes: e.notes || '', subjectName: e.subjectName || ''
  })), headers)
}

export function downloadExamsCsv(data) {
  download(exportExams(data), `exams-${new Date().toISOString().slice(0, 10)}.csv`)
}

// ─── GPA / Grades CSV ───

export function exportGrades(data) {
  const headers = ['semester', 'subject', 'credits', 'percentage', 'grade', 'points']
  const rows = []
  data.forEach(sem => {
    (sem.subjects || []).forEach(sub => {
      const grade = sub.grade || ''
      const points = sub.points || ''
      rows.push({ semester: sem.name, subject: sub.name, credits: sub.credits || sub.credit || '', percentage: sub.percentage || '', grade, points })
    })
  })
  return toCsv(rows, headers)
}

export function downloadGradesCsv(data) {
  download(exportGrades(data), `grades-${new Date().toISOString().slice(0, 10)}.csv`)
}

// ─── Habits CSV ───

export function exportHabits(data) {
  const headers = ['name', 'category', 'type', 'frequency', 'priority', 'difficulty', 'streak', 'totalCompletions', 'createdAt', 'notes']
  return toCsv(data.map(h => ({
    name: h.name, category: h.category || '', type: h.type || '', frequency: h.frequency || '',
    priority: h.priority || '', difficulty: h.difficulty || '',
    streak: h.streak || 0, totalCompletions: Object.keys(h.completedDates || {}).length,
    createdAt: h.createdAt || '', notes: h.notes || ''
  })), headers)
}

export function downloadHabitsCsv(data) {
  download(exportHabits(data), `habits-${new Date().toISOString().slice(0, 10)}.csv`)
}

// ─── Calendar CSV ───

export function exportCalendar(data) {
  const headers = ['type', 'title', 'date', 'startTime', 'endTime', 'description', 'location', 'color', 'priority']
  const rows = []
  ;['events', 'holidays', 'reminders'].forEach(key => {
    ;(data[key] || []).forEach(item => {
      rows.push({
        type: key.slice(0, -1),
        title: item.title || '',
        date: item.date || '',
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        description: item.description || item.reason || item.notes || '',
        location: item.location || '',
        color: item.color || '',
        priority: item.priority || ''
      })
    })
  })
  return toCsv(rows, headers)
}

export function downloadCalendarCsv(data) {
  download(exportCalendar(data), `calendar-${new Date().toISOString().slice(0, 10)}.csv`)
}
