import { Zap, Trophy } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getXpProgress } from '../../utils/xpCalculator'
import GlassCard from '../ui/GlassCard'
import ProgressBar from '../ui/ProgressBar'

export default function XpLevelDisplay() {
  const { profile } = useAuth()
  const xp = profile?.xp || 0
  const level = profile?.level || 1
  const progress = getXpProgress(xp)

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center">
          <Trophy size={20} className="text-[var(--accent)]" />
        </div>
        <div>
          <p className="text-xs text-muted">Level {level}</p>
          <p className="text-sm font-semibold text-primary">{profile?.level_title || 'Freshman'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <Zap size={14} className="text-[var(--warning)]" />
        <span className="text-xs text-muted">{xp} XP</span>
      </div>
      <ProgressBar value={progress} size="sm" showLabel />
    </GlassCard>
  )
}
