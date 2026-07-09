import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, Upload, FileText, Play, Crown, Bot, ChevronRight, Trophy, RotateCcw, Mic } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import ToolGuide from './ToolGuide'
import { checkTutorAccess } from '../../utils/tutorAccess'
import { generateLesson, askDoubt, extractTopicsFromPDF } from '../../utils/tutorContent'
import { extractTextFromPDF } from '../../utils/pdfParser'
import TutorBoard from '../tutor/TutorBoard'
import TutorControls from '../tutor/TutorControls'
import DoubtPanel from '../tutor/DoubtPanel'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const STATUS = {
  INPUT: 'input',
  LOADING: 'loading',
  READY: 'ready',
  TEACHING: 'teaching',
  PAUSED: 'paused',
  COMPLETE: 'complete'
}

export default function VideoTutor() {
  const { profile, user } = useAuth()
  const [status, setStatus] = useState(STATUS.INPUT)
  const [topic, setTopic] = useState('')
  const [sections, setSections] = useState([])
  const [currentSection, setCurrentSection] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [doubtOpen, setDoubtOpen] = useState(false)
  const [pdfText, setPdfText] = useState('')
  const [pdfTopics, setPdfTopics] = useState([])
  const [pdfFile, setPdfFile] = useState(null)
  const [extractingPDF, setExtractingPDF] = useState(false)
  const [showTopics, setShowTopics] = useState(false)
  const [error, setError] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const [markerPos, setMarkerPos] = useState(null)
  const synthRef = useRef(null)

  const access = checkTutorAccess(profile)

  useEffect(() => {
    synthRef.current = window.speechSynthesis
    return () => { synthRef.current?.cancel() }
  }, [])

  const speak = useCallback((text) => {
    synthRef.current?.cancel()
    if (!text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.05
    utterance.volume = 1
    const voices = synthRef.current?.getVoices()
    const goodVoice = voices?.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices?.find(v => v.lang.startsWith('en')) || null
    if (goodVoice) utterance.voice = goodVoice
    synthRef.current?.speak(utterance)
  }, [])

  const stopSpeech = useCallback(() => {
    synthRef.current?.cancel()
  }, [])

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic to learn'); return }
    setStatus(STATUS.LOADING)
    setError('')
    try {
      const result = await generateLesson(topic.trim())
      if (result.error) { setError(result.error); setStatus(STATUS.INPUT); return }
      if (result.sections) {
        setSections(result.sections)
        setCurrentSection(0)
        setIsDemo(result.demo || false)
        setStatus(STATUS.READY)
      }
    } catch {
      setError('Failed to generate lesson. Try again.')
      setStatus(STATUS.INPUT)
    }
  }

  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return }
    setPdfFile(file)
    setExtractingPDF(true)
    const result = await extractTextFromPDF(file)
    setExtractingPDF(false)
    if (result.error) { toast.error(result.error); return }
    setPdfText(result.text)
    toast.success(`Extracted ${result.pages} page(s). Analyzing topics...`)
    const topicsResult = await extractTopicsFromPDF(result.text)
    if (topicsResult.topics) {
      setPdfTopics(topicsResult.topics)
      setShowTopics(true)
    }
  }

  const handleTopicSelect = (t) => {
    setTopic(t)
    setShowTopics(false)
  }

  const startLesson = () => {
    setStatus(STATUS.TEACHING)
    playSection(0)
  }

  const playSection = (index) => {
    setCurrentSection(index)
    setPlaying(true)
    const section = sections[index]
    if (section?.narration) speak(section.narration)
  }

  const togglePlay = () => {
    if (playing) {
      stopSpeech()
      setPlaying(false)
      setStatus(STATUS.PAUSED)
    } else {
      setPlaying(true)
      setStatus(STATUS.TEACHING)
      const section = sections[currentSection]
      if (section?.narration) speak(section.narration)
    }
  }

  const nextSection = () => {
    stopSpeech()
    if (currentSection < sections.length - 1) {
      playSection(currentSection + 1)
    } else {
      setPlaying(false)
      setStatus(STATUS.COMPLETE)
    }
  }

  const prevSection = () => {
    stopSpeech()
    if (currentSection > 0) {
      playSection(currentSection - 1)
    }
  }

  const handleAskDoubt = async (question) => {
    const context = sections.slice(0, currentSection + 1).map(s => s.title + ': ' + (s.narration || '')).join('\n')
    const result = await askDoubt(question, context)
    return result
  }

  const handleDoubtClose = () => {
    setDoubtOpen(false)
  }

  const reset = () => {
    stopSpeech()
    setStatus(STATUS.INPUT)
    setSections([])
    setCurrentSection(0)
    setPlaying(false)
    setDoubtOpen(false)
    setError('')
    setPdfText('')
    setPdfTopics([])
    setPdfFile(null)
    setShowTopics(false)
    setTopic('')
  }

  const handleContinue = () => {
    if (playing) {
      stopSpeech()
      setPlaying(false)
      setStatus(STATUS.PAUSED)
    } else {
      nextSection()
    }
  }

  const sectionActions = sections[currentSection]?.board || []

  const renderInput = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
          <Bot size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">AI Board Tutor</h2>
        <p className="text-sm text-white/60 max-w-md mx-auto">
          Enter a topic or upload a PDF. I'll teach you on an interactive blackboard with voice narration and diagrams.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleGenerate() }}
            placeholder="Enter a topic (e.g., Newton's Laws of Motion)..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors"
          />
          <button onClick={handleGenerate} disabled={!topic.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all disabled:opacity-40 shadow-lg shadow-purple-500/25 cursor-pointer border-0">
            <Sparkles size={16} className="inline mr-1.5" />
            Generate
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex-1">
            <Upload size={16} className="text-cyan-400" />
            <span className="text-sm text-white/70">{pdfFile ? pdfFile.name : 'Upload a PDF'}</span>
            <input type="file" accept=".pdf" onChange={handlePDFUpload} className="hidden" />
            {extractingPDF && <span className="ml-auto text-xs text-purple-400 animate-pulse">Extracting...</span>}
          </label>
        </div>

        {showTopics && pdfTopics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-2">Topics found in PDF — pick one to learn:</p>
            <div className="flex flex-wrap gap-2">
              {pdfTopics.map((t, i) => (
                <button key={i} onClick={() => handleTopicSelect(t)}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-medium transition-all border border-purple-500/20 cursor-pointer">
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Newton's Laws of Motion", icon: '⚡' },
          { label: 'Photosynthesis', icon: '🌿' },
          { label: 'Quadratic Equations', icon: '📐' },
          { label: 'Periodic Table', icon: '⚗️' }
        ].map(s => (
          <button key={s.label} onClick={() => setTopic(s.label)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left cursor-pointer">
            <span className="text-lg">{s.icon}</span>
            <span className="text-xs text-white/70">{s.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 animate-pulse flex items-center justify-center">
          <Sparkles size={36} className="text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center animate-bounce">
          <Bot size={16} className="text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Creating Your Lesson</h3>
      <p className="text-sm text-white/50 max-w-xs text-center">
        Generating board diagrams, narration, and examples for "{topic}"...
      </p>
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )

  const renderReady = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <BookOpen size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">{topic}</h3>
          <p className="text-xs text-white/50">{sections.length} sections • {isDemo ? 'Demo Mode' : 'AI Generated'}</p>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {sections.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{s.title}</p>
              <p className="text-xs text-white/40 truncate">{s.board?.length || 0} drawing steps</p>
            </div>
            <ChevronRight size={14} className="text-white/30 shrink-0" />
          </div>
        ))}
      </div>

      <button onClick={startLesson}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer border-0">
        <Play size={18} />
        Start Lesson
      </button>

      {isDemo && (
        <p className="text-xs text-amber-400/70 text-center">Running in demo mode (Gemini API quota exhausted). Content is simulated.</p>
      )}
    </motion.div>
  )

  const renderTeaching = () => {
    const section = sections[currentSection]
    return (
      <div className="relative space-y-3">
        <TutorBoard
          actions={sectionActions}
          onMarkerMove={setMarkerPos}
          sectionIndex={currentSection}
          isAnimating={playing}
        />

        {markerPos && playing && (
          <div className="absolute pointer-events-none"
            style={{
              left: markerPos.x - 8,
              top: markerPos.y - 20,
              transition: 'all 0.05s linear'
            }}>
            <span className="text-2xl drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' }}>✏️</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <TutorControls
            playing={playing}
            onTogglePlay={togglePlay}
            onNext={nextSection}
            onPrev={prevSection}
            hasNext={currentSection < sections.length - 1}
            hasPrev={currentSection > 0}
            totalSections={sections.length}
            currentSection={currentSection}
            onAskDoubt={() => setDoubtOpen(true)}
            sectionTitles={sections.map(s => s.title)}
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }} />
          </div>
        </div>

        <DoubtPanel
          open={doubtOpen}
          onClose={handleDoubtClose}
          onAsk={handleAskDoubt}
          currentSection={currentSection}
        />
      </div>
    )
  }

  const renderComplete = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
        <Trophy size={36} className="text-white" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Lesson Complete!</h2>
      <p className="text-sm text-white/60 mb-2">You finished "{topic}"</p>
      <p className="text-xs text-white/40 mb-6">{sections.length} sections completed</p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all flex items-center gap-2 cursor-pointer border-0">
          <RotateCcw size={16} />
          New Topic
        </button>
        <button onClick={() => { reset(); setTopic(topic); handleGenerate() }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg shadow-purple-500/25 cursor-pointer border-0">
          Replay Lesson
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-[400px]">
      <ToolGuide
        steps={['Enter a topic or upload a PDF', 'Click "Generate Lesson"', 'Review the lesson sections', 'Click "Start Lesson"', 'Use play/pause and navigation controls', 'Ask doubts in the chat panel']}
        tips={['Works best with specific academic topics', 'PDF upload extracts text for lesson generation', 'TTS reads narration aloud — adjust volume as needed', 'Premium+ feature — upgrade to unlock']}
      />
      {status === STATUS.INPUT && renderInput()}
      {status === STATUS.LOADING && renderLoading()}
      {status === STATUS.READY && renderReady()}
      {(status === STATUS.TEACHING || status === STATUS.PAUSED) && renderTeaching()}
      {status === STATUS.COMPLETE && renderComplete()}
    </div>
  )
}
