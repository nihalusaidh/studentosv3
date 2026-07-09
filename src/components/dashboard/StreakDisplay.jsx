import { Flame } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import GlassCard from '../ui/GlassCard'

export default function StreakDisplay() {
  const { profile } = useAuth()
  const streak = profile?.streak || 0

  return (
    <GlassCard className="p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${streak > 0 ? 'bg-orange-500/20' : 'bg-[var(--border-color)]'}`}>
        <Flame size={20} className={streak > 0 ? 'text-orange-400' : 'text-muted'} />
      </div>
      <div>
        <p className={`text-lg font-bold ${streak > 0 ? 'text-orange-400' : 'text-muted'}`}>{streak}</p>
        <p className="text-xs text-muted">Day Streak</p>
      </div>
    </GlassCard>
  )
}
