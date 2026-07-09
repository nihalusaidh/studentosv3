import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { callGemini } from '../../config/gemini'
import { useAuth } from '../../contexts/AuthContext'
import { checkAiAccess, deductToken } from '../../utils/aiAccess'
import Button from '../ui/Button'
import Input from '../ui/Input'
import GlassCard from '../ui/GlassCard'
import ToolGuide from './ToolGuide'
import { Brain, CheckCircle, XCircle, RefreshCw, Sparkles, Crown, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useXp } from '../../contexts/XpContext'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } }
}

const questionAnim = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 18 } }
}

const optionAnim = {
  hidden: { opacity: 0, x: -15 },
  show: (i) => ({ opacity: 1, x: 0, transition: { delay: 0.2 + i * 0.08, type: 'spring', stiffness: 260, damping: 20 } })
}

export default function QuizGenerator() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [error, setError] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const { awardXp } = useXp()
  const { user, profile } = useAuth()
  const fileRef = useRef()

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.txt')) { toast.error('Please upload a .txt file'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setTopic(ev.target.result)
    reader.readAsText(file)
  }

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error('Enter a topic')
    setLoading(true)
    setSubmitted(false)
    setAnswers({})
    setScore(0)
    setQuestions([])
    setError('')

    const access = checkAiAccess(profile)
    if (!access.allowed) {
      toast.error(access.needsUpgrade ? 'AI features require premium. Upgrade to continue.' : access.message)
      setLoading(false)
      return
    }

    try {
      const res = await callGemini(`Generate 5 multiple choice questions on the topic: "${topic}". Return ONLY a valid JSON array with no markdown formatting or code fences. Each object must have: "question" (string), "options" (array of 4 strings), "correctIndex" (integer 0-3). Example format: [{"question":"What is 2+2?","options":["3","4","5","6"],"correctIndex":1}]`)
      if (res.error) {
        setError(res.error)
        setLoading(false)
        return
      }

      const cleaned = res.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      setIsDemo(!!res.demo)
      const parsed = JSON.parse(cleaned)
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid response')
      setQuestions(parsed)

      if (profile?.plan !== 'premium') await deductToken(user?.uid)
      toast.success(res.demo ? 'Demo quiz generated!' : 'Quiz generated!')
    } catch (e) {
      setError(e.message === 'Invalid response' ? 'Failed to parse quiz. Try again.' : 'Failed to generate quiz. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    let s = 0
    questions.forEach((q, i) => { if (answers[i] === q.correctIndex) s++ })
    setScore(s)
    setSubmitted(true)
    awardXp(40, 'quiz_complete')
    toast.success(`Score: ${s}/${questions.length} +40 XP`)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <ToolGuide
        steps={['Enter a topic (e.g. "Photosynthesis")', 'Click "Generate Quiz"', 'Answer the multiple-choice questions', 'Click "Submit" to check your score and earn XP']}
        tips={['Specific topics produce better questions', 'Demo mode generates sample questions when API unavailable']}
      />
      <motion.div variants={questionAnim} className="flex gap-2">
        <div className="relative flex-1">
          <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter a topic or upload a .txt file..." className="w-full pr-10" />
          <button onClick={() => fileRef.current?.click()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-all duration-200 cursor-pointer border-0">
            <Upload size={14} />
          </button>
          <input ref={fileRef} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
        </div>
        <Button onClick={handleGenerate} loading={loading} icon={Brain} disabled={loading}>Generate Quiz</Button>
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
              <p className="text-sm text-muted mt-3">Generating quiz questions...</p>
            </GlassCard>
          </motion.div>
        )}

        {!error && questions.length > 0 && !loading && (
          <motion.div key="quiz" variants={container} initial="hidden" animate="show" className="space-y-4">
            {isDemo && (
              <motion.p variants={questionAnim} className="text-[10px] text-amber-500 text-center tracking-wider uppercase">Demo mode</motion.p>
            )}
            {questions.map((q, i) => (
              <motion.div key={i} variants={questionAnim}>
                <GlassCard className="p-4 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  />
                  <p className="text-sm font-medium text-primary mb-3 relative z-10">
                    <span className="text-[var(--accent)] mr-2">Q{i + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-2 relative z-10">
                    {q.options.map((opt, j) => {
                      let variant = 'bg-[var(--bg-secondary)] text-secondary border-transparent'
                      if (submitted) {
                        if (j === q.correctIndex) variant = 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]'
                        else if (answers[i] === j && j !== q.correctIndex) variant = 'bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]'
                      } else if (answers[i] === j) {
                        variant = 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]'
                      }
                      return (
                        <motion.button
                          key={j}
                          custom={j}
                          variants={optionAnim}
                          initial="hidden"
                          animate="show"
                          onClick={() => { if (!submitted) setAnswers(prev => ({ ...prev, [i]: j })) }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer border ${variant}`}
                          disabled={submitted}
                          whileHover={!submitted ? { scale: 1.01, x: 4 } : {}}
                          whileTap={!submitted ? { scale: 0.98 } : {}}
                        >
                          {String.fromCharCode(65 + j)}. {opt}
                        </motion.button>
                      )
                    })}
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            <motion.div variants={questionAnim}>
              {!submitted ? (
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleSubmit} className="w-full group relative overflow-hidden">
                    <span className="relative z-10">Submit Answers</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-white/20 to-[var(--accent)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                  <GlassCard className="p-5 text-center relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    />
                    <motion.p
                      className="text-2xl font-bold text-primary relative z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.2 }}
                    >
                      Score: {score}/{questions.length}
                    </motion.p>
                    {score === questions.length ? (
                      <motion.p
                        className="text-sm text-[var(--success)] mt-2 relative z-10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Perfect score!
                      </motion.p>
                    ) : (
                      <Button onClick={handleGenerate} icon={RefreshCw} size="sm" className="mt-3 relative z-10">Try Again</Button>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
