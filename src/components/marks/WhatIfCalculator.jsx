import React, { useState, useMemo } from 'react'
import { X, Zap, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { getSubject, whatIf, calculateInternalMarks } from '../../utils/marksStorage'

export default function WhatIfCalculator({ subjectId, onClose }) {
  const subject = getSubject(subjectId)
  const [changes, setChanges] = useState({})
  const current = useMemo(() => calculateInternalMarks(subjectId), [subjectId])

  if (!subject) return null

  const unmarkedAssessments = subject.assessments.filter(a =>
    a.status === 'upcoming' || (a.status === 'completed' && (!a.marks || a.marks.obtained === null))
  )

  const toggleAssessment = (id) => {
    setChanges(prev => {
      if (prev[id]) {
        const { [id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: '' }
    })
  }

  const setValue = (id, val) => {
    setChanges(prev => ({ ...prev, [id]: val }))
  }

  const changesArray = Object.entries(changes)
    .filter(([_, val]) => val !== '' && Number(val) >= 0)
    .map(([assessmentId, hypotheticalMarks]) => ({ assessmentId, hypotheticalMarks: Number(hypotheticalMarks) }))

  const result = changesArray.length > 0 ? whatIf(subjectId, changesArray) : null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">What-If Calculator</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={16} /></button>
        </div>

        <div className="p-4 shrink-0">
          <p className="text-xs text-gray-500 mb-3">
            Simulate marks for upcoming or unmarked assessments to see how your internal total changes.
            <span className="block text-yellow-600 dark:text-yellow-400 mt-1 text-[10px]">This does not modify your actual marks.</span>
          </p>

          {unmarkedAssessments.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-xs">All assessments have been marked. Add new assessments to simulate.</div>
          )}

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {unmarkedAssessments.map(a => (
              <div key={a.id} className="flex items-center gap-2">
                <label className="flex items-center gap-2 flex-1 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 text-xs">
                  <input type="checkbox" checked={!!changes[a.id]} onChange={() => toggleAssessment(a.id)} className="rounded" />
                  <span className="font-medium text-gray-900 dark:text-white w-24 truncate">{a.name}</span>
                  <span className="text-gray-400">/ {a.maxMarks}</span>
                </label>
                {changes[a.id] !== undefined && (
                  <input type="number" placeholder="Marks" value={changes[a.id]} onChange={e => setValue(a.id, e.target.value)}
                    className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-yellow-500 outline-none text-center" />
                )}
              </div>
            ))}
          </div>
        </div>

        {result && (
          <div className="px-4 pb-4 space-y-3">
            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-500 mb-1">Current</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{result.current.earned}/{result.current.max}</p>
                <p className="text-xs text-gray-500">{result.current.percentage}%</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center border border-yellow-200 dark:border-yellow-700">
                <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mb-1">Projected</p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{result.projected.earned}/{result.projected.max}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">{result.projected.percentage}%</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                {result.improvement >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
                <span className={result.improvement >= 0 ? 'text-green-600' : 'text-red-500'}>
                  {result.improvement >= 0 ? '+' : ''}{result.improvement}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Target size={14} className="text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300">Grade: <strong>{result.grade}</strong> ({result.gradeDesc})</span>
              </div>
            </div>

            {result.projected.percentage >= 80 && (
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-xs text-green-700 dark:text-green-300 text-center">
                With these marks, you will be in the <strong>Excellent</strong> range!
              </div>
            )}
            {result.projected.percentage < 40 && result.projected.percentage > 0 && (
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-xs text-red-600 text-center">
                You are still at risk. Try increasing your target marks.
              </div>
            )}
          </div>
        )}

        {!result && changesArray.length === 0 && unmarkedAssessments.length > 0 && (
          <div className="px-4 pb-6 text-center text-xs text-gray-400">
            Select assessments and enter hypothetical marks to see the impact.
          </div>
        )}
      </div>
    </div>
  )
}
