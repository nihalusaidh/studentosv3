import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'student-os-marks'
const DEFAULT_GRADES = [
  { grade: 'S', minPct: 90, description: 'Outstanding' },
  { grade: 'A', minPct: 80, description: 'Excellent' },
  { grade: 'B', minPct: 70, description: 'Good' },
  { grade: 'C', minPct: 60, description: 'Average' },
  { grade: 'D', minPct: 50, description: 'Pass' },
  { grade: 'F', minPct: 0, description: 'Fail' }
]

function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { subjects: [], settings: { gradeScale: DEFAULT_GRADES } }
  } catch {
    return { subjects: [], settings: { gradeScale: DEFAULT_GRADES } }
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
    if (idx >= 0) store.subjects[idx] = { ...store.subjects[idx], ...data, gradingType: data.gradingType || 'absolute', updatedAt: new Date().toISOString() }
  } else {
    data.id = uuidv4()
    data.assessments = data.assessments || []
    data.groups = data.groups || []
    data.gradingType = data.gradingType || 'absolute'
    data.createdAt = new Date().toISOString()
    data.updatedAt = data.createdAt
    store.subjects.push(data)
  }
  saveData(store)
  return data.id ? data : store.subjects[store.subjects.length - 1]
}

export function deleteSubject(id) {
  const store = getData()
  store.subjects = store.subjects.filter(s => s.id !== id)
  saveData(store)
}

export function addAssessment(subjectId, assessment) {
  const store = getData()
  const subject = store.subjects.find(s => s.id === subjectId)
  if (!subject) return null
  assessment.id = uuidv4()
  assessment.marks = null
  assessment.status = assessment.status || 'upcoming'
  subject.assessments.push(assessment)
  subject.updatedAt = new Date().toISOString()
  saveData(store)
  return assessment
}

export function updateAssessment(subjectId, assessmentId, updates) {
  const store = getData()
  const subject = store.subjects.find(s => s.id === subjectId)
  if (!subject) return null
  const idx = subject.assessments.findIndex(a => a.id === assessmentId)
  if (idx === -1) return null
  subject.assessments[idx] = { ...subject.assessments[idx], ...updates }
  subject.updatedAt = new Date().toISOString()
  saveData(store)
  return subject.assessments[idx]
}

export function deleteAssessment(subjectId, assessmentId) {
  const store = getData()
  const subject = store.subjects.find(s => s.id === subjectId)
  if (!subject) return
  subject.assessments = subject.assessments.filter(a => a.id !== assessmentId)
  subject.updatedAt = new Date().toISOString()
  saveData(store)
}

export function saveMarks(subjectId, assessmentId, marksData) {
  const store = getData()
  const subject = store.subjects.find(s => s.id === subjectId)
  if (!subject) return { error: 'Subject not found' }
  const assessment = subject.assessments.find(a => a.id === assessmentId)
  if (!assessment) return { error: 'Assessment not found' }
  if (assessment.status === 'cancelled') return { error: 'Cannot mark a cancelled assessment' }

  const existingMarks = assessment.marks
  assessment.marks = {
    obtained: marksData.obtained !== undefined ? Number(marksData.obtained) : null,
    isAbsent: !!marksData.isAbsent,
    isMedicalLeave: !!marksData.isMedicalLeave,
    isNotConducted: !!marksData.isNotConducted,
    isCancelled: !!marksData.isCancelled,
    isRevaluation: !!marksData.isRevaluation,
    revisedMarks: marksData.revisedMarks !== undefined ? Number(marksData.revisedMarks) : null,
    remarks: marksData.remarks || ''
  }
  assessment.status = 'completed'
  subject.updatedAt = new Date().toISOString()

  if (existingMarks) {
    if (!subject.history) subject.history = []
    subject.history.push({
      id: uuidv4(),
      assessmentId,
      assessmentName: assessment.name,
      date: new Date().toISOString(),
      oldMarks: existingMarks.obtained,
      newMarks: assessment.marks.obtained,
      reason: marksData.editReason || 'Updated marks'
    })
  }

  saveData(store)
  return { success: true, assessment }
}

