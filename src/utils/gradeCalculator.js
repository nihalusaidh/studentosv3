import { GRADES } from '../data/constants'

export function getGrade(percentage) {
  for (const g of GRADES) {
    if (percentage >= g.min) return g
  }
  return GRADES[GRADES.length - 1]
}

export function requiredEndSemMarks(currentPercentage, endSemWeight, targetGrade) {
  const targetMin = GRADES.find(g => g.grade === targetGrade)?.min || 50
  if (currentPercentage >= targetMin) return 0
  const currentWeight = 100 - endSemWeight
  const currentContribution = (currentPercentage * currentWeight) / 100
  const required = (targetMin - currentContribution) / (endSemWeight / 100)
  return Math.ceil(Math.max(0, required))
}
