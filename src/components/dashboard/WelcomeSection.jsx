import { useAuth } from '../../contexts/AuthContext'
import { usePremium } from '../../contexts/PremiumContext'
import { Sun, Moon, Cloud, CloudSun, ShieldCheck } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: 'Good Morning', icon: Sun }
  if (h < 17) return { text: 'Good Afternoon', icon: CloudSun }
  if (h < 21) return { text: 'Good Evening', icon: Cloud }
  return { text: 'Good Night', icon: Moon }
}

export default function WelcomeSection() {
  const { profile } = useAuth()
  const { isPremium } = usePremium()
  const { text, icon: Icon } = getGreeting()

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 gradient-bg">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
            {text}, {profile?.fullName?.split(' ')[0] || 'Student'}!
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white/70 text-sm">Ready to learn something new today?</p>
            {isPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                <ShieldCheck size={12} />
                Verified Batch
              </span>
            )}
          </div>
        </div>
        <Icon size={28} className="text-white/60" />
      </div>
    </div>
  )
}
