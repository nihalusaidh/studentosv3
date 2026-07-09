import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Edit3, Trash2, GraduationCap, Calculator, Download } from 'lucide-react'
import { getSemesters, saveSemester, deleteSemester, calculateGPA, calculateCGPA, getEmptySubjects } from '../utils/gpaStorage'
import { downloadGradesCsv } from '../utils/exportUtils'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'

export default function Grades() {
  const [semesters, setSemesters] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editSem, setEditSem] = useState(null)
  const [semName, setSemName] = useState('')
  const [subjects, setSubjects] = useState(getEmptySubjects(5))

  useEffect(() => { setSemesters(getSemesters()) }, [])

  const refresh = () => { setSemesters(getSemesters()) }

  const cgpa = useMemo(() => calculateCGPA(semesters), [semesters])

  const handleSave = () => {
    if (!semName.trim()) return toast.error('Semester name is required')
    const validSubjects = subjects.filter(s => s.name.trim())
    if (validSubjects.length === 0) return toast.error('Add at least one subject')
    const data = editSem ? { ...editSem, name: semName, subjects: validSubjects } : { name: semName, subjects: validSubjects }
    saveSemester(data)
    toast.success(editSem ? 'Semester updated' : 'Semester added')
    setShowForm(false); setEditSem(null); refresh()
  }

  const handleEdit = (sem) => {
    setSemName(sem.name)
    setSubjects(sem.subjects.length > 0 ? sem.subjects.map(s => ({ ...s })) : getEmptySubjects(5))
    setEditSem(sem); setShowForm(true)
  }

  const handleDelete = (id) => { deleteSemester(id); refresh(); toast.success('Semester removed') }

  const handleSubjectChange = (i, field, value) => {
    const updated = [...subjects]
    updated[i] = { ...updated[i], [field]: value }
    setSubjects(updated)
  }

  const addSubject = () => setSubjects([...subjects, { name: '', credits: 3, percentage: '' }])
  const removeSubject = (i) => setSubjects(subjects.filter((_, idx) => idx !== i))

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">GPA & SGPA Calculator</h1>
          <p className="text-sm text-secondary">Track your academic performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => downloadGradesCsv(semesters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-secondary hover:text-primary text-xs font-medium hover:bg-white/[0.1] transition-all cursor-pointer border-0">
            <Download size={14} /> Export
          </button>
          <button onClick={() => { setSemName(''); setSubjects(getEmptySubjects(5)); setEditSem(null); setShowForm(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 cursor-pointer border-0">
            <Plus size={16} /> Add Semester
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-muted uppercase tracking-wider">Semesters</p>
          <p className="text-3xl font-bold gradient-text mt-1">{semesters.length}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-muted uppercase tracking-wider">Current CGPA</p>
          <p className="text-3xl font-bold text-[var(--accent)] mt-1">{cgpa}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-muted uppercase tracking-wider">Status</p>
          <p className="text-sm font-semibold mt-1">
            <Badge variant={cgpa >= 8 ? 'success' : cgpa >= 6 ? 'warning' : 'danger'}>
              {cgpa >= 8 ? 'Excellent' : cgpa >= 6 ? 'Good' : cgpa > 0 ? 'Needs Improvement' : 'N/A'}
            </Badge>
          </p>
        </GlassCard>
      </div>

      <div className="space-y-3">
        {semesters.length === 0 && (
          <GlassCard className="p-8 text-center">
            <Calculator size={32} className="mx-auto text-muted mb-2" />
            <p className="text-secondary text-sm">No semesters yet. Add your first semester to calculate GPA.</p>
          </GlassCard>
        )}
        {semesters.map(sem => {
          const result = calculateGPA(sem.subjects)
          return (
            <motion.div key={sem.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-primary">{sem.name}</h3>
                    <p className="text-xs text-muted">{result.subjects.length} subjects · {result.totalCredits} credits</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold gradient-text">{result.gpa}</p>
                      <p className="text-[10px] text-muted">GPA</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(sem)} className="p-1.5 rounded hover:bg-hover text-muted hover:text-primary cursor-pointer border-0 bg-transparent"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(sem.id)} className="p-1.5 rounded hover:bg-hover text-muted hover:text-red-400 cursor-pointer border-0 bg-transparent"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {result.subjects.map((sub, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)] text-xs">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: sub.grade === 'S' ? 'rgba(34,197,94,0.2)' : sub.grade === 'A' ? 'rgba(59,130,246,0.2)' : sub.grade === 'B' ? 'rgba(234,179,8,0.2)' : sub.grade === 'F' ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
                          color: sub.grade === 'S' ? '#22c55e' : sub.grade === 'A' ? '#3b82f6' : sub.grade === 'B' ? '#eab308' : sub.grade === 'F' ? '#ef4444' : '#6b7280'
                        }}>
                        {sub.grade}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary truncate">{sub.name}</p>
                        <p className="text-muted">{sub.percentage}% · {sub.credit} credits</p>
                      </div>
                      <span className="font-semibold text-primary">{sub.points}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditSem(null) }} title={editSem ? 'Edit Semester' : 'New Semester'} size="lg">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Semester Name</label>
            <input value={semName} onChange={e => setSemName(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" placeholder="e.g. Semester 1" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-secondary">Subjects</label>
              <button onClick={addSubject} className="text-xs text-[var(--accent)] hover:underline cursor-pointer border-0 bg-transparent font-medium">+ Add Subject</button>
            </div>
            {subjects.map((sub, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={sub.name} onChange={e => handleSubjectChange(i, 'name', e.target.value)} placeholder="Subject name"
                  className="flex-1 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)]" />
                <input type="number" value={sub.credits} onChange={e => handleSubjectChange(i, 'credits', e.target.value)} placeholder="Credits" min="1" max="10"
                  className="w-20 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)] text-center" />
                <input type="number" value={sub.percentage} onChange={e => handleSubjectChange(i, 'percentage', e.target.value)} placeholder="%" min="0" max="100"
                  className="w-20 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-[var(--accent)] text-center" />
                {subjects.length > 1 && (
                  <button onClick={() => removeSubject(i)} className="p-1.5 rounded hover:bg-hover text-muted hover:text-red-400 cursor-pointer border-0 bg-transparent"><X size={14} /></button>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setShowForm(false); setEditSem(null) }} className="px-4 py-2 rounded-lg text-sm text-secondary hover:bg-hover transition-colors cursor-pointer border-0 bg-transparent">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium gradient-bg text-white hover:opacity-90 transition-all cursor-pointer border-0">
              {editSem ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
