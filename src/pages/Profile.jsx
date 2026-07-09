import React, { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, CalendarDays, Trash2, Beaker, Clock, Percent, Download, BarChart3, AlertTriangle, ShieldCheck } from 'lucide-react'
import { getSemesterHistory, deleteSemesterHistory, getInsights } from '../utils/attendanceStorage'
import { getSubjects as getMarksSubjects, calculateInternalMarks, getSemesterOverview, getGradeScale } from '../utils/marksStorage'

export default function Profile() {
  const [history, setHistory] = useState([])
  const [insights, setInsights] = useState([])
  const [marksSubjects, setMarksSubjects] = useState([])
  const [marksOverview, setMarksOverview] = useState(null)
  const [activeTab, setActiveTab] = useState('history')

  useEffect(() => {
    setHistory(getSemesterHistory())
    setInsights(getInsights())
    setMarksSubjects(getMarksSubjects())
    setMarksOverview(getSemesterOverview())
  }, [])

  const refreshHistory = () => {
    setHistory(getSemesterHistory())
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this semester record permanently?')) {
      deleteSemesterHistory(id)
      refreshHistory()
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Delete ALL semester history records? This cannot be undone.')) {
      localStorage.removeItem('student-os-semester-history')
      refreshHistory()
    }
  }

  const exportHistory = () => {
    if (history.length === 0) return
    const csv = [
      ['Subject', 'Semester', 'Faculty', 'Present', 'Absent', 'Conducted', 'Percentage', 'Completed At'].join(','),
      ...history.map(h =>
        [
          `"${h.subjectName}"`,
          `"${h.semester}"`,
          `"${h.faculty}"`,
          h.stats.presentCount,
          h.stats.absentCount,
          h.stats.conductedCount,
          h.stats.percentage + '%',
          `"${new Date(h.completedAt).toLocaleDateString()}"`
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'semester-history.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const overallPercentage = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.stats.percentage, 0) / history.length)
    : 0

  const totalPresent = history.reduce((s, h) => s + h.stats.presentCount, 0)
  const totalAbsent = history.reduce((s, h) => s + h.stats.absentCount, 0)
  const totalConducted = history.reduce((s, h) => s + h.stats.conductedCount, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your academic history and stats</p>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            Semester History
          </button>
          <button onClick={() => setActiveTab('insights')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'insights' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            Insights
          </button>
          <button onClick={() => setActiveTab('marks')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'marks' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            Marks
          </button>
        </div>

        {activeTab === 'history' && (
          <>
            {history.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{history.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Semesters</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalPresent}/{totalConducted}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Present/Conducted</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{overallPercentage}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg Attendance</p>
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{history.length} completed semester(s)</p>
                <div className="flex gap-2">
                  <button onClick={exportHistory} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Download size={14} /> Export CSV
                  </button>
                  <button onClick={handleClearAll} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                    <Trash2 size={14} /> Clear All
                  </button>
                </div>
              </div>
            )}

            {history.length === 0 ? (
              <div className="text-center py-20">
                <Beaker size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">No semester history</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">Complete a semester from Attendance page to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...history].reverse().map(h => (
                  <div key={h.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{h.subjectName}</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700">
                              <Beaker size={12} />
                              {h.semester}
                            </span>
                          </div>
                          {h.faculty && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{h.faculty}</p>}
                        </div>
                        <button onClick={() => handleDelete(h.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 mb-2">
                        <div className="relative w-14 h-14">
                          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-200 dark:text-gray-700" />
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke={h.color || '#a855f7'} strokeWidth="2" strokeDasharray={`${h.stats.percentage} 100`} strokeLinecap="round" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">{h.stats.percentage}%</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs flex-1">
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle2 size={12} /> P: {h.stats.presentCount}
                          </div>
                          <div className="flex items-center gap-1 text-red-500">
                            <XCircle size={12} /> A: {h.stats.absentCount}
                          </div>
                          <div className="flex items-center gap-1 text-blue-500">
                            <CalendarDays size={12} /> C: {h.stats.conductedCount}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>Completed {new Date(h.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-20">
                <Percent size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">No insights yet</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add subjects and track attendance to get insights</p>
              </div>
            ) : (
              insights.map((insight, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                    <Percent size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                </div>
              ))
            )}
            <button onClick={() => setInsights(getInsights())} className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              Refresh Insights
            </button>
          </div>
        )}

        {activeTab === 'marks' && (
          <div className="space-y-4">
            {marksSubjects.length === 0 ? (
              <div className="text-center py-20">
                <BarChart3 size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">No marks data</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add internal marks subjects from the Internals page</p>
              </div>
            ) : (
              <>
                {marksOverview && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{marksOverview.avgPct}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{marksOverview.expectedGrade}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expected Grade</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{marksOverview.subjectCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Subjects</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                      <p className={`text-2xl font-bold ${marksOverview.atRisk > 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{marksOverview.atRisk}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">At Risk</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {marksSubjects.map(sub => {
                    const result = calculateInternalMarks(sub.id)
                    const pct = result ? result.percentage : 0
                    return (
                      <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: sub.color || '#a855f7' }} />
                            <h3 className="font-semibold text-gray-900 dark:text-white">{sub.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${pct >= 60 ? 'text-green-600 dark:text-green-400' : pct >= 40 ? 'text-orange-500' : 'text-red-500'}`}>{pct}%</span>
                            {pct < 50 && <AlertTriangle size={14} className="text-red-500" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>Int: {result ? result.earned + '/' + result.max : '-'}</span>
                          <span>Ext: {sub.externalMax}</span>
                          <span>{sub.assessments.filter(a => a.status === 'completed').length}/{sub.assessments.length} done</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
