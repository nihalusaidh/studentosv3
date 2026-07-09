import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../ui/GlassCard'
import Badge from '../ui/Badge'
import { ListTodo, Calendar, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { getTasks, toggleTaskStatus } from '../../utils/tasksStorage'
import { format, parseISO, isBefore, startOfDay } from 'date-fns'
import toast from 'react-hot-toast'

export default function UpcomingTasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    function refresh() {
      const all = getTasks()
      const now = new Date()
      const pendingTasks = all
        .filter(t => t.status !== 'completed')
        .sort((a, b) => {
          if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
          if (a.dueDate) return -1
          return 1
        })
        .slice(0, 4)
      setTasks(pendingTasks)
    }
    refresh()
    const interval = setInterval(refresh, 2000)
    return () => clearInterval(interval)
  }, [])

  if (tasks.length === 0) return null

  const handleToggle = (e, id) => {
    e.stopPropagation()
    toggleTaskStatus(id)
    toast.success('Task toggled')
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <GlassCard className="p-4 cursor-pointer" onClick={() => navigate('/tasks')}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <ListTodo size={16} className="text-[var(--accent)]" />
          Upcoming Tasks
        </h3>
        <ChevronRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
      </div>
      <div className="space-y-2">
        {tasks.map(task => {
          const isOverdue = task.dueDate && isBefore(parseISO(task.dueDate), startOfDay(new Date()))
          return (
            <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-secondary)]">
              <button onClick={(e) => handleToggle(e, task.id)} className="cursor-pointer border-0 bg-transparent p-0 flex-shrink-0">
                {isOverdue ? <AlertCircle size={14} className="text-red-500" /> : <CheckCircle2 size={14} className="text-muted hover:text-green-500 transition-colors" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary truncate">{task.title}</p>
                <p className="text-[10px] text-muted">
                  {task.dueDate && <>{format(parseISO(task.dueDate), 'MMM d')} {isOverdue && '(overdue)'}</>}
                </p>
              </div>
              {task.priority === 'urgent' && <Badge variant="danger" className="text-[9px] px-1">Urgent</Badge>}
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
