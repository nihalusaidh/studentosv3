import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, LayoutDashboard, CalendarCheck, Sparkles, Trophy, ListTodo, Timer, NotepadText, Bell } from 'lucide-react'

const TOUR_KEY = 'student-os-tour-completed'

const STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Welcome to Student OS!',
    description: 'Your all-in-one academic companion. Track everything, study smarter with AI, and stay motivated with gamification.',
    highlights: ['AI-powered study tools', 'Attendance & marks tracking', 'Habit builder & XP system', 'Smart calendar & tasks'],
    color: 'text-purple-500'
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Your Dashboard Hub',
    description: 'Get a bird\'s-eye view of your academic life. Widgets show attendance, upcoming exams, tasks, habits, XP, and more.',
    highlights: ['Customizable widgets', 'Daily check-in streak', 'Quick actions toolbar', 'Real-time stats & progress'],
    color: 'text-blue-500'
  },
  {
    id: 'attendance',
    icon: CalendarCheck,
    title: 'Attendance & Marks',
    description: 'Log classes, track attendance percentage, and manage internal assessments with multiple weightage modes.',
    highlights: ['Subject-wise attendance %', 'Auto-calculated predictions', 'Custom assessments & grading', 'Semester freeze & archive'],
    color: 'text-green-500'
  },
  {
    id: 'calendar',
    icon: Timer,
    title: 'Smart Calendar',
    description: 'Classes, exams, assignments — all auto-scheduled. View your day, week, or month at a glance.',
    highlights: ['Auto-generated class events', 'Exam countdowns', 'Deadline reminders', 'Multi-view (day/week/month)'],
    color: 'text-cyan-500'
  },
  {
    id: 'ai',
    icon: Sparkles,
    title: 'AI-Powered Workspace',
    description: '7 powerful AI tools: Quiz Generator, Notes Maker, Flashcards, Formula Sheets, and more. Plus the interactive Board Tutor.',
    highlights: ['Smart Quiz Generator', 'Auto Flashcard Creator', 'Academic Coach chat', 'Premium+ Board Tutor'],
    color: 'text-violet-500'
  },
  {
    id: 'habits',
    icon: Trophy,
    title: 'Habits & Gamification',
    description: 'Build study habits, earn XP, climb the leaderboard, and unlock achievements. Your productivity is a game!',
    highlights: ['Custom habit tracking', 'Streak system with rewards', 'XP levels & achievements', 'Global leaderboard'],
    color: 'text-amber-500'
  },
  {
    id: 'tasks',
    icon: ListTodo,
    title: 'Tasks & Exams',
    description: 'Manage assignments, track exam prep, and never miss a deadline with smart notifications.',
    highlights: ['Task lists with priorities', 'Exam countdown timers', 'Subject-wise organization', 'Browser push notifications'],
    color: 'text-rose-500'
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Stay in the Loop',
    description: 'Get notified about upcoming classes, exam reminders, streak alerts, and due assignments — both in-app and via browser.',
    highlights: ['Browser push notifications', 'Class & exam reminders', 'Streak & habit alerts', 'Overdue task warnings'],
    color: 'text-indigo-500'
  }
]

export default function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY)
    if (!completed) {
      setTimeout(() => setIsOpen(true), 500)
    }
  }, [])

  const complete = () => {
    localStorage.setItem(TOUR_KEY, 'true')
    setIsOpen(false)
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else complete()
  }

  const prev = () => { if (step > 0) setStep(s => s - 1) }

  if (!isOpen) return null

  const current = STEPS[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={complete} />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -30 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-theme-lg"
        >
          <button onClick={complete} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-hover text-secondary cursor-pointer border-0 bg-transparent">
            <X size={18} />
          </button>

          <div className="flex items-start gap-4 mb-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${current.color} bg-current/10`} style={{ backgroundColor: `color-mix(in srgb, ${current.color.split(' ')[0]} 15%, transparent)` }}>
              <Icon size={24} className={current.color} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-primary">{current.title}</h2>
              <p className="text-sm text-secondary mt-1 leading-relaxed">{current.description}</p>
            </div>
          </div>

          <div className="space-y-2 mb-5">
            {current.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <div className={`w-1.5 h-1.5 rounded-full ${current.color}`} />
                <span className="text-xs text-secondary">{h}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === step
                    ? 'w-6 gradient-bg'
                    : i < step
                      ? 'w-1.5 bg-purple-500/40'
                      : 'w-1.5 bg-[var(--border-color)]'
                }`}
                onClick={() => setStep(i)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={prev} disabled={step === 0}
              className="px-4 py-2 rounded-lg text-sm text-secondary hover:bg-hover transition-colors disabled:opacity-20 cursor-pointer border-0 bg-transparent flex items-center gap-1">
              {step > 0 && <><ArrowLeft size={14} /> Back</>}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted">{step + 1} / {STEPS.length}</span>
              <button onClick={next}
                className="px-5 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all cursor-pointer border-0 flex items-center gap-1 shadow-lg shadow-purple-500/20">
                {step < STEPS.length - 1 ? <>Next <ArrowRight size={14} /></> : 'Get Started!'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
