import { motion } from 'framer-motion'
import { Crown, Sparkles, FileText, Brain, Map as MapIcon, LineChart, FileSpreadsheet, Zap, Shield, CheckCircle2, ExternalLink, Bot } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import { useAuth } from '../contexts/AuthContext'

const FEATURES = [
  { icon: Brain, name: 'AI-Powered Study Tools', desc: 'Generate notes, quizzes, flashcards, study plans, and more' },
  { icon: Bot, name: 'AI Board Tutor', desc: 'Interactive blackboard lessons with voice narration and auto-drawn diagrams' },
  { icon: FileSpreadsheet, name: 'Formula Sheet Generator', desc: 'Instant formula sheets for any subject' },
  { icon: FileText, name: 'Resume & SOP Builder', desc: 'AI-assisted resume and statement of purpose writing' },
  { icon: MapIcon, name: 'Mind Maps', desc: 'Visual concept maps for complex topics' },
  { icon: LineChart, name: 'Exam Predictor', desc: 'Predict your exam scores based on performance trends' },
  { icon: Brain, name: 'PDF Chat', desc: 'Chat with your PDF documents using AI' },
  { icon: Zap, name: 'Unlimited AI Usage', desc: 'No daily caps for premium and premium+ users' },
  { icon: Shield, name: 'Priority Support', desc: 'Get help faster when you need it' }
]

const PLANS = [
  {
    name: 'Monthly',
    priceINR: '₹199',
    priceUSD: '$5.99',
    period: '/month',
    popular: false,
    tier: 'premium',
    features: ['All AI tools unlimited', 'PDF Chat & Mind Maps', 'Exam Predictor', 'Priority support']
  },
  {
    name: 'Yearly',
    priceINR: '₹1,999',
    priceUSD: '$59.9',
    period: '/year',
    popular: true,
    tier: 'premium',
    features: ['All Monthly features', '2 months free', 'Early access to new features', 'Premium badge']
  },
  {
    name: 'Premium+ Monthly',
    priceINR: '₹499',
    priceUSD: '$9.99',
    period: '/month',
    popular: false,
    tier: 'premium_plus',
    features: ['Everything in Premium', 'AI Board Tutor with voice narration', 'Auto-drawn diagrams on blackboard', 'PDF upload for custom lessons', 'Doubt chat during lessons', 'Priority support']
  },
  {
    name: 'Premium+ Yearly',
    priceINR: '₹4,999',
    priceUSD: '$99.9',
    period: '/year',
    popular: false,
    tier: 'premium_plus',
    features: ['Everything in Premium+ Monthly', '2 months free', 'Early access to new features', 'Premium+ badge']
  }
]

export default function Premium() {
  const { profile } = useAuth()
  const isPremium = profile?.plan === 'premium'
  const isPremiumPlus = profile?.plan === 'premium_plus'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center py-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Crown size={32} className="text-amber-400" />
        </motion.div>
        <h1 className="text-2xl font-bold gradient-text">Student OS Premium</h1>
        <p className="text-sm text-secondary mt-1">Unlock the full potential of your academic journey</p>
      </div>

      {(isPremium || isPremiumPlus) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className={`p-4 text-center border ${isPremiumPlus ? 'border-purple-500/30 bg-purple-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
            <p className="text-sm font-semibold flex items-center justify-center gap-2" style={{ color: isPremiumPlus ? '#c084fc' : '#fbbf24' }}>
              <Crown size={16} /> You're on {isPremiumPlus ? 'Premium+' : 'Premium'} — enjoy unlimited AI features!
            </p>
          </GlassCard>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANS.map((plan, i) => {
          const isPremiumPlusPlan = plan.tier === 'premium_plus'
          const isActivePlan = (isPremiumPlus && isPremiumPlusPlan) || (isPremium && !isPremiumPlusPlan && plan.tier === 'premium')
          const gradFrom = isPremiumPlusPlan ? 'from-purple-500' : 'from-amber-400'
          const gradTo = isPremiumPlusPlan ? 'to-cyan-500' : 'to-yellow-500'
          const borderColor = isPremiumPlusPlan ? 'border-purple-500/40 ring-1 ring-purple-500/20' : (plan.popular ? 'border-amber-500/40 ring-1 ring-amber-500/20' : '')
          return (
          <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className={`p-6 relative overflow-hidden ${borderColor}`}>
              {plan.popular && !isPremiumPlusPlan && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] font-semibold">
                  Best Value
                </div>
              )}
              {isPremiumPlusPlan && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[10px] font-semibold">
                  AI Tutor
                </div>
              )}
              <h3 className="text-lg font-semibold text-primary mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-primary">{plan.priceINR}</span>
                <span className="text-muted text-xs">{plan.period}</span>
              </div>
              <p className="text-xs text-muted mb-4">≈ {plan.priceUSD} {plan.period}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-secondary">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${gradFrom} ${gradTo} opacity-60 cursor-not-allowed`}
              >
                {isActivePlan ? `Already on ${isPremiumPlusPlan ? 'Premium+' : 'Premium'}` : 'Coming Soon'}
              </button>
              <p className="text-[10px] text-muted text-center mt-2">Payment integration coming soon — contact admin to upgrade</p>
            </GlassCard>
          </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FEATURES.map(f => (
          <GlassCard key={f.name} className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <f.icon size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">{f.name}</p>
              <p className="text-xs text-muted mt-0.5">{f.desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6 text-center">
        <p className="text-sm text-secondary">Premium can also be enabled by your institution admin.</p>
        <p className="text-xs text-muted mt-1">Contact your admin or visit the admin panel for manual activation.</p>
      </GlassCard>
    </div>
  )
}
