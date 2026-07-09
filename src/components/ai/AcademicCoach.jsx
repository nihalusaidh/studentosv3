import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { callGemini } from '../../config/gemini'
import { useAuth } from '../../contexts/AuthContext'
import { checkAiAccess, deductToken } from '../../utils/aiAccess'
import Button from '../ui/Button'
import GlassCard from '../ui/GlassCard'
import ToolGuide from './ToolGuide'
import { GraduationCap, Lock, Sparkles, Upload, Crown } from 'lucide-react'
import toast from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
}

export default function AcademicCoach() {
  const { user, profile } = useAuth()
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const fileRef = useRef()

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.txt')) {
      toast.error('Please upload a .txt file')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setGoal(prev => prev + '\n' + ev.target.result)
    reader.readAsText(file)
  }

  const handleAsk = async () => {
    if (!goal.trim()) return toast.error('Describe your academic goal')
    const access = checkAiAccess(profile)
    if (!access.allowed) {
      toast.error(access.needsUpgrade ? 'AI features require premium. Upgrade to continue.' : access.message)
      return
    }
    setLoading(true)
    setAdvice('')
    setIsDemo(false)

    try {
      const res = await callGemini(`Act as an academic coach. Help me achieve this goal: ${goal}. Provide a personalized strategy with short-term, mid-term, and long-term plans, recommended resources, and progress tracking advice. Format with markdown.`)
      if (res.error) {
        toast.error(res.error)
        setLoading(false)
        return
      }
      setIsDemo(!!res.demo)
      setAdvice(res.text)

      if (profile?.plan !== 'premium') await deductToken(user?.uid)
      toast.success('Advice generated!')
    } catch {
      toast.error('Failed to get advice')
    } finally {
      setLoading(false)
    }
  }

  const accessCheck = checkAiAccess(profile)
  if (!accessCheck.allowed) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
        <GlassCard className="p-6 text-center relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
          >
            <Lock size={32} className="text-muted mx-auto mb-3" />
          </motion.div>
          <h3 className="text-lg font-semibold text-primary mb-1 relative z-10">Premium Feature</h3>
          <p className="text-sm text-muted mb-4 relative z-10">Upgrade to Premium for personalized academic coaching</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="relative overflow-hidden">
              <span className="relative z-10">Upgrade to Premium</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-white/20 to-[var(--accent)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
          </motion.div>
        </GlassCard>
      </motion.div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <ToolGuide
        steps={['Describe your academic goal or challenge', 'Click "Get Advice"', 'Follow the personalized coaching plan', 'Track your progress over time']}
        tips={['Be specific about your goal and deadlines', 'Include constraints for better advice', 'Premium feature — upgrade to unlock']}
      />
      <motion.div variants={item} className="relative">
        <textarea
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="Describe your academic goal or challenge..."
          rows={3}
          className="w-full rounded-xl px-4 py-3 pr-10 text-sm bg-[var(--input-bg)] border border-[var(--border-color)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent)] resize-none transition-all duration-300"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-all duration-200"
        >
          <Upload size={16} />
        </button>
        <input ref={fileRef} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
      </motion.div>

      <motion.div variants={item}>
        <Button onClick={handleAsk} loading={loading} icon={GraduationCap} className="w-full group relative overflow-hidden">
          <span className="relative z-10">Get Advice</span>
          {!loading && <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/20 to-[var(--accent)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />}
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-8 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                <Sparkles size={32} className="text-[var(--accent)] mx-auto" />
              </motion.div>
              <p className="text-sm text-muted mt-3">Analyzing your goals...</p>
            </GlassCard>
          </motion.div>
        )}

        {advice && !loading && (
          <motion.div key="result" variants={item} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
            <GlassCard className="p-5 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
              {isDemo && (
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] text-amber-500 text-center mb-3 tracking-wider uppercase"
                >Demo mode</motion.p>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative z-10 text-sm text-primary whitespace-pre-wrap leading-relaxed"
              >
                {advice.split('\n').map((line, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.015, duration: 0.3 }}
                  >
                    {line}
                    {'\n'}
                  </motion.span>
                ))}
              </motion.div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
