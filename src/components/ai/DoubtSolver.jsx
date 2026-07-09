import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { callGemini } from '../../config/gemini'
import { useAuth } from '../../contexts/AuthContext'
import { checkAiAccess, deductToken } from '../../utils/aiAccess'
import Button from '../ui/Button'
import GlassCard from '../ui/GlassCard'
import ToolGuide from './ToolGuide'
import { HelpCircle, Upload, Sparkles, RefreshCw, Crown } from 'lucide-react'
import toast from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
}

export default function DoubtSolver() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const { user, profile } = useAuth()
  const fileRef = useRef()

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.txt')) {
      toast.error('Please upload a .txt file')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setQuestion(prev => prev + '\n' + ev.target.result)
    reader.readAsText(file)
  }

  const handleSolve = async () => {
    if (!question.trim()) return toast.error('Enter your doubt')
    setLoading(true)
    setAnswer('')
    setIsDemo(false)

    const access = checkAiAccess(profile)
    if (!access.allowed) {
      toast.error(access.needsUpgrade ? 'AI features require premium. Upgrade to continue.' : access.message)
      setLoading(false)
      return
    }

    try {
      const res = await callGemini(`Answer this academic question thoroughly and clearly: ${question}. Provide a step-by-step explanation.`)
      if (res.error) {
        toast.error(res.error)
        setLoading(false)
        return
      }
      setIsDemo(!!res.demo)
      setAnswer(res.text)

      if (profile?.plan !== 'premium') await deductToken(user?.uid)
      toast.success('Answer generated!')
    } catch {
      toast.error('Failed to get answer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <ToolGuide
        steps={['Type your doubt or upload a .txt file', 'Click "Get Answer"', 'Read the AI-generated explanation']}
        tips={['Be as specific as possible in your question', 'Upload .txt for long problem descriptions', 'Works well for step-by-step solutions']}
      />
      <motion.div variants={item} className="relative">
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type your doubt or upload a .txt file..."
          rows={4}
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
        <Button onClick={handleSolve} loading={loading} icon={HelpCircle} className="w-full group relative overflow-hidden">
          <span className="relative z-10">Get Answer</span>
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
              <p className="text-sm text-muted mt-3">Solving your doubt...</p>
            </GlassCard>
          </motion.div>
        )}

        {answer && !loading && (
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
                {answer.split('\n').map((line, i) => (
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
