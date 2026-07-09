import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getHabits, saveHabits, createHabit, updateHabit, deleteHabit, toggleHabitComplete, duplicateHabit, archiveHabit, unarchiveHabit, getStreakData, getHabitAnalytics } from '../utils/habitStorage'
import { playHabitSound } from '../utils/habitSounds'
import { useXp } from './XpContext'

const HabitContext = createContext()

const XP_VALUES = { easy: 15, medium: 25, hard: 40 }

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [soundsEnabled, setSoundsEnabled] = useState(true)
  const [viewMode, setViewMode] = useState('daily')
  const { awardXp } = useXp()

  useEffect(() => {
    setHabits(getHabits())
    setLoading(false)
  }, [])

  const refresh = useCallback(() => {
    setHabits(getHabits())
  }, [])

  const addHabit = useCallback((data) => {
    const habit = createHabit(data)
    setHabits(getHabits())
    return habit
  }, [])

  const editHabit = useCallback((id, updates) => {
    const updated = updateHabit(id, updates)
    if (updated) setHabits(getHabits())
    return updated
  }, [])

  const removeHabit = useCallback((id) => {
    deleteHabit(id)
    setHabits(getHabits())
  }, [])

  const toggleComplete = useCallback((id, dateStr, value) => {
    if (!dateStr) dateStr = new Date().toISOString().split('T')[0]
    const result = toggleHabitComplete(id, dateStr, value)
    if (result) {
      setHabits(getHabits())
      if (soundsEnabled) playHabitSound(result.isCompleted ? 'complete' : 'uncomplete')
      if (result.isCompleted) {
        const habit = getHabits().find(h => h.id === id)
        const xp = XP_VALUES[habit?.difficulty] || 25
        awardXp(xp, 'habit_complete')
        if (habit?.streak > 0 && habit.streak % 7 === 0 && soundsEnabled) {
          setTimeout(() => playHabitSound('streak'), 400)
        }
      }
    }
    return result
  }, [soundsEnabled, awardXp])

  const copyHabit = useCallback((id) => {
    const habit = duplicateHabit(id)
    if (habit) setHabits(getHabits())
    return habit
  }, [])

  const archiveHabitById = useCallback((id) => {
    archiveHabit(id)
    setHabits(getHabits())
  }, [])

  const unarchiveHabitById = useCallback((id) => {
    unarchiveHabit(id)
    setHabits(getHabits())
  }, [])

  const toggleSound = useCallback(() => setSoundsEnabled(p => !p), [])

  const activeHabits = habits.filter(h => !h.isArchived)
  const archivedHabits = habits.filter(h => h.isArchived)
  const pinnedHabits = activeHabits.filter(h => h.isPinned)
  const unpinnedHabits = activeHabits.filter(h => !h.isPinned)

  const streakData = getStreakData(activeHabits)
  const analytics = getHabitAnalytics(habits)

  const value = {
    habits, activeHabits, archivedHabits, pinnedHabits, unpinnedHabits,
    loading, soundsEnabled, viewMode,
    streakData, analytics,
    setViewMode,
    refresh, setHabits: () => setHabits(getHabits()),
    addHabit, editHabit, removeHabit, toggleComplete,
    copyHabit, archiveHabitById, unarchiveHabitById,
    toggleSound
  }

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
}

export function useHabits() {
  const ctx = useContext(HabitContext)
  if (!ctx) throw new Error('useHabits must be used within HabitProvider')
  return ctx
}
