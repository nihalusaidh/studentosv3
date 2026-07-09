import React, { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { X, Plus, Clock, CalendarDays, Palette, BookOpen, User, Beaker, Percent } from 'lucide-react'
import { getSubject, saveSubject } from '../../utils/attendanceStorage'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const COLORS = ['#a855f7', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

const COLORS$1 = COLORS

function createSlot(day = 'Monday') {
  return { slotId: uuidv4().slice(0, 8), day, startTime: '09:00', endTime: '09:50' }
}

export default function SubjectForm({ onClose, editSubjectId = null }) {
  const [name, setName] = useState('')
  const [faculty, setFaculty] = useState('')
  const [color, setColor] = useState('#a855f7')
  const [semester, setSemester] = useState('')
  const [schedule, setSchedule] = useState([createSlot()])
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 4)
    return d.toISOString().split('T')[0]
  })
  const [requiredPct, setRequiredPct] = useState(75)
  const [batch, setBatch] = useState('')
  const [preserveExisting, setPreserveExisting] = useState(true)

  useEffect(() => {
    if (editSubjectId) {
      const sub = getSubject(editSubjectId)
      if (sub) {
        setName(sub.name || '')
        setFaculty(sub.faculty || '')
        setColor(sub.color || '#a855f7')
        setSemester(sub.semester || '')
        setSchedule(sub.schedule && sub.schedule.length > 0 ? sub.schedule : [createSlot()])
        setStartDate(sub.startDate || '')
        setEndDate(sub.endDate || '')
        setRequiredPct(sub.requiredPct || 75)
        setBatch(sub.batch || '')
      }
    }
  }, [editSubjectId])

  const addSlot = useCallback(() => {
    setSchedule(prev => [...prev, createSlot()])
  }, [])

  const removeSlot = useCallback((slotId) => {
    setSchedule(prev => {
      if (prev.length <= 1) return prev
      return prev.filter(s => s.slotId !== slotId)
    })
  }, [])

  const updateSlot = useCallback((slotId, field, value) => {
    setSchedule(prev => prev.map(s => s.slotId === slotId ? { ...s, [field]: value } : s))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...(editSubjectId ? { id: editSubjectId } : {}),
      name: name.trim(),
      faculty: faculty.trim(),
      color,
      semester: semester.trim() || 'Unknown',
      schedule: schedule.map(s => ({ ...s, day: s.day })),
      startDate,
      endDate,
      requiredPct: Number(requiredPct),
      batch: batch.trim()
    }
    saveSubject(payload)
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose() }}>
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editSubjectId ? 'Edit Subject' : 'Add Subject'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Digital Logic Design" className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Faculty</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={faculty} onChange={e => setFaculty(e.target.value)} placeholder="e.g. Dr. Smith" className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
              <div className="relative">
                <Beaker size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={semester} onChange={e => setSemester(e.target.value)} placeholder="e.g. Fall 2026" className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={batch} onChange={e => setBatch(e.target.value)} placeholder="e.g. BSCS 3A" className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Required %</label>
              <div className="relative">
                <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" min={0} max={100} value={requiredPct} onChange={e => setRequiredPct(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS$1.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Class Schedule</label>
              <button type="button" onClick={addSlot} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors">
                <Plus size={16} /> Add Slot
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {schedule.map((slot, idx) => (
                <div key={slot.slotId} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-400 w-5">{idx + 1}.</span>
                  <select value={slot.day} onChange={e => updateSlot(slot.slotId, 'day', e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="relative w-28">
                    <Clock size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="time" value={slot.startTime} onChange={e => updateSlot(slot.slotId, 'startTime', e.target.value)} className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <span className="text-gray-400 text-xs">to</span>
                  <div className="relative w-28">
                    <Clock size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="time" value={slot.endTime} onChange={e => updateSlot(slot.slotId, 'endTime', e.target.value)} className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  {schedule.length > 1 && (
                    <button type="button" onClick={() => removeSlot(slot.slotId)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-sm hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25">
            {editSubjectId ? 'Update Subject' : 'Add Subject'}
          </button>
        </form>
      </div>
    </div>
  )
}
