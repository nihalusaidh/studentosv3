export function checkTutorAccess(profile) {
  if (!profile) return { allowed: false, message: 'Sign in to use AI Board Tutor', needsUpgrade: false }
  if (profile.plan === 'premium_plus') return { allowed: true }
  if (profile.plan === 'premium') return { allowed: false, message: 'AI Board Tutor requires Premium+ plan', needsUpgrade: true, upgradeTier: 'premium_plus' }
  return { allowed: false, message: 'AI Board Tutor requires Premium+ plan', needsUpgrade: true, upgradeTier: 'premium_plus' }
}
