import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, BarChart3, CheckCircle2, AlertTriangle, BookOpen, TrendingUp, TrendingDown, X, Zap, Upload } from 'lucide-react'
import { getSubjects, saveSubject, deleteSubject, calculateInternalMarks, getSemesterOverview, getRiskAnalysis } from '../utils/marksStorage'
import { v4 as uuidv4 } from 'uuid'
import SubjectDetail from '../components/marks/SubjectDetail'
import MarksSimulator from '../components/marks/MarksSimulator'

const COLORS = ['#a855f7', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

export default function Internals() {
  const [subjects, setSubjects] = useState([])
  const [detailSubjectId, setDetailSubjectId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editSubjectId, setEditSubjectId] = useState(null)
  const [showSimulator, setShowSimulator] = useState(false)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({
    name: '', faculty: '', credits: '', semester: '', department: '', color: '#a855f7',
    internalMax: 40, externalMax: 60, passingInternal: 20, passingExternal: 30, weightageMode: 'direct', gradingType: 'absolute'
  })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const refresh = useCallback(() => {
    setSubjects(getSubjects())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const overview = useMemo(() => getSemesterOverview(), [subjects])

  const resetForm = () => {
    setForm({ name: '', faculty: '', credits: '', semester: '', department: '', color: '#a855f7',
      internalMax: 40, externalMax: 60, passingInternal: 20, passingExternal: 30, weightageMode: 'direct', gradingType: 'absolute' })
    setEditSubjectId(null)
  }

  const openEdit = (id) => {
    const sub = getSubjects().find(s => s.id === id)
    if (!sub) return
    setForm({
      name: sub.name || '',
      faculty: sub.faculty || '',
      credits: sub.credits || '',
      semester: sub.semester || '',
      department: sub.department || '',
      color: sub.color || '#a855f7',
      internalMax: sub.internalMax || 40,
      externalMax: sub.externalMax || 60,
      passingInternal: sub.passingInternal || 20,
      passingExternal: sub.passingExternal || 30,
      weightageMode: sub.weightageMode || 'direct',
      gradingType: sub.gradingType || 'absolute'
    })
    setEditSubjectId(id)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) { showToast('Enter subject name'); return }
    saveSubject({
      ...(editSubjectId ? { id: editSubjectId } : {}),
      name: form.name.trim(),
      faculty: form.faculty.trim(),
      credits: form.credits ? Number(form.credits) : 0,
      semester: form.semester.trim(),
      department: form.department.trim(),
      color: form.color,
      internalMax: Number(form.internalMax),
      externalMax: Number(form.externalMax),
      passingInternal: Number(form.passingInternal),
      passingExternal: Number(form.passingExternal),
      weightageMode: form.weightageMode,
      gradingType: form.gradingType
    })
    showToast(editSubjectId ? 'Subject updated' : 'Subject added')
    setShowForm(false)
    resetForm()
    refresh()
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this subject and all its marks data?')) return
    deleteSubject(id)
    showToast('Subject deleted')
    refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Internal Marks</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your academic performance</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSimulator(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-all border border-yellow-200 dark:border-yellow-700">
              <Zap size={16} /> Simulator
            </button>
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-all border border-blue-200 dark:border-blue-700 cursor-pointer">
              <Upload size={16} /> Import
              <input type="file" accept=".csv" className="hidden" onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (ev) => {
                  try {
                    const text = ev.target?.result
                    if (typeof text !== 'string') return
                    const lines = text.split('\n').filter(l => l.trim())
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
                    const subjects = getSubjects()
                    let imported = 0
                    for (let i = 1; i < lines.length; i++) {
                      const vals = lines[i].split(',').map(v => v.trim())
                      const row = {}
                      headers.forEach((h, j) => row[h] = vals[j] || '')
                      if (!row.name) continue
                      const existing = subjects.find(s => s.name.toLowerCase() === row.name.toLowerCase())
                      if (existing) {
                        if (row.score) existing.assessments = existing.assessments || []
                        existing.assessments.push({
                          id: uuidv4(), name: row.assessment || 'Imported', type: row.type || 'other',
                          maxMarks: parseInt(row.maxmarks) || 100, obtained: parseFloat(row.score) || 0,
                          weightage: parseFloat(row.weightage) || 100, date: row.date || new Date().toISOString().slice(0, 10),
                          status: 'completed', remarks: row.remarks || ''
                        })
                      } else {
                        subjects.push({
                          id: uuidv4(), name: row.name, faculty: row.faculty || '', credits: row.credits || '3',
                          semester: row.semester || '1', department: row.department || '',
                          color: COLORS[subjects.length % COLORS.length],
                          internalMax: parseInt(row.internalmax) || 40, externalMax: parseInt(row.externalmax) || 60,
                          passingInternal: parseInt(row.passinginternal) || 20, passingExternal: parseInt(row.passingexternal) || 30,
                          weightageMode: 'direct', gradingType: 'absolute',
                          assessments: row.score ? [{ id: uuidv4(), name: row.assessment || 'Imported', type: row.type || 'other',
                            maxMarks: parseInt(row.maxmarks) || 100, obtained: parseFloat(row.score) || 0,
                            weightage: parseFloat(row.weightage) || 100, date: row.date || new Date().toISOString().slice(0, 10),
                            status: 'completed', remarks: row.remarks || ''
                          }] : []
                        })
                      }
                      imported++
                    }
                    const data = JSON.parse(localStorage.getItem('student-os-marks') || '{"subjects":[],"settings":{"gradeScale":[]}}')
                    data.subjects = subjects
                    localStorage.setItem('student-os-marks', JSON.stringify(data))
                    refresh()
                    showToast(`Imported ${imported} subject(s)`)
                  } catch { showToast('Import failed — check CSV format') }
                  e.target.value = ''
                }
                reader.readAsText(file)
              }} />
            </label>
            <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25">
              <Plus size={18} /> Add Subject
            </button>
          </div>
        </div>

        {toast && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <CheckCircle2 size={16} /> {toast}
          </div>
        )}

        {overview && subjects.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{overview.subjectCount}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Subjects</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{overview.avgPct}%</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Avg Internal</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-lg font-bold text-blue-500">{overview.expectedGrade}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Expected Grade</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{overview.completedCount}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Completed</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-lg font-bold text-yellow-500">{overview.upcomingCount}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Upcoming</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className={`text-lg font-bold ${overview.atRisk > 0 ? 'text-red-500' : 'text-green-600'}`}>{overview.atRisk}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">At Risk</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{overview.totalCredits}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Credits</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {overview.highest.name && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300">
                  <TrendingUp size={12} />
                  Best: <span className="font-semibold" style={{ color: overview.highest.color }}>{overview.highest.name}</span> ({overview.highest.pct}%)
                </div>
              )}
              {overview.lowest.name && overview.lowest.pct < 100 && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600">
                  <TrendingDown size={12} />
                  Needs focus: <span className="font-semibold" style={{ color: overview.lowest.color }}>{overview.lowest.name}</span> ({overview.lowest.pct}%)
                </div>
              )}
            </div>
          </div>
        )}

        {subjects.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">No subjects yet</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Add your first subject to track internal marks</p>
            <button onClick={() => { resetForm(); setShowForm(true) }} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 inline-flex items-center gap-2">
              <Plus size={16} /> Add Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(sub => {
              const internal = calculateInternalMarks(sub.id)
              const risk = getRiskAnalysis(sub.id)
              const assessmentCounts = {
                total: sub.assessments?.length || 0,
                completed: sub.assessments?.filter(a => a.status === 'completed').length || 0,
                upcoming: sub.assessments?.filter(a => a.status === 'upcoming').length || 0
              }
              const color = sub.color || '#a855f7'
              return (
                <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailSubjectId(sub.id)}>
                  <div className="p-4" style={{ borderLeft: `4px solid ${color}` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">{sub.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {sub.semester && `${sub.semester}`} {sub.faculty && `— ${sub.faculty}`}
                        </p>
                      </div>
                      {risk && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${risk.level.bg} ${risk.level.color} ${risk.level.border} border shrink-0`}>
                          {risk.level.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-200 dark:text-gray-700" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="2" strokeDasharray={`${internal.percentage} 100`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">{internal.percentage}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs flex-1">
                        <div className="text-gray-700 dark:text-gray-300">
                          Internal: <span className="font-semibold">{internal.earned}/{internal.max}</span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          External: <span className="font-semibold">0/{sub.externalMax}</span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Credit: <span className="font-semibold">{sub.credits || '-'}</span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Assessments: <span className="font-semibold">{assessmentCounts.completed}/{assessmentCounts.total}</span>
                        </div>
                      </div>
                    </div>

                    {assessmentCounts.upcoming > 0 && (
                      <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 mb-1">
                        <AlertTriangle size={12} /> {assessmentCounts.upcoming} upcoming
                      </div>
                    )}

                    {risk && risk.suggestions.length > 0 && (
                      <div className={`p-2 rounded-lg ${risk.level.bg} ${risk.level.border} border text-[10px] ${risk.level.color}`}>
                        {risk.suggestions[0]}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); resetForm() } }}>
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editSubjectId ? 'Edit Subject' : 'Add Subject'}</h2>
              </div>
              <button onClick={() => { setShowForm(false); resetForm() }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Digital Logic" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Faculty</label>
                  <input value={form.faculty} onChange={e => setForm(p => ({ ...p, faculty: e.target.value }))} placeholder="Optional" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
                  <input type="number" value={form.credits} onChange={e => setForm(p => ({ ...p, credits: e.target.value }))} placeholder="e.g. 4" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                  <input value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} placeholder="e.g. Fall 2026" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. BSCS" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-700" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Internal Max</label>
                  <input type="number" value={form.internalMax} onChange={e => setForm(p => ({ ...p, internalMax: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">External Max</label>
                  <input type="number" value={form.externalMax} onChange={e => setForm(p => ({ ...p, externalMax: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Internal</label>
                  <input type="number" value={form.passingInternal} onChange={e => setForm(p => ({ ...p, passingInternal: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Passing External</label>
                  <input type="number" value={form.passingExternal} onChange={e => setForm(p => ({ ...p, passingExternal: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Weightage Mode</label>
                <select value={form.weightageMode} onChange={e => setForm(p => ({ ...p, weightageMode: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="direct">Mode 1: Direct Total (marks sum to internal max)</option>
                  <option value="percentage">Mode 2: Percentage Weightage</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  {form.weightageMode === 'direct'
                    ? 'Each assessment weightage = max marks contributed. Sum equals internal max.'
                    : 'Each assessment weightage = % contribution. Weighted average of all assessments.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Grading Type</label>
                <select value={form.gradingType} onChange={e => setForm(p => ({ ...p, gradingType: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="absolute">Absolute — fixed grade thresholds (e.g., 90% = S)</option>
                  <option value="relative">Relative — grade depends on class performance</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  {form.gradingType === 'absolute'
                    ? 'Simulator will show exact predicted grade based on percentage.'
                    : 'Simulator will show approximate grade range since relative grading depends on class average.'}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowForm(false); resetForm() }} className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25">{editSubjectId ? 'Update' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSimulator && (
        <MarksSimulator onClose={() => setShowSimulator(false)} />
      )}

      {detailSubjectId && (
        <SubjectDetail
          subjectId={detailSubjectId}
          onClose={() => { setDetailSubjectId(null); refresh() }}
        />
      )}
    </div>
  )
}
