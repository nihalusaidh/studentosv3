import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ToolGuide from './ToolGuide'
import { FileText, Download, Copy, Check, BookOpen, Crown, Sparkles, Upload } from 'lucide-react'
import { callGemini } from '../../config/gemini'
import { useAuth } from '../../contexts/AuthContext'
import { checkAiAccess, deductToken } from '../../utils/aiAccess'
import GlassCard from '../ui/GlassCard'
import toast from 'react-hot-toast'

export default function FormulaSheet() {
  const [subject, setSubject] = useState('')
  const [topics, setTopics] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const { user, profile } = useAuth()
  const fileRef = useRef()

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.txt')) { toast.error('Please upload a .txt file'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setTopics(ev.target.result)
    reader.readAsText(file)
  }

  const handleGenerate = async () => {
    if (!subject.trim()) return toast.error('Subject is required')
    const access = checkAiAccess(profile)
    if (!access.allowed) {
      toast.error(access.needsUpgrade ? 'AI features require premium. Upgrade to continue.' : access.message)
      return
    }
    setLoading(true); setResult(''); setIsDemo(false)
    const prompt = `Generate a comprehensive formula sheet for ${subject}${topics ? ` covering: ${topics}` : ''}. Include:
1. Key formulas with clear notation
2. Brief explanations of when to use each formula
3. Units and constants
4. Related concepts and theorems

Format with clear sections, bullet points, and proper mathematical notation.`
    const res = await callGemini(prompt)
    if (res.error && !res.demo) { toast.error(res.error); setLoading(false); return }
    setIsDemo(!!res.demo)
    setResult(res.text)
    if (profile?.plan !== 'premium') await deductToken(user?.uid)
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${subject}-formulas.txt`
    a.click(); URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  return (
    <div className="space-y-4">
      <ToolGuide
        steps={['Enter a subject name', 'Add optional specific topics', 'Click "Generate"', 'Copy or download your formula sheet']}
        tips={['Be specific for best results (e.g. "Calculus: Integration")', 'Download as .txt for offline access']}
      />
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-primary">Formula Sheet Generator</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Subject *</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]"
              placeholder="e.g. Physics, Calculus, Data Structures" />
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Topics (optional)</label>
            <div className="relative">
              <input value={topics} onChange={e => setTopics(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)] pr-10"
                placeholder="e.g. Kinematics, Integration, Sorting" />
              <button onClick={() => fileRef.current?.click()} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-all duration-200 cursor-pointer border-0">
                <Upload size={14} />
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
          </div>
          <button onClick={handleGenerate} disabled={loading || !subject.trim()}
            className="w-full px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-0">
            {loading ? 'Generating...' : 'Generate Formula Sheet'}
          </button>
        </div>
      </GlassCard>

      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <BookOpen size={16} className="text-[var(--accent)]" />
                Formula Sheet: {subject}
              </h3>
              <div className="flex gap-1">
                <button onClick={handleCopy} className="p-1.5 rounded hover:bg-hover text-muted hover:text-primary cursor-pointer border-0 bg-transparent" title="Copy">
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
                <button onClick={handleDownload} className="p-1.5 rounded hover:bg-hover text-muted hover:text-primary cursor-pointer border-0 bg-transparent" title="Download">
                  <Download size={14} />
                </button>
              </div>
            </div>
            {isDemo && <p className="text-[10px] text-amber-500 text-center mb-2 tracking-wider uppercase">Demo mode</p>}
            <div className="text-xs text-primary leading-relaxed whitespace-pre-wrap">{result}</div>
          </GlassCard>
        </motion.div>
      )}
      {loading && (
        <GlassCard className="p-8 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
            <Sparkles size={32} className="text-[var(--accent)] mx-auto" />
          </motion.div>
          <p className="text-sm text-muted mt-3">Generating formula sheet...</p>
        </GlassCard>
      )}
    </div>
  )
}
