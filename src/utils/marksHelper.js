export function calculateTotalPercentage(components) {
  if (!components || components.length === 0) return 0
  let totalScored = 0
  let totalConducted = 0
  components.forEach(c => {
    totalScored += c.scored || 0
    totalConducted += c.conducted || 0
  })
  if (totalConducted === 0) return 0
  return Math.round((totalScored / totalConducted) * 100)
}

export function calculateWeightedScore(components) {
  if (!components || components.length === 0) return 0
  let weightedSum = 0
  let totalWeight = 0
  components.forEach(c => {
    const weight = c.weight || 1
    const pct = c.conducted > 0 ? (c.scored / c.conducted) * 100 : 0
    weightedSum += pct * weight
    totalWeight += weight
  })
  if (totalWeight === 0) return 0
  return Math.round(weightedSum / totalWeight)
}

export function getGradeFromPercentage(percentage) {
  if (percentage >= 90) return { grade: 'S', description: 'Outstanding' }
  if (percentage >= 80) return { grade: 'A', description: 'Excellent' }
  if (percentage >= 70) return { grade: 'B', description: 'Good' }
  if (percentage >= 60) return { grade: 'C', description: 'Average' }
  if (percentage >= 50) return { grade: 'D', description: 'Pass' }
  return { grade: 'F', description: 'Fail' }
}