export function getGradeScale() {
  return getData().settings.gradeScale || DEFAULT_GRADES
}

export function updateGradeScale(scale) {
  const store = getData()
  store.settings.gradeScale = scale
  saveData(store)
}

export function getHistory(subjectId) {
  const subject = getSubject(subjectId)
  return subject?.history || []
}

export function calculateInternalMarks(subjectId) {
  const subject = getSubject(subjectId)
  if (!subject) return null
  const { assessments, internalMax, weightageMode } = subject
  const completed = assessments.filter(a => a.status === 'completed' && a.marks)
  let earned = 0
  let maxPoints = 0
  let weightedPct = 0

  if (weightageMode === 'direct') {
    completed.forEach(a => {
      const obtained = a.marks.isAbsent ? 0 : (a.marks.obtained !== null ? a.marks.obtained : 0)
      earned += obtained
      maxPoints += a.weightage || a.maxMarks
    })
    const pct = internalMax > 0 ? Math.round((earned / internalMax) * 100) : 0
    return { earned: Math.round(earned * 10) / 10, max: internalMax, percentage: Math.min(pct, 100), weightedPct: 0 }
  }

  if (weightageMode === 'percentage') {
    let totalWeight = 0
    completed.forEach(a => {
      if (a.marks.obtained !== null || a.marks.isAbsent) {
        const obtained = a.marks.isAbsent ? 0 : a.marks.obtained
        const pct = a.maxMarks > 0 ? (obtained / a.maxMarks) : 0
        weightedPct += pct * a.weightage
        totalWeight += a.weightage
      }
    })
    if (totalWeight > 0) weightedPct = (weightedPct / totalWeight) * 100
    earned = (weightedPct / 100) * internalMax
    return { earned: Math.round(earned * 10) / 10, max: internalMax, percentage: Math.round(weightedPct), weightedPct: Math.round(weightedPct) }
  }

  return { earned: 0, max: internalMax, percentage: 0, weightedPct: 0 }
}

export function calculateSubjectResult(subjectId) {
  const subject = getSubject(subjectId)
  if (!subject) return null
  const internal = calculateInternalMarks(subjectId)
  const totalMax = subject.internalMax + subject.externalMax
  const earnedInternal = internal.earned

  const remainingInternal = Math.max(0, subject.internalMax - earnedInternal)
  const maxPossibleInternal = subject.internalMax

  const passingInternalMet = earnedInternal >= subject.passingInternal

  return {
    subject,
    internal,
    totalMax,
    earnedInternal,
    remainingInternal,
    maxPossibleInternal,
    passingInternalMet,
    externalMax: subject.externalMax,
    passingExternal: subject.passingExternal
  }
}

export function predictGrade(subjectId, hypotheticalExternal = null, hypotheticalInternal = null, gradingTypeOverride = null) {
  const subject = getSubject(subjectId)
  if (!subject) return null
  const gradeScale = getGradeScale()
  const internal = calculateInternalMarks(subjectId)
  const internalPct = hypotheticalInternal !== null ? hypotheticalInternal : internal.percentage
  const internalMarks = (internalPct / 100) * subject.internalMax

  let externalPct = 0
  if (hypotheticalExternal !== null) {
    externalPct = subject.externalMax > 0 ? (hypotheticalExternal / subject.externalMax) * 100 : 0
  }

  const totalMarks = internalMarks + (hypotheticalExternal !== null ? hypotheticalExternal : 0)
  const totalPct = subject.internalMax + subject.externalMax > 0
    ? Math.round((totalMarks / (subject.internalMax + subject.externalMax)) * 100)
    : 0

  const gradeScaleSorted = [...gradeScale].sort((a, b) => b.minPct - a.minPct)
  let currentGrade = gradeScaleSorted.find(g => totalPct >= g.minPct)
  if (!currentGrade) currentGrade = gradeScaleSorted[gradeScaleSorted.length - 1]

  const isAbsolute = gradingTypeOverride !== null ? gradingTypeOverride === 'absolute' : subject.gradingType === 'absolute'

  let approxRange = null
  if (!isAbsolute) {
    const idx = gradeScaleSorted.findIndex(g => g.grade === currentGrade.grade)
    const upper = idx > 0 ? gradeScaleSorted[idx - 1] : null
    const lower = idx < gradeScaleSorted.length - 1 ? gradeScaleSorted[idx + 1] : null
    const rangeGrades = []
    if (upper) rangeGrades.push(upper.grade)
    rangeGrades.push(currentGrade.grade)
    if (lower) rangeGrades.push(lower.grade)
    approxRange = rangeGrades.join(' - ')
  }

  return {
    totalPct,
    totalMarks: Math.round(totalMarks * 10) / 10,
    internalPct,
    externalPct: Math.round(externalPct),
    grade: currentGrade.grade,
    gradeDesc: currentGrade.description,
    gradingType: isAbsolute ? 'absolute' : 'relative',
    approxRange
  }
}

