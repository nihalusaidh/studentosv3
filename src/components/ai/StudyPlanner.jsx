import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { callGemini } from '../../config/gemini'
import { useAuth } from '../../contexts/AuthContext'
import { checkAiAccess, deductToken } from '../../utils/aiAccess'
import Button from '../ui/Button'
import Input from '../ui/Input'
import GlassCard from '../ui/GlassCard'
import ToolGuide from './ToolGuide'
import { Calendar, RefreshCw, Sparkles, Clock, Crown, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
}

export default function StudyPlanner() {
  const [subject, setSubject] = useState('')
  const [hours, setHours] = useState('2')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState('')
  const [error, setError] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const { user, profile } = useAuth()
  const fileRef = useRef()

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.txt')) { toast.error('Please upload a .txt file'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setSubject(ev.target.result)
    reader.readAsText(file)
  }

  const handleGenerate = async () => {
    if (!subject.trim()) return toast.error('Enter a subject')
    setLoading(true)
    setPlan('')
    setError('')
    setIsDemo(false)

    const access = checkAiAccess(profile)
    if (!access.allowed) {
      toast.error(access.needsUpgrade ? 'AI features require premium. Upgrade to continue.' : access.message)
      setLoading(false)
      return
    }

    try {
      const res = await callGemini(`Create a detailed study plan for ${subject} with ${hours} hours of study time. Include a schedule breakdown with time blocks, recommended resources (books, videos, practice), specific topics to cover, and study techniques. Format with markdown.`)
      if (res.error) {
        setError(res.error)
        setLoading(false)
        return
      }
      setIsDemo(!!res.demo)
      setPlan(res.text)

      if (profile?.plan !== 'premium') await deductToken(user?.uid)
      toast.success('Plan generated!')
    } catch {
      setError('Failed to generate plan. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <ToolGuide
        steps={['Enter a subject', 'Set total study hours (1-8 recommended)', 'Click "Plan"', 'Follow the AI-generated study schedule']}
        tips={['Hours should be realistic per session', 'Planner breaks study into manageable daily goals', 'Combine multiple subjects for a complete plan']}
      />
      <motion.div variants={item} className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[11px] text-muted mb-1 block font-medium">Subject</label>
          <div className="relative">
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics or upload .txt..." className="w-full pr-10" />
            <button onClick={() => fileRef.current?.click()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-all duration-200 cursor-pointer border-0">
              <Upload size={14} />
            </button>
            <input ref={fileRef} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
          </div>
        </div>
        <div className="w-28">
          <label className="text-[11px] text-muted mb-1 block font-medium">Hours</label>
          <div className="relative">
            <Input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="Hours" className="w-full pl-7" min="1" max="12" />
            <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>
        <Button onClick={handleGenerate} loading={loading} icon={Calendar} className="h-[42px] group relative overflow-hidden">
          <span className="relative z-10">Plan</span>
          {!loading && <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/20 to-[var(--accent)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />}
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <GlassCard className="p-4 text-center border border-[var(--danger)]/30">
              <p className="text-sm text-[var(--danger)] mb-2">{error}</p>
              <Button onClick={handleGenerate} icon={RefreshCw} size="sm">Retry</Button>
            </GlassCard>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-8 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                <Sparkles size={32} className="text-[var(--accent)] mx-auto" />
              </motion.div>
              <p className="text-sm text-muted mt-3">Creating your study plan...</p>
            </GlassCard>
          </motion.div>
        )}

        {plan && !loading && (
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
                {plan.split('\n').map((line, i) => (
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
