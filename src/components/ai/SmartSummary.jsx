import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { callGemini } from '../../config/gemini'
import { useAuth } from '../../contexts/AuthContext'
import { checkAiAccess, deductToken } from '../../utils/aiAccess'
import Button from '../ui/Button'
import GlassCard from '../ui/GlassCard'
import ToolGuide from './ToolGuide'
import { FileText, RefreshCw, Upload, Sparkles, Crown } from 'lucide-react'
import toast from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
}

export default function SmartSummary() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
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
    reader.onload = (ev) => setText(ev.target.result)
    reader.readAsText(file)
  }

  const handleSummarize = async () => {
    if (!text.trim()) return toast.error('Enter text to summarize')
    setLoading(true)
    setSummary('')
    setError('')
    setIsDemo(false)

    const access = checkAiAccess(profile)
    if (!access.allowed) {
      toast.error(access.needsUpgrade ? 'AI features require premium. Upgrade to continue.' : access.message)
      setLoading(false)
      return
    }

    try {
      const res = await callGemini(`Summarize the following text concisely, extracting the key points and main ideas. Use bullet points for clarity:\n\n${text}`)
      if (res.error) {
        setError(res.error)
        setLoading(false)
        return
      }
      setIsDemo(!!res.demo)
      setSummary(res.text)

      if (profile?.plan !== 'premium') await deductToken(user?.uid)
      toast.success('Summary generated!')
    } catch {
      setError('Failed to generate summary. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <ToolGuide
        steps={['Paste your text or upload a .txt file', 'Click "Summarize"', 'Read the AI-generated summary points']}
        tips={['Handles long text — up to several pages', 'Upload .txt files for quick summarization', 'Works great for chapters, articles, and notes']}
      />
      <motion.div variants={item} className="flex gap-2">
        <div className="relative flex-1">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your text here or upload a .txt file..."
            rows={6}
            className="w-full rounded-xl px-4 py-3 text-sm bg-[var(--input-bg)] border border-[var(--border-color)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent)] resize-none transition-all duration-300"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-all duration-200"
          >
            <Upload size={16} />
          </button>
          <input ref={fileRef} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Button onClick={handleSummarize} loading={loading} icon={FileText} className="w-full group relative overflow-hidden">
          <span className="relative z-10">Summarize</span>
          {!loading && <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/0 via-[var(--accent)]/20 to-[var(--accent)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />}
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="error" variants={item} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <GlassCard className="p-4 text-center border border-[var(--danger)]/30">
              <p className="text-sm text-[var(--danger)] mb-2">{error}</p>
              <Button onClick={handleSummarize} icon={RefreshCw} size="sm">Retry</Button>
            </GlassCard>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" variants={item} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-8 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                <Sparkles size={32} className="text-[var(--accent)] mx-auto" />
              </motion.div>
              <p className="text-sm text-muted mt-3">Generating smart summary...</p>
            </GlassCard>
          </motion.div>
        )}

        {summary && !loading && (
          <motion.div key="result" variants={item} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
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
                {summary.split('\n').map((line, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.03, duration: 0.3 }}
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
