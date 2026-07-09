import { useState, useEffect } from 'react'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { useXp } from '../../contexts/XpContext'
import Button from '../ui/Button'
import GlassCard from '../ui/GlassCard'
import { Gift, Check } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function DailyCheckin() {
  const { user, profile, setProfile } = useAuth()
  const { awardXp } = useXp()
  const [checkedIn, setCheckedIn] = useState(false)

  useEffect(() => {
    if (profile?.lastCheckin) {
      const last = new Date(profile.lastCheckin)
      const today = new Date()
      setCheckedIn(
        last.getFullYear() === today.getFullYear() &&
        last.getMonth() === today.getMonth() &&
        last.getDate() === today.getDate()
      )
    }
  }, [profile?.lastCheckin])

  const handleCheckin = async () => {
    if (!user || checkedIn) return
    try {
      const today = new Date().toISOString()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yStr = yesterday.toISOString().split('T')[0]
      const lastStr = profile?.lastCheckin?.split('T')[0]

      const newStreak = lastStr === yStr ? (profile?.streak || 0) + 1 : 1

      await updateDoc(doc(db, 'users', user.uid), {
        lastCheckin: today,
        streak: newStreak,
        xp: increment(10)
      })

      await awardXp(10, 'daily_checkin')
      setProfile(prev => ({ ...prev, lastCheckin: today, streak: newStreak, xp: (prev?.xp || 0) + 10 }))
      setCheckedIn(true)
      toast.success('Check-in complete! +10 XP')
    } catch {
      toast.error('Check-in failed')
    }
  }

  if (checkedIn) {
    return (
      <GlassCard className="p-4 flex items-center gap-3 opacity-60">
        <div className="w-10 h-10 rounded-xl bg-[var(--success)]/20 flex items-center justify-center">
          <Check size={20} className="text-[var(--success)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-primary">Checked In</p>
          <p className="text-xs text-secondary">Come back tomorrow!</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--warning)]/20 flex items-center justify-center">
            <Gift size={20} className="text-[var(--warning)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">Daily Check-in</p>
            <p className="text-xs text-secondary">Claim your reward!</p>
          </div>
        </div>
        <Button size="sm" onClick={handleCheckin}>Claim</Button>
      </div>
    </GlassCard>
  )
}
