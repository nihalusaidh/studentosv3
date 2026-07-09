import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Search, Clock, TrendingUp, Zap, Crown, BookOpen, Brain, Lightbulb, Shuffle, Calculator, FileText, Calendar, HelpCircle, MessageSquare, Share2, BarChart3, Briefcase, Lock, Star, ChevronRight, Bot, Mic } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import AICreditDisplay from '../components/ai/AICreditDisplay'
import NotesGenerator from '../components/ai/NotesGenerator'
import QuizGenerator from '../components/ai/QuizGenerator'
import SmartSummary from '../components/ai/SmartSummary'
import Flashcards from '../components/ai/Flashcards'
import DoubtSolver from '../components/ai/DoubtSolver'
import VoiceRecorder from '../components/ai/VoiceRecorder'
import StudyPlanner from '../components/ai/StudyPlanner'
import AcademicCoach from '../components/ai/AcademicCoach'
import FormulaSheet from '../components/ai/FormulaSheet'
import VideoTutor from '../components/ai/VideoTutor'

const RECENT_KEY = 'student-os-ai-recent'

const AI_TOOLS = [
  {
    id: 'notes', title: 'Smart Notes', icon: BookOpen, gradient: 'from-blue-600 to-cyan-500',
    gradientDark: 'from-blue-500/20 to-cyan-500/10',
    description: 'Upload PDFs, PPTs, or typed notes and instantly generate structured study notes.',
    features: ['PDF Upload', 'AI Summary', 'Key Points', 'Definitions', 'Revision Notes'],
    illustration: '📚',
    component: NotesGenerator, premium: false, comingSoon: false
  },
  {
    id: 'quiz', title: 'Quiz Generator', icon: Brain, gradient: 'from-purple-600 to-pink-500',
    gradientDark: 'from-purple-500/20 to-pink-500/10',
    description: 'Generate unlimited quizzes from your notes and test your understanding.',
    features: ['MCQs', 'True/False', 'Fill Blanks', 'Instant Scoring', 'Explanations'],
    illustration: '🧠',
    component: QuizGenerator, premium: false, comingSoon: false
  },
  {
    id: 'explain', title: 'AI Explain Topic', icon: Lightbulb, gradient: 'from-amber-500 to-orange-600',
    gradientDark: 'from-amber-500/20 to-orange-500/10',
    description: 'Ask AI to explain any topic in simple language at any difficulty level.',
    features: ['Explain Like 5', 'School Level', 'College Level', 'Engineering Level', 'Exam View'],
    illustration: '💡',
    component: SmartSummary, premium: false, comingSoon: false
  },
  {
    id: 'flashcards', title: 'AI Flashcards', icon: Shuffle, gradient: 'from-green-500 to-emerald-600',
    gradientDark: 'from-green-500/20 to-emerald-500/10',
    description: 'Generate flashcards automatically from study material with spaced repetition.',
    features: ['Flip Animation', 'Spaced Repetition', 'Bookmark', 'Shuffle', 'Difficult Cards'],
    illustration: '🃏',
    component: Flashcards, premium: false, comingSoon: false
  },
  {
    id: 'formula', title: 'Formula Sheet', icon: Calculator, gradient: 'from-cyan-500 to-blue-600',
    gradientDark: 'from-cyan-500/20 to-blue-500/10',
    description: 'Generate formula sheets, quick revision notes, important equations and symbols.',
    features: ['Formula Sheets', 'Quick Revision', 'Units', 'Equations', 'Symbols'],
    illustration: '📐',
    component: FormulaSheet, premium: false, comingSoon: false
  },
  {
    id: 'assignment', title: 'Assignment Helper', icon: FileText, gradient: 'from-rose-500 to-red-600',
    gradientDark: 'from-rose-500/20 to-red-500/10',
    description: 'Structure assignments, improve grammar, explain topics, generate references.',
    features: ['Structure', 'Grammar', 'References', 'Rewrite', 'Explain'],
    illustration: '✍️',
    component: AcademicCoach, premium: true, comingSoon: false
  },
  {
    id: 'planner', title: 'Study Planner', icon: Calendar, gradient: 'from-violet-500 to-purple-600',
    gradientDark: 'from-violet-500/20 to-purple-500/10',
    description: 'Generate daily study plans, weekly schedules and exam preparation roadmaps.',
    features: ['Daily Plans', 'Weekly Schedule', 'Exam Roadmap', 'Pomodoro', 'Revision'],
    illustration: '📅',
    component: StudyPlanner, premium: false, comingSoon: false
  },
  {
    id: 'doubt', title: 'Doubt Solver', icon: HelpCircle, gradient: 'from-teal-500 to-green-600',
    gradientDark: 'from-teal-500/20 to-green-500/10',
    description: 'Ask text questions, upload images or handwritten notes and get instant answers.',
    features: ['Text Questions', 'Image Upload', 'Handwriting', 'Follow-up', 'Save Chat'],
    illustration: '❓',
    component: DoubtSolver, premium: false, comingSoon: false
  },
  {
    id: 'voice', title: 'Voice Recorder', icon: Mic, gradient: 'from-red-500 to-pink-600',
    gradientDark: 'from-red-500/20 to-pink-500/10',
    description: 'Record lectures, get instant transcription and AI-generated study notes.',
    features: ['Record Audio', 'Live Transcription', 'AI Notes', 'Save History', 'Export'],
    illustration: '🎙️',
    component: VoiceRecorder, premium: false, comingSoon: false
  },
  {
    id: 'pdfchat', title: 'PDF Chat', icon: MessageSquare, gradient: 'from-indigo-500 to-blue-600',
    gradientDark: 'from-indigo-500/20 to-blue-500/10',
    description: 'Chat directly with your PDFs. Ask questions, highlight answers, summarize chapters.',
    features: ['Upload PDF', 'Ask Questions', 'Highlight', 'Page References', 'Summarize'],
    illustration: '📄',
    component: null, premium: true, comingSoon: true
  },
  {
    id: 'mindmap', title: 'Mind Maps', icon: Share2, gradient: 'from-pink-500 to-rose-600',
    gradientDark: 'from-pink-500/20 to-rose-500/10',
    description: 'Generate beautiful colorful concept maps showing connections and relationships.',
    features: ['Topic Maps', 'Connections', 'Relationships', 'Hierarchy', 'Visual'],
    illustration: '🗺️',
    component: null, premium: true, comingSoon: true
  },
  {
    id: 'predictor', title: 'Exam Predictor', icon: BarChart3, gradient: 'from-orange-500 to-red-600',
    gradientDark: 'from-orange-500/20 to-red-500/10',
    description: 'Predict important topics, frequently asked concepts and revision priority.',
    features: ['Important Topics', 'Frequent Concepts', 'Revision Priority', 'Confidence Score'],
    illustration: '🎯',
    component: null, premium: true, comingSoon: true
  },
  {
    id: 'resume', title: 'Resume & SOP', icon: Briefcase, gradient: 'from-slate-600 to-slate-800',
    gradientDark: 'from-slate-500/20 to-slate-600/10',
    description: 'Professional portfolio builder and statement of purpose generator.',
    features: ['Resume Builder', 'SOP Generator', 'Portfolio', 'Cover Letter', 'ATS Check'],
    illustration: '💼',
    component: null, premium: true, comingSoon: true
  },
  {
    id: 'boardtutor', title: 'AI Board Tutor', icon: Bot, gradient: 'from-purple-600 to-cyan-500',
    gradientDark: 'from-purple-500/20 to-cyan-500/10',
    description: 'Interactive blackboard tutor with voice narration, auto-drawn diagrams, and doubt chat.',
    features: ['Voice Narration', 'Auto Diagrams', 'Board Drawing', 'Doubt Chat', 'PDF Upload'],
    illustration: '🎓',
    component: VideoTutor, premium: false, premiumPlus: true, comingSoon: false
  }
]

