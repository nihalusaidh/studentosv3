import { LEVEL_THRESHOLDS } from '../data/constants'

export function getLevel(xp) {
  let current = LEVEL_THRESHOLDS[0]
  for (const l of LEVEL_THRESHOLDS) {
    if (xp >= l.xp) current = l
  }
  return current
}

export function getNextLevel(xp) {
  const current = getLevel(xp)
  const nextIdx = LEVEL_THRESHOLDS.findIndex(l => l.level === current.level) + 1
  if (nextIdx >= LEVEL_THRESHOLDS.length) return null
  return LEVEL_THRESHOLDS[nextIdx]
}

export function getXpProgress(xp) {
  const current = getLevel(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  const currentXp = LEVEL_THRESHOLDS.find(l => l.level === current.level).xp
  const needed = next.xp - currentXp
  const earned = xp - currentXp
  return Math.min(100, Math.round((earned / needed) * 100))
}

export function calculateXPForFocus(minutes) {
  return Math.floor(minutes * 2)
}
