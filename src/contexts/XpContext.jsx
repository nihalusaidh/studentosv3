import { createContext, useContext } from 'react'
import { doc, increment, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'
import { LEVEL_THRESHOLDS, ACHIEVEMENTS } from '../data/constants'

const XpContext = createContext(null)

function getLevel(xp) {
  let level = LEVEL_THRESHOLDS[0]
  for (const l of LEVEL_THRESHOLDS) {
    if (xp >= l.xp) level = l
  }
  return level
}

export function XpProvider({ children }) {
  const { user, profile, setProfile } = useAuth()

  const awardXp = async (amount, reason) => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    const oldLevel = profile ? getLevel(profile.xp || 0) : LEVEL_THRESHOLDS[0]
    const newXp = (profile?.xp || 0) + amount
    const newLevel = getLevel(newXp)

    await updateDoc(userRef, { xp: increment(amount) })

    const updates = { xp: newXp }
    if (newLevel.level > oldLevel.level) {
      updates.level = newLevel.level
    }

    const achievement = ACHIEVEMENTS.find(a => a.id === reason)
    if (achievement && profile && !profile.achievements?.includes(reason)) {
      const { doc: fDoc, arrayUnion: fUnion } = await import('firebase/firestore')
      updates.achievements = fUnion(reason)
    }

    if (profile) {
      setProfile({ ...profile, ...updates })
    }

    return { newLevel, levelUp: newLevel.level > oldLevel.level, achievement }
  }

  return (
    <XpContext.Provider value={{ awardXp, getLevel }}>
      {children}
    </XpContext.Provider>
  )
}

export const useXp = () => useContext(XpContext)
