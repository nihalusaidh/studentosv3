import React, { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { X, Plus, CheckCircle2, Clock, AlertTriangle, Edit3, Trash2, Zap } from 'lucide-react'
import { getSubject, addAssessment, updateAssessment, deleteAssessment, saveMarks, calculateInternalMarks, predictGrade, whatIf, getRiskAnalysis, getHistory } from '../../utils/marksStorage'
import WhatIfCalculator from './WhatIfCalculator'

const ASSESSMENT_TYPES = ['CIA 1', 'CIA 2', 'CIA 3', 'Assignment', 'Quiz', 'Lab', 'Project', 'Record', 'Seminar', 'Presentation', 'Attendance', 'Model Exam', 'Mid Semester', 'Viva', 'Practical', 'Mini Project', 'Case Study']

export default function SubjectDetail({ subjectId, onClose }) {
  const subject = getSubject(subjectId)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)
  const [marksEntryFor, setMarksEntryFor] = useState(null)
  const [showWhatIf, setShowWhatIf] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const refresh = () => setRefreshKey(k => k + 1)

  const internal = useMemo(() => calculateInternalMarks(subjectId), [subjectId, refreshKey])
  const prediction = useMemo(() => predictGrade(subjectId), [subjectId, refreshKey])
  const risk = useMemo(() => getRiskAnalysis(subjectId), [subjectId, refreshKey])
  const history = useMemo(() => getHistory(subjectId), [subjectId, refreshKey])

  const [newAssess, setNewAssess] = useState({
    name: '', type: 'CIA 1', maxMarks: 100, weightage: 0, date: '', status: 'upcoming', remarks: '', groupId: ''
  })

  const [marksForm, setMarksForm] = useState({
    obtained: '', isAbsent: false, isMedicalLeave: false, isNotConducted: false, isCancelled: false, isRevaluation: false, revisedMarks: '', remarks: '', editReason: ''
  })

  if (!subject) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full text-center">
          <p className="text-gray-500">Subject not found.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm">Close</button>
        </div>
      </div>
    )
  }

  const handleAddAssessment = () => {
    if (!newAssess.name.trim()) { showToast('Enter assessment name', 'error'); return }
    const result = addAssessment(subjectId, {
      name: newAssess.name.trim(),
      type: newAssess.type,
      maxMarks: Number(newAssess.maxMarks),
      weightage: Number(newAssess.weightage),
      date: newAssess.date || null,
      status: newAssess.status,
      remarks: newAssess.remarks,
      groupId: newAssess.groupId || null
    })
    if (result) {
      showToast('Assessment added')
      setNewAssess({ name: '', type: 'CIA 1', maxMarks: 100, weightage: 0, date: '', status: 'upcoming', remarks: '', groupId: '' })
      setShowAddForm(false)
      refresh()
    }
  }

  const handleSaveMarks = () => {
    if (!marksEntryFor) return
    const data = {
      obtained: marksForm.obtained !== '' ? Number(marksForm.obtained) : null,
      isAbsent: marksForm.isAbsent,
      isMedicalLeave: marksForm.isMedicalLeave,
      isNotConducted: marksForm.isNotConducted,
      isCancelled: marksForm.isCancelled,
      isRevaluation: marksForm.isRevaluation,
      revisedMarks: marksForm.revisedMarks !== '' ? Number(marksForm.revisedMarks) : null,
      remarks: marksForm.remarks,
      editReason: marksForm.editReason
    }
    const result = saveMarks(subjectId, marksEntryFor.id, data)
    if (result?.error) showToast(result.error, 'error')
    else { showToast('Marks saved'); setMarksEntryFor(null); refresh() }
  }

  const openMarksEntry = (assessment) => {
    const m = assessment.marks || {}
    setMarksForm({
      obtained: m.obtained !== null && m.obtained !== undefined ? String(m.obtained) : '',
      isAbsent: m.isAbsent || false,
      isMedicalLeave: m.isMedicalLeave || false,
      isNotConducted: m.isNotConducted || false,
      isCancelled: m.isCancelled || false,
      isRevaluation: m.isRevaluation || false,
      revisedMarks: m.revisedMarks ? String(m.revisedMarks) : '',
      remarks: m.remarks || '',
      editReason: ''
    })
    setMarksEntryFor(assessment)
  }

  const openEdit = (assessment) => {
    setNewAssess({
      name: assessment.name,
      type: assessment.type,
      maxMarks: assessment.maxMarks,
      weightage: assessment.weightage,
      date: assessment.date || '',
      status: assessment.status,
      remarks: assessment.remarks || '',
      groupId: assessment.groupId || ''
    })
    setEditingAssessment(assessment.id)
    setShowAddForm(true)
  }

  const handleUpdateAssessment = () => {
    if (!newAssess.name.trim()) { showToast('Enter assessment name', 'error'); return }
    updateAssessment(subjectId, editingAssessment, {
      name: newAssess.name.trim(),
      type: newAssess.type,
      maxMarks: Number(newAssess.maxMarks),
      weightage: Number(newAssess.weightage),
      date: newAssess.date || null,
      status: newAssess.status,
      remarks: newAssess.remarks,
      groupId: newAssess.groupId || null
    })
    showToast('Assessment updated')
    setShowAddForm(false)
    setEditingAssessment(null)
    refresh()
  }

  const handleDeleteAssessment = (id) => {
    if (!window.confirm('Delete this assessment?')) return
    deleteAssessment(subjectId, id)
    showToast('Assessment deleted')
    refresh()
  }

  const totalWeightage = subject.assessments.reduce((s, a) => s + Number(a.weightage || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: subject.color || '#a855f7' }}>{subject.name.charAt(0).toUpperCase()}</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{subject.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{subject.semester || ''} {subject.faculty ? `— ${subject.faculty}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {risk && (
              <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${risk.level.bg} ${risk.level.color} ${risk.level.border} border`}>
                {risk.level.label}
              </span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={20} /></button>
          </div>
        </div>

        {toast && (
          <div className={`mx-5 mt-3 px-3 py-2 rounded-lg flex items-center gap-2 text-xs ${toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-600'}`}>
            {toast.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            {toast.msg}
          </div>
        )}

        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{internal.earned}/{internal.max}</p>
            <p className="text-[10px] text-gray-500">Internal Marks</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold" style={{ color: internal.percentage >= 50 ? '#10b981' : '#ef4444' }}>{internal.percentage}%</p>
            <p className="text-[10px] text-gray-500">Internal %</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{prediction?.grade || '-'}</p>
            <p className="text-[10px] text-gray-500">Current Grade</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-500">{subject.credits || '-'}</p>
            <p className="text-[10px] text-gray-500">Credits</p>
          </div>
        </div>

        <div className="px-5 pb-3 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Assessments</h3>
            <span className="text-xs text-gray-400">({subject.assessments.length})</span>
            <span className="text-xs text-gray-400">
              {subject.weightageMode === 'direct' ? `Total weightage: ${totalWeightage}/${subject.internalMax}` : `Weightage: ${totalWeightage}%`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowWhatIf(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-colors">
              <Zap size={12} /> What-If
            </button>
            <button onClick={() => { setEditingAssessment(null); setNewAssess({ name: '', type: 'CIA 1', maxMarks: 100, weightage: 0, date: '', status: 'upcoming', remarks: '', groupId: '' }); setShowAddForm(true) }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors">
              <Plus size={12} /> Add Assessment
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="mx-5 mb-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                <input value={newAssess.name} onChange={e => setNewAssess(p => ({ ...p, name: e.target.value }))} placeholder="e.g. CIA 1" className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
                <select value={newAssess.type} onChange={e => setNewAssess(p => ({ ...p, type: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none">
                  {ASSESSMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Max Marks</label>
                <input type="number" value={newAssess.maxMarks} onChange={e => setNewAssess(p => ({ ...p, maxMarks: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Weightage {subject.weightageMode === 'direct' ? '(marks)' : '(%)'}</label>
                <input type="number" value={newAssess.weightage} onChange={e => setNewAssess(p => ({ ...p, weightage: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                <input type="date" value={newAssess.date} onChange={e => setNewAssess(p => ({ ...p, date: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                <select value={newAssess.status} onChange={e => setNewAssess(p => ({ ...p, status: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Remarks (optional)</label>
                <input value={newAssess.remarks} onChange={e => setNewAssess(p => ({ ...p, remarks: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <button onClick={editingAssessment ? handleUpdateAssessment : handleAddAssessment} className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors self-end">
                {editingAssessment ? 'Update' : 'Add'}
              </button>
              <button onClick={() => { setShowAddForm(false); setEditingAssessment(null) }} className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs self-end">Cancel</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-1">
            {subject.assessments.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">No assessments yet. Add one to start tracking.</div>
            )}
            {[...subject.assessments].sort((a, b) => (a.date || '').localeCompare(b.date || '')).map(a => {
              const pct = a.marks && a.marks.obtained !== null ? Math.round((a.marks.obtained / a.maxMarks) * 100) : null
              return (
                <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => a.status !== 'cancelled' && openMarksEntry(a)}>
                  <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: a.status === 'completed' ? '#10b981' : a.status === 'cancelled' ? '#6b7280' : '#f59e0b' }} />
                  <span className="font-medium text-gray-900 dark:text-white w-28 shrink-0 truncate">{a.name}</span>
                  <span className="text-gray-400 w-20 shrink-0">{a.type}</span>
                  <span className="text-gray-500 w-14 shrink-0">{a.maxMarks} max</span>
                  <span className="text-gray-500 w-16 shrink-0">W: {a.weightage}{subject.weightageMode === 'percentage' ? '%' : ''}</span>
                  {a.status === 'completed' && a.marks && (
                    <>
                      <span className={`font-semibold w-16 shrink-0 ${pct >= 50 ? 'text-green-600' : 'text-red-500'}`}>{a.marks.obtained !== null ? `${a.marks.obtained}/${a.maxMarks}` : '-'}</span>
                      <span className={`w-10 shrink-0 font-medium ${pct >= 50 ? 'text-green-600' : 'text-red-500'}`}>{pct}%</span>
                    </>
                  )}
                  {a.status === 'completed' && a.marks?.isAbsent && <span className="text-orange-500 w-14 shrink-0 font-medium">Absent</span>}
                  {a.status === 'completed' && a.marks?.isMedicalLeave && <span className="text-blue-500 w-14 shrink-0 font-medium">Medical</span>}
                  {a.status === 'completed' && a.marks?.isRevaluation && <span className="text-purple-500 w-16 shrink-0 font-medium">Reval</span>}
                  {a.status === 'upcoming' && (
                    <>
                      <span className="text-yellow-500 w-16 shrink-0 flex items-center gap-1"><Clock size={10} /> {a.date ? format(parseISO(a.date), 'MMM dd') : 'TBD'}</span>
                    </>
                  )}
                  {a.status === 'cancelled' && <span className="text-gray-400 w-16 shrink-0 line-through">Cancelled</span>}
                  {a.remarks && <span className="text-gray-400 truncate max-w-[80px] hidden md:inline">{a.remarks}</span>}
                  <div className="ml-auto flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(a) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-purple-500 transition-colors"><Edit3 size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteAssessment(a.id) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {marksEntryFor && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setMarksEntryFor(null) }}>
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{marksEntryFor.name} — Marks Entry</h3>
                <button onClick={() => setMarksEntryFor(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Obtained Marks</label>
                    <input type="number" value={marksForm.obtained} onChange={e => setMarksForm(p => ({ ...p, obtained: e.target.value }))} placeholder={`0 - ${marksEntryFor.maxMarks}`} max={marksEntryFor.maxMarks} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div className="text-center">
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Max</label>
                    <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">{marksEntryFor.maxMarks}</div>
                  </div>
                  <div className="text-center">
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Weightage</label>
                    <div className="px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-sm font-medium">{marksEntryFor.weightage}{subject.weightageMode === 'percentage' ? '%' : ''}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={marksForm.isAbsent} onChange={e => setMarksForm(p => ({ ...p, isAbsent: e.target.checked }))} className="rounded" /> Absent</label>
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={marksForm.isMedicalLeave} onChange={e => setMarksForm(p => ({ ...p, isMedicalLeave: e.target.checked }))} className="rounded" /> Medical Leave</label>
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={marksForm.isNotConducted} onChange={e => setMarksForm(p => ({ ...p, isNotConducted: e.target.checked }))} className="rounded" /> Not Conducted</label>
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={marksForm.isCancelled} onChange={e => setMarksForm(p => ({ ...p, isCancelled: e.target.checked }))} className="rounded" /> Cancelled</label>
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={marksForm.isRevaluation} onChange={e => setMarksForm(p => ({ ...p, isRevaluation: e.target.checked }))} className="rounded" /> Revaluation</label>
                </div>
                {marksForm.isRevaluation && (
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Revised Marks (after revaluation)</label>
                    <input type="number" value={marksForm.revisedMarks} onChange={e => setMarksForm(p => ({ ...p, revisedMarks: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Remarks</label>
                  <input value={marksForm.remarks} onChange={e => setMarksForm(p => ({ ...p, remarks: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Optional" />
                </div>
                {marksEntryFor.marks && (
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Edit Reason</label>
                    <input value={marksForm.editReason} onChange={e => setMarksForm(p => ({ ...p, editReason: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Why are you editing?" />
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setMarksEntryFor(null)} className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                  <button onClick={handleSaveMarks} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25">Save Marks</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showWhatIf && <WhatIfCalculator subjectId={subjectId} onClose={() => setShowWhatIf(false)} />}
      </div>
    </div>
  )
}
