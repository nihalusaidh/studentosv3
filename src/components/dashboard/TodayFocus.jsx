import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../contexts/AuthContext'
import GlassCard from '../ui/GlassCard'
import { Target } from 'lucide-react'

export default function TodayFocus() {
  const { user } = useAuth()
  const [todayMinutes, setTodayMinutes] = useState(0)

  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const q = query(collection(db, 'focusSessions'), where('uid', '==', user.uid), where('date', '==', today))
    getDocs(q).then(snap => {
      let total = 0
      snap.forEach(d => { total += d.data().minutes || 0 })
      setTodayMinutes(total)
    }).catch(() => {})
  }, [user])

  const goal = 120

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-2)]/20 flex items-center justify-center">
          <Target size={20} className="text-[var(--accent-2)]" />
        </div>
        <div>
          <p className="text-xs text-muted">Today's Focus</p>
          <p className="text-sm font-semibold text-primary">{todayMinutes} / {goal} min</p>
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, (todayMinutes / goal) * 100)}%`, background: 'var(--gradient-2)' }}
        />
      </div>
    </GlassCard>
  )
}
