import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import GlassCard from '../ui/GlassCard'
import { useHabits } from '../../contexts/HabitContext'
import toast from 'react-hot-toast'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6']
const EMOJIS = ['🎯', '💪', '📚', '🧠', '🏃', '🧘', '💧', '🥗', '✍️', '🎨', '🎵', '🌱', '💤', '☀️', '📖', '🏋️']
const CATEGORIES = ['health', 'mind', 'fitness', 'study', 'work', 'social', 'finance', 'custom']
const TYPES = [
  { value: 'yesno', label: 'Yes/No', icon: '✅' },
  { value: 'count', label: 'Count', icon: '🔢' },
  { value: 'timer', label: 'Timer', icon: '⏱️' },
  { value: 'duration', label: 'Duration', icon: '⏳' },
  { value: 'water', label: 'Water Intake', icon: '💧' },
  { value: 'pages', label: 'Pages', icon: '📄' },
  { value: 'distance', label: 'Distance', icon: '📏' },
  { value: 'custom', label: 'Custom Unit', icon: '⚡' }
]
const FREQUENCIES = ['daily', 'weekly', 'monthly', 'custom', 'onetime']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PRIORITIES = ['low', 'medium', 'high']
const DIFFICULTIES = ['easy', 'medium', 'hard']
const XP_MAP = { easy: 15, medium: 25, hard: 40 }

export default function HabitForm({ isOpen, onClose, editHabit: editData }) {
  const { addHabit, editHabit: editHabitCtx } = useHabits()
  const isEditing = !!editData

  const [form, setForm] = useState({
    name: '', emoji: '🎯', color: '#6366f1', category: 'health',
    type: 'yesno', target: '', unit: '', frequency: 'daily',
    customDays: [], reminder: null, notes: '',
    priority: 'medium', difficulty: 'medium', xpValue: 25, isPinned: false
  })

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || '',
        emoji: editData.emoji || '🎯',
        color: editData.color || '#6366f1',
        category: editData.category || 'health',
        type: editData.type || 'yesno',
        target: editData.target ?? '',
        unit: editData.unit || '',
        frequency: editData.frequency || 'daily',
        customDays: editData.customDays || [],
        reminder: editData.reminder || null,
        notes: editData.notes || '',
        priority: editData.priority || 'medium',
        difficulty: editData.difficulty || 'medium',
        xpValue: editData.xpValue || 25,
        isPinned: editData.isPinned || false
      })
    } else {
      setForm({
        name: '', emoji: '🎯', color: '#6366f1', category: 'health',
        type: 'yesno', target: '', unit: '', frequency: 'daily',
        customDays: [], reminder: null, notes: '',
        priority: 'medium', difficulty: 'medium', xpValue: 25, isPinned: false
      })
    }
  }, [editData, isOpen])

  const update = (key, value) => setForm(p => ({ ...p, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Enter a habit name')

    const data = {
      ...form,
      target: form.type === 'yesno' ? null : (form.target ? Number(form.target) : null),
      xpValue: XP_MAP[form.difficulty] || 25
    }

    if (isEditing) {
      editHabitCtx(editData.id, data)
      toast.success('Habit updated!')
    } else {
      addHabit(data)
      toast.success('Habit created!')
    }
    onClose()
  }

  const showTarget = form.type !== 'yesno'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Habit' : 'New Habit'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 space-y-1">
            <label className="text-[11px] text-muted block font-medium">Icon</label>
            <div className="flex flex-wrap gap-1.5 w-32">
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => update('emoji', e)}
                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer border-0 ${
                    form.emoji === e ? 'bg-[var(--accent)]/20 ring-2 ring-[var(--accent)] scale-110' : 'bg-[var(--bg-secondary)] hover:bg-[var(--accent)]/10'
                  }`}
                >{e}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <Input label="Habit Name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Morning Meditation" autoFocus />
            <div>
              <label className="text-[11px] text-muted block font-medium mb-1">Color</label>
              <div className="flex gap-1.5">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => update('color', c)}
                    className={`w-7 h-7 rounded-full transition-all cursor-pointer border-0 ${
                      form.color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted block font-medium mb-1">Category</label>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => update('category', c)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] capitalize transition-all cursor-pointer border-0 ${
                    form.category === c ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-secondary)] text-secondary hover:bg-[var(--accent)]/10'
                  }`}
                >{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted block font-medium mb-1">Type</label>
            <select value={form.type} onChange={e => update('type', e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs bg-[var(--input-bg)] border border-[var(--border-color)] text-primary focus:outline-none focus:border-[var(--accent)]"
            >
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted block font-medium mb-1">Frequency</label>
            <select value={form.frequency} onChange={e => update('frequency', e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs bg-[var(--input-bg)] border border-[var(--border-color)] text-primary focus:outline-none focus:border-[var(--accent)]"
            >
              {FREQUENCIES.map(f => <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>
          </div>
          {form.frequency === 'custom' && (
            <div>
              <label className="text-[11px] text-muted block font-medium mb-1">Days</label>
              <div className="flex gap-1">
                {WEEKDAYS.map((d, i) => (
                  <button key={d} type="button" onClick={() => update('customDays',
                    form.customDays.includes(i) ? form.customDays.filter(x => x !== i) : [...form.customDays, i]
                  )}
                    className={`w-9 h-9 rounded-lg text-[10px] font-medium transition-all cursor-pointer border-0 ${
                      form.customDays.includes(i) ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-secondary)] text-muted'
                    }`}
                  >{d}</button>
                ))}
              </div>
            </div>
          )}
          {showTarget && (
            <div>
              <label className="text-[11px] text-muted block font-medium mb-1">Target</label>
              <div className="flex gap-1.5">
                <input type="number" value={form.target} onChange={e => update('target', e.target.value)}
                  placeholder="0" min="0"
                  className="w-20 rounded-xl px-3 py-2 text-xs bg-[var(--input-bg)] border border-[var(--border-color)] text-primary focus:outline-none focus:border-[var(--accent)]"
                />
                {form.type === 'custom' && (
                  <input value={form.unit} onChange={e => update('unit', e.target.value)}
                    placeholder="unit" className="flex-1 rounded-xl px-3 py-2 text-xs bg-[var(--input-bg)] border border-[var(--border-color)] text-primary focus:outline-none focus:border-[var(--accent)]"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted block font-medium mb-1">Priority</label>
            <div className="flex gap-1">
              {PRIORITIES.map(p => (
                <button key={p} type="button" onClick={() => update('priority', p)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] capitalize transition-all cursor-pointer border-0 ${
                    form.priority === p ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-secondary)] text-secondary'
                  }`}
                >{p}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted block font-medium mb-1">Difficulty</label>
            <div className="flex gap-1">
              {DIFFICULTIES.map(d => (
                <button key={d} type="button" onClick={() => { update('difficulty', d); update('xpValue', XP_MAP[d]) }}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] capitalize transition-all cursor-pointer border-0 ${
                    form.difficulty === d ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-secondary)] text-secondary'
                  }`}
                >{d} ({XP_MAP[d]}xp)</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-muted block font-medium mb-1">Notes (optional)</label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
            placeholder="Add any notes or description..."
            rows={2}
            className="w-full rounded-xl px-3 py-2 text-xs bg-[var(--input-bg)] border border-[var(--border-color)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent)] resize-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isPinned} onChange={e => update('isPinned', e.target.checked)}
            className="rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span className="text-xs text-secondary">Pin to top</span>
        </label>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1">{isEditing ? 'Save Changes' : 'Create Habit'}</Button>
        </div>
      </form>
    </Modal>
  )
}