export function simulateFullMarks(subjectId, assessmentOverrides, hypotheticalExternal, gradingTypeOverride = null) {
  const subject = getSubject(subjectId)
  if (!subject) return null

  const hypotheticalAssessments = subject.assessments.map(a => {
    const override = assessmentOverrides.find(o => o.assessmentId === a.id)
    if (override) {
      return { ...a, marks: { ...a.marks, obtained: override.hypotheticalMarks, isAbsent: false }, status: 'completed' }
    }
    return a
  })

  let earned = 0
  let weightedPct = 0

  if (subject.weightageMode === 'direct') {
    hypotheticalAssessments.filter(a => a.status === 'completed' && a.marks && a.marks.obtained !== null).forEach(a => {
      earned += a.marks.obtained
    })
    const pct = subject.internalMax > 0 ? Math.round((earned / subject.internalMax) * 100) : 0
    const result = predictGrade(subjectId, hypotheticalExternal, Math.min(pct, 100), gradingTypeOverride)
    return {
      internalProjected: { earned: Math.round(earned * 10) / 10, max: subject.internalMax, percentage: Math.min(pct, 100) },
      gradeResult: result
    }
  }

  if (subject.weightageMode === 'percentage') {
    let totalWeight = 0
    hypotheticalAssessments.filter(a => a.status === 'completed' && a.marks && a.marks.obtained !== null).forEach(a => {
      const pct = a.maxMarks > 0 ? (a.marks.obtained / a.maxMarks) : 0
      weightedPct += pct * a.weightage
      totalWeight += a.weightage
    })
    if (totalWeight > 0) weightedPct = (weightedPct / totalWeight) * 100
    earned = (weightedPct / 100) * subject.internalMax
    const result = predictGrade(subjectId, hypotheticalExternal, Math.round(weightedPct), gradingTypeOverride)
    return {
      internalProjected: { earned: Math.round(earned * 10) / 10, max: subject.internalMax, percentage: Math.round(weightedPct) },
      gradeResult: result
    }
  }

  return null
}

export function whatIf(subjectId, changes) {
  const subject = getSubject(subjectId)
  if (!subject) return null

  const gradeScale = getGradeScale()

  const hypotheticalAssessments = subject.assessments.map(a => {
    const change = changes.find(c => c.assessmentId === a.id)
    if (change) {
      return { ...a, marks: { ...a.marks, obtained: change.hypotheticalMarks, isAbsent: false }, status: 'completed' }
    }
    return a
  })

  let earned = 0
  let weightedPct = 0

  if (subject.weightageMode === 'direct') {
    hypotheticalAssessments.filter(a => a.status === 'completed' && a.marks && a.marks.obtained !== null).forEach(a => {
      earned += a.marks.obtained
    })
    const pct = subject.internalMax > 0 ? Math.round((earned / subject.internalMax) * 100) : 0
    const gradeScaleSorted = [...gradeScale].sort((a, b) => b.minPct - a.minPct)
    let grade = gradeScaleSorted.find(g => pct >= g.minPct)
    if (!grade) grade = gradeScaleSorted[gradeScaleSorted.length - 1]

    return {
      current: calculateInternalMarks(subjectId),
      projected: { earned: Math.round(earned * 10) / 10, max: subject.internalMax, percentage: Math.min(pct, 100) },
      grade: grade.grade,
      gradeDesc: grade.description,
      improvement: pct - calculateInternalMarks(subjectId).percentage
    }
  }

  if (subject.weightageMode === 'percentage') {
    let totalWeight = 0
    hypotheticalAssessments.filter(a => a.status === 'completed' && a.marks && a.marks.obtained !== null).forEach(a => {
      const pct = a.maxMarks > 0 ? (a.marks.obtained / a.maxMarks) : 0
      weightedPct += pct * a.weightage
      totalWeight += a.weightage
    })
    if (totalWeight > 0) weightedPct = (weightedPct / totalWeight) * 100
    earned = (weightedPct / 100) * subject.internalMax

    const gradeScaleSorted = [...gradeScale].sort((a, b) => b.minPct - a.minPct)
    let grade = gradeScaleSorted.find(g => Math.round(weightedPct) >= g.minPct)
    if (!grade) grade = gradeScaleSorted[gradeScaleSorted.length - 1]

    const current = calculateInternalMarks(subjectId)
    return {
      current,
      projected: { earned: Math.round(earned * 10) / 10, max: subject.internalMax, percentage: Math.round(weightedPct) },
      grade: grade.grade,
      gradeDesc: grade.description,
      improvement: Math.round(weightedPct) - current.percentage
    }
  }

  return null
}

