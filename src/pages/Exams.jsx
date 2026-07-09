import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit3, Trash2, Calendar, Clock, MapPin, BookOpen, AlertTriangle, Download } from 'lucide-react'
import { downloadExamsCsv } from '../utils/exportUtils'
import { motion, AnimatePresence } from 'framer-motion'
import { getExams, saveExam, deleteExam, getUpcomingExams, getPastExams, getExamCountdown } from '../utils/examStorage'
import { getSubjects } from '../utils/attendanceStorage'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

function safeFormatDate(dateStr, fmt) {
  try { return dateStr ? format(parseISO(dateStr), fmt) : '' } catch { return dateStr || '' }
}

export default function Exams() {
  const [exams, setExams] = useState([])
  const [subjects, setSubjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editExam, setEditExam] = useState(null)
  const [tab, setTab] = useState('upcoming')
  const [form, setForm] = useState({ title: '', subjectId: '', subjectName: '', examDate: '', startTime: '', endTime: '', room: '', syllabus: '', maxMarks: '', type: 'midterm', color: '#ef4444', notes: '' })

  useEffect(() => { setExams(getExams()); setSubjects(getSubjects()) }, [])

  const refresh = () => { setExams(getExams()) }

  const handleSave = () => {
    if (!form.title.trim()) return toast.error('Exam title is required')
    if (!form.examDate) return toast.error('Exam date is required')
    const data = editExam ? { ...form, id: editExam.id } : { ...form }
    saveExam(data)
    toast.success(editExam ? 'Exam updated' : 'Exam added')
    setShowForm(false); setEditExam(null); refresh()
  }

  const handleDelete = (id) => { deleteExam(id); refresh(); toast.success('Exam removed') }

  const handleEdit = (exam) => {
    setForm({ title: exam.title, subjectId: exam.subjectId || '', subjectName: exam.subjectName || '', examDate: exam.examDate || '', startTime: exam.startTime || '', endTime: exam.endTime || '', room: exam.room || '', syllabus: exam.syllabus || '', maxMarks: exam.maxMarks || '', type: exam.type || 'midterm', color: exam.color || '#ef4444', notes: exam.notes || '' })
    setEditExam(exam); setShowForm(true)
  }

  const upcoming = useMemo(() => getUpcomingExams(), [exams])
  const past = useMemo(() => getPastExams(), [exams])
  const nextExam = useMemo(() => upcoming[0] || null, [upcoming])

  const countdown = useMemo(() => nextExam ? getExamCountdown(nextExam) : null, [nextExam])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Exam Countdown</h1>
          <p className="text-sm text-secondary">Track your exams and deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => downloadExamsCsv(exams)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-secondary hover:text-primary text-xs font-medium hover:bg-white/[0.1] transition-all cursor-pointer border-0">
            <Download size={14} /> Export
          </button>
          <button onClick={() => { setForm({ title: '', subjectId: '', subjectName: '', examDate: '', startTime: '', endTime: '', room: '', syllabus: '', maxMarks: '', type: 'midterm', color: '#ef4444', notes: '' }); setEditExam(null); setShowForm(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 cursor-pointer border-0">
            <Plus size={16} /> Add Exam
          </button>
        </div>
      </div>

      {nextExam && (
        <GlassCard className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <AlertTriangle size={128} className={countdown?.urgent ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">Next Exam</p>
              <h2 className="text-xl font-bold text-primary mt-1">{nextExam.title}</h2>
              {nextExam.subjectName && <p className="text-sm text-secondary mt-0.5">{nextExam.subjectName}</p>}
              <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                <span className="flex items-center gap-1"><Calendar size={12} />{safeFormatDate(nextExam.examDate, 'EEEE, MMMM d, yyyy')}</span>
                {nextExam.startTime && <span className="flex items-center gap-1"><Clock size={12} />{nextExam.startTime}{nextExam.endTime ? ` - ${nextExam.endTime}` : ''}</span>}
                {nextExam.room && <span className="flex items-center gap-1"><MapPin size={12} />{nextExam.room}</span>}
              </div>
            </div>
            <div className="text-center flex-shrink-0">
              <div className={`text-4xl font-bold ${countdown?.urgent ? 'text-red-500 animate-pulse' : 'text-[var(--accent)]'}`}>
                {countdown?.days}
              </div>
              <div className={`text-xs font-medium mt-1 ${countdown?.urgent ? 'text-red-400' : 'text-muted'}`}>
                {countdown?.label}
              </div>
              <Badge variant={countdown?.urgent ? 'danger' : 'default'} className="mt-1">
                {countdown?.days === 0 ? 'Today!' : countdown?.days <= 7 ? 'Coming soon' : `${countdown?.days} days left`}
              </Badge>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-lg p-1 w-fit">
        <button onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer border-0 ${tab === 'upcoming' ? 'gradient-bg text-white shadow-sm' : 'text-secondary hover:text-primary bg-transparent'}`}>
          Upcoming ({upcoming.length})
        </button>
        <button onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer border-0 ${tab === 'past' ? 'gradient-bg text-white shadow-sm' : 'text-secondary hover:text-primary bg-transparent'}`}>
          Past ({past.length})
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {(tab === 'upcoming' ? upcoming : past).length === 0 && (
            <GlassCard className="p-8 text-center">
              <p className="text-secondary text-sm">No {tab} exams</p>
            </GlassCard>
          )}
          {(tab === 'upcoming' ? upcoming : past).map(exam => {
            const cd = exam ? getExamCountdown(exam) : null
            return (
              <motion.div key={exam.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <GlassCard className="p-4" hover>
                  <div className="flex items-center gap-4" onClick={() => handleEdit(exam)}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ backgroundColor: exam.color + '20', color: exam.color }}>
                      {exam.type === 'final' ? '📝' : exam.type === 'quiz' ? '📋' : exam.type === 'lab' ? '🔬' : '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-primary">{exam.title}</p>
                          {exam.subjectName && <p className="text-xs text-muted">{exam.subjectName}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {cd && <Badge variant={cd.urgent ? 'danger' : cd.days <= 14 ? 'warning' : 'default'}>{cd.label}</Badge>}
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(exam) }} className="p-1.5 rounded hover:bg-hover text-muted hover:text-primary cursor-pointer border-0 bg-transparent"><Edit3 size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(exam.id) }} className="p-1.5 rounded hover:bg-hover text-muted hover:text-red-400 cursor-pointer border-0 bg-transparent"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted">
                        <span><Calendar size={10} className="inline mr-1" />{safeFormatDate(exam.examDate, 'MMM d, yyyy')}</span>
                        {exam.startTime && <span><Clock size={10} className="inline mr-1" />{exam.startTime}{exam.endTime ? `-${exam.endTime}` : ''}</span>}
                        {exam.room && <span><MapPin size={10} className="inline mr-1" />{exam.room}</span>}
                        {exam.syllabus && <span className="truncate max-w-[150px]"><BookOpen size={10} className="inline mr-1" />{exam.syllabus}</span>}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditExam(null) }} title={editExam ? 'Edit Exam' : 'Add Exam'} size="md">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" placeholder="Midterm Exam" />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]">
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="quiz">Quiz</option>
                <option value="lab">Lab Exam</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Date *</label>
              <input type="date" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-secondary block mb-1">Start</label>
                <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" />
              </div>
              <div>
                <label className="text-xs font-medium text-secondary block mb-1">End</label>
                <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Room</label>
              <input value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" placeholder="Hall 1" />
            </div>
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Max Marks</label>
              <input type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })}
                className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" placeholder="100" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Syllabus / Topics</label>
            <textarea value={form.syllabus} onChange={e => setForm({ ...form, syllabus: e.target.value })} rows={2}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)] resize-none" placeholder="Units 1-3, Chapters 5-8..." />
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)] resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowForm(false); setEditExam(null) }} className="px-4 py-2 rounded-lg text-sm text-secondary hover:bg-hover transition-colors cursor-pointer border-0 bg-transparent">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium gradient-bg text-white hover:opacity-90 transition-all cursor-pointer border-0">
              {editExam ? 'Update' : 'Add Exam'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
