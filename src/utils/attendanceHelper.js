export function calculateAttendancePercentage(attended, total) {
  if (total === 0) return 0
  return Math.round((attended / total) * 100)
}

export function isSafe(percentage) {
  return percentage >= 75
}

export function classesNeededFor75(attended, total) {
  if (total === 0) return 0
  let needed = 0
  let newTotal = total
  let newAttended = attended
  while (newAttended / newTotal < 0.75) {
    newTotal++
    newAttended++
    needed++
    if (needed > 100) break
  }
  return needed
}

export function classesCanMiss(attended, total) {
  let canMiss = 0
  let newTotal = total
  let newAttended = attended
  while (newAttended / newTotal >= 0.75) {
    newTotal++
    canMiss++
    if (canMiss > 100) break
  }
  return Math.max(0, canMiss - 1)
}

export function getAttendanceStatus(percentage) {
  if (percentage >= 85) return { label: 'Excellent', color: 'var(--success)' }
  if (percentage >= 75) return { label: 'Safe', color: 'var(--success)' }
  if (percentage >= 65) return { label: 'Warning', color: 'var(--warning)' }
  return { label: 'Critical', color: 'var(--danger)' }
}
