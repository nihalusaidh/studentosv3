import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../config/firebase'

export function checkAiAccess(profile) {
  if (!profile) return { allowed: false, message: 'Sign in to use AI features', needsUpgrade: false }
  if (profile.plan === 'premium' || profile.plan === 'premium_plus') return { allowed: true }
  const tokens = profile.tokens ?? 0
  if (tokens > 0) return { allowed: true, remaining: tokens }
  return { allowed: false, message: 'AI features require a premium plan', needsUpgrade: true }
}

export async function deductToken(uid) {
  if (!uid) return
  await updateDoc(doc(db, 'users', uid), { tokens: increment(-1) })
}
