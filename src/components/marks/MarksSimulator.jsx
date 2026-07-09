import React, { useState, useMemo } from 'react'
import { X, Zap, Target, BookOpen, GraduationCap, RefreshCw } from 'lucide-react'
import { getSubjects, calculateInternalMarks, simulateFullMarks } from '../../utils/marksStorage'

export default function MarksSimulator({ onClose }) {
  const subjects = useMemo(() => getSubjects(), [])
  const [selectedId, setSelectedId] = useState(subjects[0]?.id || '')
  const [overrides, setOverrides] = useState({})
  const [externalMarks, setExternalMarks] = useState('')
  const [gradingType, setGradingType] = useState('absolute')

  const subject = useMemo(() => subjects.find(s => s.id === selectedId), [subjects, selectedId])
  const currentInternal = useMemo(() => selectedId ? calculateInternalMarks(selectedId) : null, [selectedId])

  const internalSimMode = subject?.weightageMode === 'direct' ? 'marks' : 'percentage'

  const toggleOverride = (id) => {
    setOverrides(prev => {
      if (prev[id] !== undefined) { const { [id]: _, ...rest } = prev; return rest }
      return { ...prev, [id]: '' }
    })
  }

  const setOverrideValue = (id, val) => setOverrides(prev => ({ ...prev, [id]: val }))

  const overrideEntries = Object.entries(overrides)
    .filter(([_, val]) => val !== '' && Number(val) >= 0)
    .map(([assessmentId, hypotheticalMarks]) => ({ assessmentId, hypotheticalMarks: Number(hypotheticalMarks) }))

  const ext = externalMarks !== '' ? Number(externalMarks) : null

  const resultAbsolute = useMemo(() => {
    if (!selectedId) return null
    return simulateFullMarks(selectedId, overrideEntries, ext, 'absolute')
  }, [selectedId, overrideEntries, ext])

  const resultRelative = useMemo(() => {
    if (!selectedId) return null
    return simulateFullMarks(selectedId, overrideEntries, ext, 'relative')
  }, [selectedId, overrideEntries, ext])

  const hasChanges = overrideEntries.length > 0 || ext !== null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Marks Simulator</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={20} /></button>
        </div>

        <div className="p-5 shrink-0 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Select Subject</label>
            <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setOverrides({}); setExternalMarks('') }} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none">
              {subjects.length === 0 && <option value="">No subjects</option>}
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.semester || 'No semester'})</option>)}
            </select>
          </div>

          {subject && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <BookOpen size={12} /> {subject.name} &middot; Internal {subject.internalMax} + External {subject.externalMax}
            </div>
          )}
        </div>

        {subject && (
          <div className="px-5 pb-3 flex-1 overflow-y-auto space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Internal Assessments</h3>
                <span className="text-xs text-gray-400">Current: {currentInternal?.earned}/{currentInternal?.max} ({currentInternal?.percentage}%)</span>
              </div>
              <div className="space-y-1">
                {subject.assessments.map(a => (
                  <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs">
                    <input type="checkbox" checked={overrides[a.id] !== undefined} onChange={() => toggleOverride(a.id)} className="rounded shrink-0" />
                    <span className="font-medium text-gray-900 dark:text-white w-24 truncate shrink-0">{a.name}</span>
                    <span className="text-gray-400 w-16 shrink-0">{a.type}</span>
                    <span className="text-gray-500 w-12 shrink-0">/{a.maxMarks}</span>
                    <span className="text-gray-400 w-14 shrink-0">W:{a.weightage}{internalSimMode === 'percentage' ? '%' : ''}</span>
                    {a.marks?.obtained !== null && a.marks?.obtained !== undefined && !overrides[a.id] && (
                      <span className={`font-medium ${(a.marks.obtained / a.maxMarks) >= 0.5 ? 'text-green-600' : 'text-red-500'} w-14 shrink-0`}>{a.marks.obtained}</span>
                    )}
                    {overrides[a.id] !== undefined && (
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-gray-400 text-[10px]">{a.marks?.obtained !== null && a.marks?.obtained !== undefined ? `${a.marks.obtained} →` : '→'}</span>
                        <input type="number" value={overrides[a.id]} onChange={e => setOverrideValue(a.id, e.target.value)} placeholder="marks" className="w-16 px-1.5 py-1 rounded border border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-gray-900 dark:text-white text-xs text-center focus:ring-2 focus:ring-yellow-500 outline-none" />
                      </div>
                    )}
                    {overrides[a.id] === undefined && a.status === 'upcoming' && (
                      <span className="text-yellow-500 text-[10px] ml-auto">Upcoming</span>
                    )}
                  </div>
                ))}
                {subject.assessments.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No assessments for this subject.</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">External Exam</h3>
                <span className="text-xs text-gray-400">Max: {subject.externalMax} | Pass: {subject.passingExternal}</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <GraduationCap size={16} className="text-blue-500 shrink-0" />
                <span className="text-xs text-gray-500 shrink-0">Expected Marks:</span>
                <input type="number" value={externalMarks} onChange={e => setExternalMarks(e.target.value)} placeholder="0" className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-center focus:ring-2 focus:ring-yellow-500 outline-none" />
                <span className="text-xs text-gray-400">/ {subject.externalMax}</span>
                {ext !== null && (
                  <span className={`text-xs font-medium ${ext >= subject.passingExternal ? 'text-green-600' : 'text-red-500'}`}>
                    {ext >= subject.passingExternal ? 'Passing' : 'Failing'}
                  </span>
                )}
              </div>

              {ext !== null && (
                <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Choose grading type to see grade:</p>
                  <div className="flex gap-2">
                    <button onClick={() => setGradingType('absolute')}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border-2 ${gradingType === 'absolute' ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 hover:border-green-300'}`}>
                      <span className="block font-semibold text-sm">Absolute</span>
                      <span className="text-[10px] opacity-75">Fixed cutoffs → exact grade</span>
                    </button>
                    <button onClick={() => setGradingType('relative')}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border-2 ${gradingType === 'relative' ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 hover:border-blue-300'}`}>
                      <span className="block font-semibold text-sm">Relative</span>
                      <span className="text-[10px] opacity-75">Depends on class → approximate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => { setOverrides({}); setExternalMarks('') }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <RefreshCw size={12} /> Reset simulation
            </button>

            {hasChanges && resultAbsolute && resultAbsolute.internalProjected && (
              <>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1">
                      <Target size={16} className="text-yellow-500" />
                      Marks Projection
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
                        <p className="text-[10px] text-gray-500 mb-0.5">Current Internal</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{currentInternal?.earned}/{currentInternal?.max}</p>
                        <p className="text-xs text-gray-500">{currentInternal?.percentage}%</p>
                      </div>
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-3 text-center shadow-sm border border-yellow-300 dark:border-yellow-700">
                        <p className="text-[10px] text-yellow-700 dark:text-yellow-300 mb-0.5">Projected Internal</p>
                        <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200">{resultAbsolute.internalProjected.earned}/{resultAbsolute.internalProjected.max}</p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">{resultAbsolute.internalProjected.percentage}%</p>
                      </div>
                    </div>

                    {ext !== null && resultAbsolute.gradeResult?.externalPct > 0 && (
                      <div className="flex items-center justify-center gap-4 mb-3 text-xs flex-wrap">
                        <span className="text-gray-500">Internal: <strong>{resultAbsolute.gradeResult.internalPct}%</strong></span>
                        <span className="text-gray-300 dark:text-gray-600">+</span>
                        <span className="text-gray-500">External: <strong>{resultAbsolute.gradeResult.externalPct}%</strong></span>
                        <span className="text-gray-300 dark:text-gray-600">=</span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">{resultAbsolute.gradeResult.totalPct}%</span>
                        <span className="text-gray-400">overall</span>
                      </div>
                    )}
                  </div>
                </div>

                {ext !== null && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={`rounded-xl p-4 text-center border-2 transition-all ${gradingType === 'absolute' ? 'border-green-400 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-300' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-70'}`}>
                      <p className="text-[10px] font-medium text-green-700 dark:text-green-300 mb-0.5">Absolute</p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-200">Grade {resultAbsolute.gradeResult.grade}</p>
                      <p className="text-xs text-green-700 dark:text-green-300">{resultAbsolute.gradeResult.gradeDesc}</p>
                      {gradingType !== 'absolute' && (
                        <button onClick={() => setGradingType('absolute')} className="mt-1 text-[10px] text-green-600 underline">Select this</button>
                      )}
                      {gradingType === 'absolute' && <p className="text-[10px] text-green-500 mt-1">Confirmed grade</p>}
                    </div>

                    <div className={`rounded-xl p-4 text-center border-2 transition-all ${gradingType === 'relative' ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-70'}`}>
                      <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300 mb-0.5">Relative</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                        ~{resultRelative?.gradeResult?.approxRange || resultRelative?.gradeResult?.grade || '-'}
                      </p>
                      {resultRelative?.gradeResult?.approxRange && (
                        <p className="text-[10px] text-blue-600 dark:text-blue-400">Estimated range</p>
                      )}
                      {gradingType !== 'relative' && (
                        <button onClick={() => setGradingType('relative')} className="mt-1 text-[10px] text-blue-600 underline">Select this</button>
                      )}
                      {gradingType === 'relative' && (
                        <p className="text-[10px] text-blue-500 mt-1">Depends on class performance</p>
                      )}
                    </div>
                  </div>
                )}

                {ext !== null && gradingType === 'absolute' && (
                  <p className="text-xs text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300">
                    <strong>Absolute grading</strong> — your grade is confirmed based on the percentage threshold.
                  </p>
                )}
                {ext !== null && gradingType === 'relative' && (
                  <p className="text-xs text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300">
                    <strong>Relative grading</strong> — shown as approximate range. Final grade depends on class average and distribution.
                  </p>
                )}

                {ext === null && (
                  <p className="text-xs text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-300">
                    Enter expected external marks to see grade prediction with absolute or relative grading.
                  </p>
                )}

                {resultAbsolute.internalProjected.percentage >= 80 && (
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/10 text-xs text-green-700 dark:text-green-300 text-center">Excellent performance projected!</div>
                )}
                {resultAbsolute.gradeResult?.totalPct < 40 && resultAbsolute.gradeResult?.totalPct > 0 && (
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/10 text-xs text-red-600 text-center">At risk of failing. Consider increasing your target marks.</div>
                )}
              </>
            )}

            {!hasChanges && (
              <div className="text-center py-6 text-xs text-gray-400">
                Toggle assessments to simulate, enter hypothetical marks, then add external marks to see grade under absolute or relative grading.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
