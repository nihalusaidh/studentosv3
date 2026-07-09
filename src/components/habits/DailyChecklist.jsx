import { useState, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Plus, CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { useHabits } from '../../contexts/HabitContext'
import HabitCard from './HabitCard'
import CircularProgress from './CircularProgress'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import { format } from 'date-fns'

export default function DailyChecklist({ onAdd }) {
  const { activeHabits } = useHabits()
  const [showCompleted, setShowCompleted] = useState(true)
  const today = format(new Date(), 'yyyy-MM-dd')

  const todayHabits = useMemo(() => {
    return activeHabits.filter(h => {
      if (h.frequency === 'daily') return true
      if (h.frequency === 'weekly') return true
      if (h.frequency === 'custom' && h.customDays?.length) {
        return h.customDays.includes(new Date().getDay())
      }
      if (h.frequency === 'onetime') {
        return !h.completedDates?.[today]?.completed && !Object.keys(h.completedDates || {}).length
      }
      return true
    })
  }, [activeHabits])

  const sorted = useMemo(() => {
    const completed = todayHabits.filter(h => h.completedDates?.[today]?.completed)
    const pending = todayHabits.filter(h => !h.completedDates?.[today]?.completed)
    const pinned = pending.filter(h => h.isPinned)
    const unpinned = pending.filter(h => !h.isPinned)
    return [...pinned, ...unpinned, ...(showCompleted ? completed : [])]
  }, [todayHabits, showCompleted, today])

  const completedCount = todayHabits.filter(h => h.completedDates?.[today]?.completed).length
  const totalCount = todayHabits.length
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <GlassCard className="p-4 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CircularProgress percent={percent} size={48} strokeWidth={4} sublabel="" />
            <div>
              <h3 className="text-sm font-semibold text-primary">Today's Checklist</h3>
              <p className="text-[11px] text-muted">
                {completedCount} of {totalCount} done
                {totalCount > 0 && ` · ${percent}%`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowCompleted(p => !p)}
              className={`p-2 rounded-lg text-xs cursor-pointer border-0 transition-all ${
                showCompleted ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-secondary)] text-muted'
              }`}
              title={showCompleted ? 'Hide completed' : 'Show completed'}
            >
              <CheckCircle2 size={15} />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdd}
              className="p-2 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-all cursor-pointer border-0"
            >
              <Plus size={15} />
            </motion.button>
          </div>
        </div>

        {todayHabits.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
            <Circle size={28} className="text-muted mx-auto mb-2" />
            <p className="text-sm text-muted mb-3">No habits for today</p>
            <Button size="sm" onClick={onAdd} icon={Sparkles}>Create your first habit</Button>
          </motion.div>
        ) : (
          <Reorder.Group axis="y" values={sorted} onReorder={() => {}} className="space-y-2">
            <AnimatePresence mode="popLayout">
              {sorted.map((habit, i) => (
                <Reorder.Item key={habit.id} value={habit} className="list-none">
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
                  >
                    <HabitCard habit={habit} index={i} />
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </GlassCard>
  )
}
