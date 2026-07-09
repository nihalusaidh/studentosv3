import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit3, Trash2, Calendar, Clock, Flag, CheckCircle2, Circle, AlertCircle, Search, Repeat, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTasks, saveTask, deleteTask, toggleTaskStatus } from '../utils/tasksStorage'
import { getSubjects } from '../utils/attendanceStorage'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO, isBefore, startOfDay } from 'date-fns'

const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', color: 'text-red-500', bg: 'bg-red-500/20', icon: AlertCircle },
  { value: 'high', label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/20', icon: Flag },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/20', icon: Flag },
  { value: 'low', label: 'Low', color: 'text-green-500', bg: 'bg-green-500/20', icon: Flag }
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' }
]

const RECUR_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [subjects, setSubjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', description: '', subjectId: '', subjectName: '', dueDate: '', dueTime: '', priority: 'medium', status: 'pending', notes: '', tags: '', recurring: { enabled: false, type: 'weekly', interval: 1 } })

  useEffect(() => { setTasks(getTasks()); setSubjects(getSubjects()) }, [])

  const refresh = () => { setTasks(getTasks()) }

  const handleSave = () => {
    if (!form.title.trim()) return toast.error('Title is required')
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    const data = editTask ? { ...form, tags, id: editTask.id } : { ...form, tags }
    saveTask(data)
    toast.success(editTask ? 'Task updated' : 'Task added')
    setShowForm(false); setEditTask(null); refresh()
  }

  const handleToggle = (id) => {
    const updated = toggleTaskStatus(id)
    if (updated?.recurring?.enabled && updated.status === 'completed') toast.success('Task completed — next occurrence created!')
    else toast.success(updated?.status === 'completed' ? 'Task completed!' : 'Task reopened')
    refresh()
  }

  const handleDelete = (id) => { deleteTask(id); refresh(); toast.success('Task deleted') }

  const handleEdit = (task) => {
    setForm({ title: task.title, description: task.description || '', subjectId: task.subjectId || '', subjectName: task.subjectName || '', dueDate: task.dueDate || '', dueTime: task.dueTime || '', priority: task.priority || 'medium', status: task.status || 'pending', notes: task.notes || '', tags: (task.tags || []).join(', '), recurring: task.recurring || { enabled: false, type: 'weekly', interval: 1 } })
    setEditTask(task); setShowForm(true)
  }

  const allTags = useMemo(() => {
    const set = new Set()
    tasks.forEach(t => (t.tags || []).forEach(tag => set.add(tag)))
    return [...set].sort()
  }, [tasks])

  const filteredTasks = useMemo(() => {
    let result = [...tasks]
    if (filter === 'overdue') result = result.filter(t => t.status !== 'completed' && t.dueDate && isBefore(parseISO(t.dueDate), startOfDay(new Date())))
    else if (filter !== 'all') result = result.filter(t => t.status === filter)
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter)
    if (tagFilter) result = result.filter(t => (t.tags || []).includes(tagFilter))
    if (search.trim()) result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.subjectName?.toLowerCase().includes(search.toLowerCase()) || (t.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase())))
    result.sort((a, b) => {
      const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      const pa = pOrder[a.priority] ?? 2, pb = pOrder[b.priority] ?? 2
      if (pa !== pb) return pa - pb
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      return 0
    })
    return result
  }, [tasks, filter, priorityFilter, tagFilter, search])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length
    const overdue = tasks.filter(t => t.status !== 'completed' && t.dueDate && isBefore(parseISO(t.dueDate), startOfDay(new Date()))).length
    return { total, completed, pending, overdue }
  }, [tasks])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Assignments & Tasks</h1>
          <p className="text-sm text-secondary">Track homework, projects, and deadlines</p>
        </div>
        <button onClick={() => { setForm({ title: '', description: '', subjectId: '', subjectName: '', dueDate: '', dueTime: '', priority: 'medium', status: 'pending', notes: '', tags: '', recurring: { enabled: false, type: 'weekly', interval: 1 } }); setEditTask(null); setShowForm(true) }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 cursor-pointer border-0">
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold gradient-text">{stats.total}</p>
          <p className="text-xs text-muted">Total</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          <p className="text-xs text-muted">Pending</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          <p className="text-xs text-muted">Done</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
          <p className="text-xs text-muted">Overdue</p>
        </GlassCard>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" />
        </div>
        <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-lg p-1">
          {STATUS_OPTIONS.map(s => (
            <button key={s.value} onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border-0 ${filter === s.value ? 'gradient-bg text-white shadow-sm' : 'text-secondary hover:text-primary bg-transparent'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-primary outline-none focus:border-[var(--accent)]">
          <option value="all">All Priority</option>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {allTags.map(tag => (
            <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border-0 ${tagFilter === tag ? 'gradient-bg text-white' : 'bg-[var(--bg-secondary)] text-secondary hover:text-primary'}`}>
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {filteredTasks.length === 0 && (
            <GlassCard className="p-8 text-center">
              <p className="text-secondary text-sm">No tasks found</p>
            </GlassCard>
          )}
          {filteredTasks.map(task => {
            const isOverdue = task.status !== 'completed' && task.dueDate && isBefore(parseISO(task.dueDate), startOfDay(new Date()))
            const priority = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[2]
            const PrioIcon = priority.icon

            return (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <GlassCard className={`p-4 group ${task.status === 'completed' ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleToggle(task.id)} className="mt-0.5 cursor-pointer border-0 bg-transparent p-1 -ml-1 flex-shrink-0">
                      {task.status === 'completed' ? <CheckCircle2 size={20} className="text-green-500" /> : isOverdue ? <AlertCircle size={20} className="text-red-500" /> : <Circle size={20} className="text-muted hover:text-[var(--accent)] transition-colors" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold text-primary ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {task.subjectName && <p className="text-xs text-muted">{task.subjectName}</p>}
                            {task.recurring?.enabled && <span className="text-[10px] text-[var(--accent)] flex items-center gap-0.5"><Repeat size={10} />{task.recurring.type}</span>}
                          </div>
                          {(task.tags || []).length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {(task.tags || []).map(tag => (
                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-muted">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge variant={priority.value === 'urgent' ? 'danger' : priority.value === 'high' ? 'warning' : priority.value === 'low' ? 'success' : 'default'} className="text-[10px]">{priority.label}</Badge>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(task)} className="p-1 rounded hover:bg-hover text-muted hover:text-primary cursor-pointer border-0 bg-transparent"><Edit3 size={12} /></button>
                            <button onClick={() => handleDelete(task.id)} className="p-1 rounded hover:bg-hover text-muted hover:text-red-400 cursor-pointer border-0 bg-transparent"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400 font-medium' : ''}`}>
                            <Calendar size={10} />
                            {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                            {task.dueTime && <><Clock size={10} />{task.dueTime}</>}
                            {isOverdue && '(overdue)'}
                          </span>
                        )}
                        {task.description && <span className="truncate max-w-[200px]">{task.description}</span>}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditTask(null) }} title={editTask ? 'Edit Task' : 'New Task'} size="md">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" placeholder="Complete assignment..." />
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)] resize-none" placeholder="Details..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Subject</label>
              <select value={form.subjectId} onChange={e => {
                const sub = subjects.find(s => s.id === e.target.value)
                setForm({ ...form, subjectId: e.target.value, subjectName: sub ? sub.name : '' })
              }} className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]">
                <option value="">None</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Priority</label>
              <div className="flex gap-1">
                {PRIORITIES.map(p => (
                  <button key={p.value} onClick={() => setForm({ ...form, priority: p.value })}
                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 ${form.priority === p.value ? `${p.bg} ${p.color}` : 'text-secondary bg-[var(--bg-secondary)] hover:text-primary'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Time (optional)</label>
              <input type="time" value={form.dueTime} onChange={e => setForm({ ...form, dueTime: e.target.value })}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" placeholder="e.g. exam, group-project, revision" />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.recurring.enabled} onChange={e => setForm({ ...form, recurring: { ...form.recurring, enabled: e.target.checked } })}
                className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer" />
              <span className="text-xs font-medium text-secondary">Repeat</span>
            </label>
            {form.recurring.enabled && (
              <select value={form.recurring.type} onChange={e => setForm({ ...form, recurring: { ...form.recurring, type: e.target.value } })}
                className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs text-primary outline-none">
                {RECUR_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)] resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowForm(false); setEditTask(null) }} className="px-4 py-2 rounded-lg text-sm text-secondary hover:bg-hover transition-colors cursor-pointer border-0 bg-transparent">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium gradient-bg text-white hover:opacity-90 transition-all cursor-pointer border-0">
              {editTask ? 'Update' : 'Add Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
