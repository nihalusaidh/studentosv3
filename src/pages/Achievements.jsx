import { useAuth } from '../contexts/AuthContext'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import { ACHIEVEMENTS } from '../data/constants'
import { Award, Lock, CheckCircle, Star, Trophy, Flame, FileText, Timer, Heart, Crown, Brain } from 'lucide-react'

const iconMap = {
  LogIn: Star,
  Flame: Flame,
  Trophy: Trophy,
  FileText: FileText,
  Timer: Timer,
  CheckCircle: Award,
  Brain: Brain,
  Award: Award,
  Heart: Heart,
  Star: Star,
  Crown: Crown
}

export default function Achievements() {
  const { profile } = useAuth()
  const unlocked = profile?.achievements || []

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
          <Award size={20} className="text-[var(--warning)]" />
          Achievements
        </h1>
        <p className="text-sm text-secondary">Unlock badges as you progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlocked.includes(ach.id)
          const Icon = iconMap[ach.icon] || Award

          return (
            <GlassCard
              key={ach.id}
              className={`p-4 text-center transition-all ${isUnlocked ? '' : 'opacity-50'}`}
            >
              <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                isUnlocked ? 'gradient-bg' : 'bg-[var(--border-color)]'
              }`}>
                {isUnlocked ? (
                  <Icon size={22} className="text-white" />
                ) : (
                  <Lock size={18} className="text-muted" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-primary mb-1">{ach.title}</h3>
              <p className="text-xs text-muted mb-2">{ach.description}</p>
              <div className="flex items-center justify-center gap-1">
                {isUnlocked ? (
                  <Badge variant="success">Unlocked</Badge>
                ) : (
                  <span className="text-xs text-muted">+{ach.xp} XP</span>
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
