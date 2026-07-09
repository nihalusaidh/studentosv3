import { useAuth } from '../../contexts/AuthContext'
import { checkAiAccess } from '../../utils/aiAccess'
import { Sparkles, Crown, Zap } from 'lucide-react'

export default function AICreditDisplay() {
  const { profile } = useAuth()
  const access = checkAiAccess(profile)

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]">
      <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
        <Sparkles size={18} className="text-[var(--accent)]" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-primary">AI Access</p>
          {profile?.plan === 'premium' ? (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
              <Crown size={12} /> Unlimited
            </span>
          ) : access.allowed ? (
            <span className="text-xs text-emerald-400">{access.remaining} tokens left</span>
          ) : (
            <span className="text-xs text-muted">Premium only</span>
          )}
        </div>
        <div className="w-full h-1.5 rounded-full bg-[var(--bg-primary)] mt-1 overflow-hidden">
          <div className="h-full rounded-full bg-[var(--accent)]/30" style={{ width: profile?.plan === 'premium' ? '100%' : '0%' }} />
        </div>
      </div>
    </div>
  )
}
