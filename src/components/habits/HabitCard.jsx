import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Clock, Flame, MoreHorizontal, Edit3, Copy, Archive, Trash2, Pin, PinOff, GripVertical } from 'lucide-react'
import { useHabits } from '../../contexts/HabitContext'
import GlassCard from '../ui/GlassCard'
import { format } from 'date-fns'

const TYPE_ICONS = { yesno: '✅', count: '🔢', timer: '⏱️', duration: '⏳', water: '💧', pages: '📄', distance: '📏', custom: '⚡' }

const TYPE_LABELS = {
  yesno: 'Yes/No', count: 'Count', timer: 'Timer', duration: 'Duration', water: 'Water', pages: 'Pages', distance: 'Distance', custom: 'Custom'
}

export default function HabitCard({ habit, index = 0, isDraggable }) {
  const { toggleComplete, removeHabit, copyHabit, archiveHabitById, editHabit } = useHabits()
  const [menuOpen, setMenuOpen] = useState(false)
  const [completing, setCompleting] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const isCompleted = habit.completedDates?.[today]?.completed
  const currentValue = habit.completedDates?.[today]?.value

  const handleToggle = () => {
    setCompleting(true)
    toggleComplete(habit.id, today)
    setTimeout(() => setCompleting(false), 300)
  }

  const handleValueComplete = () => {
    const next = (currentValue || 0) + 1
    toggleComplete(habit.id, today, next >= (habit.target || 1) ? null : next)
  }

  const streakMilestone = habit.streak > 0 && habit.streak % 7 === 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
      className="relative"
    >
      <GlassCard className={`p-3.5 relative overflow-hidden group ${isCompleted ? 'ring-1 ring-[var(--success)]/40' : ''}`}>
        <div className="flex items-center gap-3">
          {isDraggable && (
            <div className="cursor-grab active:cursor-grabbing text-muted">
              <GripVertical size={16} />
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleToggle}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-all duration-300 ${
              isCompleted ? 'bg-[var(--success)]/20 scale-110' : 'bg-[var(--bg-secondary)] hover:bg-[var(--accent)]/10'
            }`}
          >
            {isCompleted ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Check size={20} className="text-[var(--success)]" />
              </motion.div>
            ) : (
              habit.emoji || TYPE_ICONS[habit.type] || '🎯'
            )}
          </motion.button>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => editHabit(habit.id, habit)}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-primary truncate">{habit.name}</h3>
              {habit.isPinned && <Pin size={12} className="text-[var(--accent)] flex-shrink-0" />}
              {streakMilestone && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                  <Flame size={14} className="text-orange-500" />
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                habit.priority === 'high' ? 'bg-[var(--danger)]/20 text-[var(--danger)]' :
                habit.priority === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                'bg-[var(--success)]/20 text-[var(--success)]'
              }`}>
                {habit.priority}
              </span>
              {habit.streak > 0 && (
                <span className="text-[10px] text-muted flex items-center gap-0.5">
                  <Flame size={10} /> {habit.streak} day{habit.streak !== 1 ? 's' : ''}
                </span>
              )}
              {habit.type !== 'yesno' && habit.target && (
                <span className="text-[10px] text-muted">
                  {currentValue || 0}/{habit.target} {habit.unit}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {habit.type !== 'yesno' && !isCompleted && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleValueComplete}
                className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all"
              >
                <Clock size={14} />
              </motion.button>
            )}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(p => !p)}
                className="p-1.5 rounded-lg text-muted hover:bg-[var(--bg-secondary)] transition-all cursor-pointer"
              >
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-full mt-1 z-50 w-44 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg"
                  >
                    {[
                      { icon: Edit3, label: 'Edit', action: () => editHabit(habit.id, habit) },
                      { icon: Copy, label: 'Duplicate', action: () => copyHabit(habit.id) },
                      { icon: habit.isPinned ? PinOff : Pin, label: habit.isPinned ? 'Unpin' : 'Pin', action: () => editHabit(habit.id, { isPinned: !habit.isPinned }) },
                      { icon: Archive, label: 'Archive', action: () => archiveHabitById(habit.id) },
                      { icon: Trash2, label: 'Delete', action: () => { removeHabit(habit.id); setMenuOpen(false) }, danger: true }
                    ].map(({ icon: Icon, label, action, danger }) => (
                      <button
                        key={label}
                        onClick={() => { action(); setMenuOpen(false) }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors cursor-pointer border-0 bg-transparent ${
                          danger ? 'text-[var(--danger)] hover:bg-[var(--danger)]/10' : 'text-secondary hover:bg-[var(--accent)]/10 hover:text-primary'
                        }`}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
        {habit.notes && (
          <p className="text-[11px] text-muted mt-2 ml-[52px] truncate">{habit.notes}</p>
        )}
      </GlassCard>
    </motion.div>
  )
}

export { TYPE_ICONS, TYPE_LABELS }