function Particle({ index }) {
  const size = 4 + Math.random() * 8
  const x = Math.random() * 100
  const delay = Math.random() * 5
  const duration = 8 + Math.random() * 12
  return (
    <div className="absolute rounded-full bg-white/20 dark:bg-purple-400/20"
      style={{
        width: size, height: size,
        left: `${x}%`, bottom: '-10px',
        animation: `floatParticle ${duration}s ease-in-out ${delay}s infinite`,
        opacity: 0.3 + Math.random() * 0.5
      }} />
  )
}

function RippleEffect({ show }) {
  if (!show) return null
  return <span className="absolute inset-0 rounded-2xl animate-ping bg-white/30 dark:bg-purple-400/20" />
}

export default function AiWorkspace() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeTool, setActiveTool] = useState(null)
  const [recentTools, setRecentTools] = useState([])
  const [rippleId, setRippleId] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      if (raw) setRecentTools(JSON.parse(raw))
    } catch {}
  }, [])

  const trackUsage = useCallback((toolId) => {
    const updated = [toolId, ...recentTools.filter(t => t !== toolId)].slice(0, 5)
    setRecentTools(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  }, [recentTools])

  const filteredTools = useMemo(() => {
    if (!search.trim()) return AI_TOOLS
    const q = search.toLowerCase()
    return AI_TOOLS.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.features.some(f => f.toLowerCase().includes(q))
    )
  }, [search])

  const handleOpen = (tool) => {
    if (tool.comingSoon && !tool.component) {
      setActiveTool({ id: tool.id, title: tool.title, component: null, comingSoon: true })
      return
    }
    if (tool.premiumPlus && profile?.plan !== 'premium_plus') {
      setActiveTool({ id: tool.id, title: tool.title, component: null, premiumPlus: true })
      return
    }
    if (tool.premium && !tool.premiumPlus && profile?.plan !== 'premium') {
      setActiveTool({ id: tool.id, title: tool.title, component: null, premium: true })
      return
    }
    trackUsage(tool.id)
    setActiveTool({ id: tool.id, title: tool.title, component: tool.component, comingSoon: false })
  }

  const recentToolData = recentTools.map(id => AI_TOOLS.find(t => t.id === id)).filter(Boolean)
  const suggestedTool = recentTools.length > 0
    ? AI_TOOLS.find(t => !recentTools.includes(t.id) && !t.premium && !t.comingSoon)
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 overflow-hidden">
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-100vh) rotate(180deg); opacity: 0.8; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-gradient { background-size: 200% 200%; animation: gradientShift 8s ease infinite; }
        .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
        .card-lift { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease; }
        .card-lift:hover { transform: translateY(-6px) scale(1.02); }
        .card-glow:hover { box-shadow: 0 20px 60px rgba(139, 92, 246, 0.15), 0 0 40px rgba(139, 92, 246, 0.08); }
      `}</style>

      <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 dark:from-purple-900 dark:via-blue-900 dark:to-cyan-900 animate-gradient overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => <Particle key={i} index={i} />)}
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-16">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Sparkles size={22} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">AI Workspace</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                <Crown size={12} className="text-yellow-300" /> Premium
              </span>
            </div>
          </div>

          <p className="text-white/80 text-sm md:text-base max-w-xl mb-6">
            Your personal AI study companion for notes, quizzes, explanations, summaries, and exam preparation.
          </p>

          <AICreditDisplay />

          <div className="flex gap-2 mt-4">
            <button onClick={() => {
              const first = AI_TOOLS.find(t => !t.premium && !t.comingSoon)
              if (first) handleOpen(first)
            }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-700 text-sm font-semibold hover:bg-white/90 transition-all shadow-lg">
              <Zap size={16} /> Quick Start
            </button>
            <button onClick={() => document.getElementById('ai-search')?.focus()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 backdrop-blur-md text-white text-sm font-medium hover:bg-white/25 transition-all border border-white/20">
              <Search size={16} /> Explore Tools
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-5 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input id="ai-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes, quiz, planner, explain, flashcards..." className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400" />
          {search && (
            <button onClick={() => setSearch('')} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {recentToolData.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-purple-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentToolData.map(tool => (
                <button key={tool.id} onClick={() => handleOpen(tool)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:shadow-md transition-all whitespace-nowrap shrink-0 card-lift">
                  <span className="text-lg">{tool.illustration}</span>
                  {tool.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {suggestedTool && recentToolData.length > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp size={14} className="text-purple-500" />
              <span className="text-gray-700 dark:text-gray-300">
                You used {recentToolData[0]?.title}. Try <strong className="text-purple-600 dark:text-purple-400">{suggestedTool.title}</strong> next!
              </span>
            </div>
            <button onClick={() => handleOpen(suggestedTool)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors">
              Open <ChevronRight size={12} />
            </button>
          </div>
        )}

        {search && filteredTools.length === 0 && (
          <div className="text-center py-16">
            <Search size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No AI tools match "{search}"</p>
            <button onClick={() => setSearch('')} className="mt-2 text-xs text-purple-500 hover:underline">Clear search</button>
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.05 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map(tool => {
            const isLocked = tool.premium || tool.premiumPlus || tool.comingSoon
            return (
              <motion.button
                key={tool.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpen(tool)} disabled={tool.comingSoon && !tool.component}
                className={`relative group text-left rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden card-glow ${isLocked ? 'opacity-80' : 'hover:shadow-xl'} ${tool.comingSoon && !tool.component ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                {tool.comingSoon && !tool.component && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-medium">
                    <Clock size={10} /> Coming Soon
                  </div>
                )}
                {tool.premiumPlus && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[10px] font-medium shadow-lg">
                    <Crown size={10} /> Premium+
                  </div>
                )}
                {tool.premium && !tool.premiumPlus && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] font-medium shadow-lg">
                    <Crown size={10} /> Premium
                  </div>
                )}

                <div className={`h-28 bg-gradient-to-br ${tool.gradient} dark:${tool.gradientDark} flex items-center justify-center relative`}>
                  <span className="text-5xl md:text-6xl opacity-90 group-hover:scale-110 transition-transform duration-500">
                    {tool.illustration}
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
                </div>

                <div className="p-4 bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
                      <tool.icon size={16} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{tool.title}</h3>
                    {isLocked && <Lock size={12} className="text-gray-400 ml-auto" />}
                    {tool.premiumPlus && <Crown size={12} className="text-purple-400 ml-1" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{tool.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.features.slice(0, 4).map(f => (
                      <span key={f} className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {!search && (
          <div className="mt-8 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Premium Tools</h2>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border border-amber-200 dark:border-amber-700">
              <div className="flex items-center gap-3 mb-3">
                <Crown size={24} className="text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Unlock All AI Features</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get access to PDF Chat, Mind Maps, Exam Predictor & more</p>
                </div>
                <button onClick={() => navigate('/premium')} className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-semibold hover:from-amber-500 hover:to-yellow-600 transition-all shadow-lg shadow-amber-500/25">
                  Upgrade
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {AI_TOOLS.filter(t => t.premium || t.premiumPlus).slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/60 dark:bg-gray-800/60 text-xs text-gray-600 dark:text-gray-400">
                    <Lock size={10} /> {t.title} {t.premiumPlus ? '✨' : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) setActiveTool(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{activeTool.title}</h2>
                  {activeTool.premium && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] font-medium">
                      <Crown size={10} /> Premium
                    </span>
                  )}
                  {activeTool.comingSoon && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-medium">
                      <Clock size={10} /> Coming Soon
                    </span>
                  )}
                </div>
                <button onClick={() => setActiveTool(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                  {activeTool.premiumPlus && (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                        <Crown size={36} className="text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Premium+ Feature</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                        {activeTool.title} is a Premium+ feature. Upgrade to access interactive blackboard lessons with voice narration, auto-drawn diagrams, and doubt chat.
                      </p>
                      <button onClick={() => { setActiveTool(null); navigate('/premium') }} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg shadow-purple-500/25">
                        Upgrade to Premium+
                      </button>
                    </div>
                  )}
                  {activeTool.premium && !activeTool.premiumPlus && !activeTool.component && (
                    <div className="text-center py-16">
                      <Crown size={48} className="mx-auto mb-4 text-amber-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Premium Feature</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Upgrade to access {activeTool.title} and other advanced AI tools.</p>
                      <button onClick={() => { setActiveTool(null); navigate('/premium') }} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-semibold hover:from-amber-500 hover:to-yellow-600 transition-all shadow-lg shadow-amber-500/25">
                        Upgrade Now
                      </button>
                    </div>
                  )}
                  {activeTool.comingSoon && !activeTool.component && (
                    <div className="text-center py-16">
                      <span className="text-6xl mb-4 block">🚧</span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activeTool.title} is under development and will be available soon.</p>
                    </div>
                  )}
                  {activeTool.component && !activeTool.premium && !activeTool.premiumPlus && (
                    <activeTool.component />
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
