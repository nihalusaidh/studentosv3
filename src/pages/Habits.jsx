import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HabitProvider, useHabits } from '../contexts/HabitContext'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import HabitCard from '../components/habits/HabitCard'
import HabitForm from '../components/habits/HabitForm'
import DailyChecklist from '../components/habits/DailyChecklist'
import HabitCalendar from '../components/habits/HabitCalendar'
import HabitFilters from '../components/habits/HabitFilters'
import HabitStats from '../components/habits/HabitStats'
import CircularProgress from '../components/habits/CircularProgress'
import WeeklyChart from '../components/habits/WeeklyChart'
import CategoryChart from '../components/habits/CategoryChart'
import ConsistencyGauge from '../components/habits/ConsistencyGauge'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import {
  Plus, Volume2, VolumeX, Flame, Sparkles, ChevronDown, ChevronRight,
  Zap, Sun, Moon, Star, Trophy, Download
} from 'lucide-react'
import { downloadHabitsCsv } from '../utils/exportUtils'
import { format } from 'date-fns'

const DASHBOARD_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Sun },
  { id: 'checklist', label: 'Checklist', icon: Star },
  { id: 'insights', label: 'Insights', icon: Trophy },
  { id: 'all', label: 'All Habits', icon: Sparkles }
]

function HabitsContent() {
  const { profile } = useAuth()
  const { currentTheme } = useTheme()
  const analysisLayout = currentTheme?.vars?.['--analysis-layout'] || 'chart-cat-gauge'
  const {
    activeHabits, archivedHabits, soundsEnabled, toggleSound,
    refresh, analytics, streakData
  } = useHabits()

  const [showForm, setShowForm] = useState(false)
  const [editHabit, setEditHabit] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [showAllHabits, setShowAllHabits] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created')
  const [showArchived, setShowArchived] = useState(false)

  const today = format(new Date(), 'EEEE, MMM d')
  const todayShort = format(new Date(), 'yyyy-MM-dd')
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const todayCompleted = activeHabits.filter(h => h.completedDates?.[todayShort]?.completed).length
  const todayTotal = activeHabits.filter(h => {
    if (h.frequency === 'daily') return true
    if (h.frequency === 'weekly') return true
    if (h.frequency === 'custom' && h.customDays?.length) return h.customDays.includes(new Date().getDay())
    if (h.frequency === 'onetime') return !h.completedDates?.[todayShort]?.completed && !Object.keys(h.completedDates || {}).length
    return true
  }).length
  const todayPercent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0

  const maxStreak = activeHabits.reduce((max, h) => Math.max(max, h.streak || 0), 0)
  const xpToday = activeHabits
    .filter(h => h.completedDates?.[todayShort]?.completed)
    .reduce((sum, h) => sum + (h.xpValue || 25), 0)

  const filteredHabits = useMemo(() => {
    const source = showArchived ? archivedHabits : activeHabits
    let result = [...source]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(h => h.name.toLowerCase().includes(q) || h.notes?.toLowerCase().includes(q) || h.category.includes(q))
    }
    if (categoryFilter !== 'all') result = result.filter(h => h.category === categoryFilter)
    if (priorityFilter !== 'all') result = result.filter(h => h.priority === priorityFilter)
    if (difficultyFilter !== 'all') result = result.filter(h => h.difficulty === difficultyFilter)
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'streak': return (b.streak || 0) - (a.streak || 0)
        case 'priority': return ['high', 'medium', 'low'].indexOf(a.priority) - ['high', 'medium', 'low'].indexOf(b.priority)
        case 'difficulty': return ['hard', 'medium', 'easy'].indexOf(a.difficulty) - ['hard', 'medium', 'easy'].indexOf(b.difficulty)
        default: return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })
    return result
  }, [activeHabits, archivedHabits, showArchived, search, categoryFilter, priorityFilter, difficultyFilter, sortBy])

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-5xl mx-auto">
      <div className="space-y-4">
        {/* ───────── Hero Section ───────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="habits-hero relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[var(--accent)]/20 via-[var(--bg-secondary)] to-[var(--bg-secondary)] border border-[var(--border-color)]"
        >
          <motion.div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--accent)]/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="habits-hero-ring"><CircularProgress percent={todayPercent} size={80} strokeWidth={6} /></div>
              <div>
                <motion.p
                  className="habits-hero-greeting text-sm text-muted font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >{greeting}, {profile?.fullName?.split(' ')[0] || 'Student'}</motion.p>
                <motion.h1
                  className="text-xl font-bold text-primary mt-0.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >{today}</motion.h1>
                <motion.div
                  className="habits-hero-stats flex items-center gap-3 mt-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <span className="habits-hero-stat flex items-center gap-1 text-xs text-muted">
                    <Flame size={12} className="text-orange-500" /> {maxStreak}d streak
                  </span>
                  <span className="habits-hero-stat flex items-center gap-1 text-xs text-muted">
                    <Zap size={12} className="text-amber-500" /> +{xpToday} XP today
                  </span>
                  <span className="habits-hero-stat flex items-center gap-1 text-xs text-muted">
                    <Star size={12} className="text-[var(--accent)]" /> {todayCompleted}/{todayTotal} done
                  </span>
                </motion.div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => downloadHabitsCsv(activeHabits)}
                className="p-2.5 rounded-xl bg-[var(--bg-secondary)] text-muted hover:text-primary hover:bg-[var(--bg-card)] transition-all cursor-pointer border-0"
                title="Export habits CSV">
                <Download size={16} />
              </button>
              <button onClick={toggleSound} className="p-2.5 rounded-xl bg-[var(--bg-secondary)] text-muted hover:text-primary hover:bg-[var(--bg-card)] transition-all cursor-pointer border-0">
                {soundsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <Button onClick={() => { setEditHabit(null); setShowForm(true) }} icon={Plus} className="group relative overflow-hidden shadow-theme">
                <span className="relative z-10">New Habit</span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ───────── Stats ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <HabitStats />
        </motion.div>

        {/* ───────── Section Tabs ───────── */}
        <div className="flex gap-1.5 bg-[var(--bg-secondary)] rounded-xl p-1 overflow-x-auto">
          {DASHBOARD_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border-0 ${
                activeSection === id
                  ? 'tab-active bg-[var(--bg-card)] text-primary shadow-sm'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ───────── Section Content ───────── */}
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {analysisLayout === 'chart-cat-gauge' && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <WeeklyChart />
                    <CategoryChart />
                  </div>
                  <ConsistencyGauge />
                </>
              )}
              {analysisLayout === 'gauge-chart-cat' && (
                <div className="space-y-4">
                  <ConsistencyGauge />
                  <WeeklyChart />
                  <CategoryChart />
                </div>
              )}
              {analysisLayout === 'chart-gauge-cat' && (
                <>
                  <WeeklyChart />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ConsistencyGauge />
                    <CategoryChart />
                  </div>
                </>
              )}
              {analysisLayout === 'inline' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ConsistencyGauge />
                    <CategoryChart />
                  </div>
                  <WeeklyChart />
                </div>
              )}
              {analysisLayout === 'cat-gauge-chart' && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CategoryChart />
                    <ConsistencyGauge />
                  </div>
                  <WeeklyChart />
                </>
              )}
              {analysisLayout === 'cat-chart-gauge' && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CategoryChart />
                    <ConsistencyGauge />
                  </div>
                  <WeeklyChart />
                </>
              )}
            </motion.div>
          )}

          {activeSection === 'checklist' && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DailyChecklist onAdd={() => { setEditHabit(null); setShowForm(true) }} />
            </motion.div>
          )}

          {activeSection === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <HabitCalendar />
              <ConsistencyGauge />
            </motion.div>
          )}

          {activeSection === 'all' && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <HabitFilters
                search={search} setSearch={setSearch}
                categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
                difficultyFilter={difficultyFilter} setDifficultyFilter={setDifficultyFilter}
                sortBy={sortBy} setSortBy={setSortBy}
              />
              <div className="flex items-center gap-2">
                <button onClick={() => setShowArchived(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 ${
                    !showArchived ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-muted hover:text-primary'
                  }`}
                >Active ({activeHabits.length})</button>
                <button onClick={() => setShowArchived(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 ${
                    showArchived ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-muted hover:text-primary'
                  }`}
                >Archived ({archivedHabits.length})</button>
              </div>
              {filteredHabits.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-sm text-muted mb-3">
                    {showArchived ? 'No archived habits' : search || categoryFilter !== 'all' ? 'No habits match your filters' : 'No habits yet'}
                  </p>
                  {!showArchived && (
                    <Button size="sm" onClick={() => { setEditHabit(null); setShowForm(true) }} icon={Sparkles}>
                      Create your first habit
                    </Button>
                  )}
                </GlassCard>
              ) : (
                <div className="space-y-2">
                  {filteredHabits.map((habit, i) => (
                    <HabitCard key={habit.id} habit={habit} index={i} onClick={() => { setEditHabit(habit); setShowForm(true) }} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ───────── Floating Action Button ───────── */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setEditHabit(null); setShowForm(true) }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full gradient-bg text-white shadow-lg flex items-center justify-center cursor-pointer border-0"
      >
        <Plus size={24} />
      </motion.button>

      <HabitForm isOpen={showForm} onClose={() => { setShowForm(false); setEditHabit(null) }} editHabit={editHabit} />
    </div>
  )
}

export default function Habits() {
  return (
    <HabitProvider>
      <HabitsContent />
    </HabitProvider>
  )
}
