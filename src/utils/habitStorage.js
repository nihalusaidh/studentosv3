const STORAGE_KEY = 'habits'

export function getHabits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

export function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
}

export function createHabit(data) {
  const habits = getHabits()
  const now = new Date().toISOString()
  const habit = {
    id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: data.name || '',
    emoji: data.emoji || '🎯',
    color: data.color || '#6366f1',
    category: data.category || 'health',
    type: data.type || 'yesno',
    target: data.target ?? null,
    unit: data.unit || '',
    frequency: data.frequency || 'daily',
    customDays: data.customDays || [],
    reminder: data.reminder || null,
    notes: data.notes || '',
    priority: data.priority || 'medium',
    difficulty: data.difficulty || 'medium',
    xpValue: data.xpValue || 25,
    isPinned: data.isPinned || false,
    isArchived: data.isArchived || false,
    createdAt: now,
    updatedAt: now,
    completedDates: {},
    streak: 0,
    bestStreak: 0,
    lastCompletedDate: null
  }
  habits.push(habit)
  saveHabits(habits)
  return habit
}

export function updateHabit(id, updates) {
  const habits = getHabits()
  const idx = habits.findIndex(h => h.id === id)
  if (idx === -1) return null
  habits[idx] = { ...habits[idx], ...updates, updatedAt: new Date().toISOString() }
  saveHabits(habits)
  return habits[idx]
}

export function deleteHabit(id) {
  const habits = getHabits().filter(h => h.id !== id)
  saveHabits(habits)
}

export function toggleHabitComplete(id, dateStr, value = null) {
  const habits = getHabits()
  const idx = habits.findIndex(h => h.id === id)
  if (idx === -1) return null

  const habit = habits[idx]
  const existing = habit.completedDates[dateStr]
  const isCompleted = existing ? !existing.completed : true

  habit.completedDates[dateStr] = { completed: isCompleted, value: isCompleted ? value : null, completedAt: isCompleted ? new Date().toISOString() : null }
  habit.updatedAt = new Date().toISOString()

  if (isCompleted) {
    habit.lastCompletedDate = dateStr
    habit.streak = calculateStreak(habit.completedDates, habit.frequency, habit.customDays)
    if (habit.streak > (habit.bestStreak || 0)) habit.bestStreak = habit.streak
  } else {
    habit.streak = calculateStreak(habit.completedDates, habit.frequency, habit.customDays)
  }

  habits[idx] = habit
  saveHabits(habits)
  return { habit, isCompleted }
}

export function calculateStreak(completedDates, frequency, customDays) {
  const dates = Object.keys(completedDates).filter(d => completedDates[d].completed).sort().reverse()
  if (dates.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (frequency === 'daily') {
    let checkDate = new Date(today)
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (dates.includes(dateStr)) { streak++; checkDate.setDate(checkDate.getDate() - 1) }
      else if (i === 0) { checkDate.setDate(checkDate.getDate() - 1); continue }
      else break
    }
  } else if (frequency === 'weekly') {
    let checkDate = new Date(today)
    for (let i = 0; i < 52; i++) {
      const weekStart = new Date(checkDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      const inWeek = dates.some(d => { const dt = new Date(d); return dt >= weekStart && dt <= weekEnd })
      if (inWeek) { streak++; checkDate.setDate(checkDate.getDate() - 7) }
      else if (i === 0) { checkDate.setDate(checkDate.getDate() - 7); continue }
      else break
    }
  } else streak = dates.length

  return streak
}

export function getStreakData(habits) {
  let totalStreak = 0
  let bestStreak = 0
  let completionCount = 0
  const today = new Date().toISOString().split('T')[0]
  habits.forEach(h => {
    if (h.completedDates?.[today]?.completed) completionCount++
    if ((h.streak || 0) > totalStreak) totalStreak = h.streak || 0
    if ((h.bestStreak || 0) > bestStreak) bestStreak = h.bestStreak || 0
  })
  return { totalStreak, bestStreak, completionCount, habitCount: habits.length }
}

export function getHabitAnalytics(habits) {
  const today = new Date()
  const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  let weeklyCompleted = 0; let weeklyTotal = 0
  let monthlyCompleted = 0; let monthlyTotal = 0

  habits.forEach(h => {
    Object.entries(h.completedDates || {}).forEach(([dateStr, entry]) => {
      const dt = new Date(dateStr)
      if (entry.completed) {
        if (dt >= thirtyDaysAgo) monthlyCompleted++
        if (dt >= sevenDaysAgo) weeklyCompleted++
      }
      if (dt >= thirtyDaysAgo) monthlyTotal++
      if (dt >= sevenDaysAgo) weeklyTotal++
    })
  })

  return {
    weeklyRate: weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0,
    monthlyRate: monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0,
    weeklyCompleted, weeklyTotal, monthlyCompleted, monthlyTotal,
    totalHabits: habits.length,
    activeHabits: habits.filter(h => !h.isArchived).length
  }
}

export function duplicateHabit(id) {
  const habits = getHabits()
  const source = habits.find(h => h.id === id)
  if (!source) return null
  const { id: _, completedDates, streak, bestStreak, lastCompletedDate, ...rest } = source
  return createHabit({ ...rest, name: `${source.name} (copy)` })
}

export function archiveHabit(id) {
  return updateHabit(id, { isArchived: true })
}

export function unarchiveHabit(id) {
  return updateHabit(id, { isArchived: false })
}