export function getSemesterOverview() {
  const subjects = getSubjects()
  if (subjects.length === 0) return null

  let totalInternalPct = 0, count = 0
  let highest = { name: '', pct: 0, color: '' }
  let lowest = { name: '', pct: 100, color: '' }
  let atRisk = 0
  let upcomingCount = 0
  let completedCount = 0
  let totalCredits = 0

  subjects.forEach(sub => {
    const result = calculateSubjectResult(sub.id)
    if (!result) return
    const pct = result.internal.percentage

    if (sub.credits) totalCredits += sub.credits

    totalInternalPct += pct
    count++

    if (pct > highest.pct) highest = { name: sub.name, pct, color: sub.color }
    if (pct < lowest.pct) lowest = { name: sub.name, pct, color: sub.color }
    if (pct < 50) atRisk++

    sub.assessments.forEach(a => {
      if (a.status === 'upcoming') upcomingCount++
      if (a.status === 'completed') completedCount++
    })
  })

  const avgPct = count > 0 ? Math.round(totalInternalPct / count) : 0

  const gradeScale = getGradeScale()
  const gradeScaleSorted = [...gradeScale].sort((a, b) => b.minPct - a.minPct)
  let expectedGrade = gradeScaleSorted.find(g => avgPct >= g.minPct)
  if (!expectedGrade) expectedGrade = gradeScaleSorted[gradeScaleSorted.length - 1]

  return {
    subjectCount: count,
    avgPct,
    highest,
    lowest,
    atRisk,
    safeCount: count - atRisk,
    upcomingCount,
    completedCount,
    totalCredits,
    expectedGrade: expectedGrade.grade,
    expectedGradeDesc: expectedGrade.description
  }
}

export function getRiskAnalysis(subjectId) {
  const result = calculateSubjectResult(subjectId)
  if (!result) return null
  const { internal } = result
  const pct = internal.percentage

  let level, suggestions = []

  if (pct >= 80) {
    level = { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700', icon: 'check' }
    suggestions.push('You are performing excellently. Keep it up!')
  } else if (pct >= 60) {
    level = { label: 'Safe', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700', icon: 'safe' }
    const toNext = 80 - pct
    suggestions.push(`Scoring ${toNext}% more in remaining assessments can move you to Excellent.`)
  } else if (pct >= 40) {
    level = { label: 'Borderline', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700', icon: 'warning' }
    const toSafe = 60 - pct
    suggestions.push(`You need ${toSafe}% more to reach Safe zone.`)
    suggestions.push('Focus on upcoming assessments to improve your grade.')
  } else {
    level = { label: 'At Risk', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-700', icon: 'danger' }
    suggestions.push('You are at risk of failing. Prioritize this subject.')
    const toPass = 40 - pct
    if (toPass > 0) suggestions.push(`Need ${toPass}% more in remaining assessments to pass.`)
  }

  return { level, suggestions, pct }
}
