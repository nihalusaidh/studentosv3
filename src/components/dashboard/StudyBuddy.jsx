import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useXp } from '../../contexts/XpContext'
import GlassCard from '../ui/GlassCard'
import { Smile, Meh, Frown, Heart, Sparkles } from 'lucide-react'

const buddyStates = {
  happy: { icon: Smile, color: 'text-green-400', bg: 'bg-green-500/20', message: 'Great job today!' },
  neutral: { icon: Meh, color: 'text-yellow-400', bg: 'bg-yellow-500/20', message: 'Let\'s study together!' },
  sad: { icon: Frown, color: 'text-orange-400', bg: 'bg-orange-500/20', message: 'Time to focus!' },
  love: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/20', message: 'You\'re amazing!' },
  super: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/20', message: 'Super mode activated!' }
}

export default function StudyBuddy() {
  const { profile } = useAuth()
  const [mood, setMood] = useState('neutral')
  const xp = profile?.xp || 0
  const streak = profile?.streak || 0

  const getBuddyState = () => {
    if (streak >= 7) return 'super'
    if (xp > 500) return 'love'
    if (xp > 100) return 'happy'
    if (streak > 0) return 'neutral'
    return 'sad'
  }

  const state = buddyStates[getBuddyState()]
  const Icon = state.icon

  return (
    <GlassCard className="p-4 flex items-center gap-3" hover={false}>
      <div className={`w-12 h-12 rounded-xl ${state.bg} flex items-center justify-center`}>
        <Icon size={24} className={state.color} />
      </div>
      <div>
        <p className="text-sm font-medium text-primary">Study Buddy</p>
        <p className="text-xs text-secondary">{state.message}</p>
      </div>
    </GlassCard>
  )
}
