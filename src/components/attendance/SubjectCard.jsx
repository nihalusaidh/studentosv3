import React from 'react'
import { Clock, Users, CalendarDays, Trash2, Edit3, Percent, CheckCircle2, XCircle, Beaker, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

function groupSchedule(schedule) {
  if (!schedule || !schedule.length) return []
  const groups = {}
  schedule.forEach(slot => {
    const day = slot.day
    if (!groups[day]) groups[day] = []
    groups[day].push(slot)
  })
  return Object.entries(groups).map(([day, slots]) => ({ day, slots }))
}

export default function SubjectCard({
  subject,
  stats,
  recovery,
  skip,
  onEdit,
  onDelete,
  onComplete,
  onViewDetail
}) {
  const [expanded, setExpanded] = React.useState(false)
  const pct = stats?.percentage || 0
  const color = subject.color || '#a855f7'
  const scheduleGroups = groupSchedule(subject.schedule)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4" style={{ borderLeft: `4px solid ${color}` }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">{subject.name}</h3>
              {subject.semester && subject.semester !== 'Unknown' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700">
                  <Beaker size={12} />
                  {subject.semester}
                </span>
              )}
              {subject.semesterCompleted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700">
                  <CheckCircle2 size={12} />
                  Done
                </span>
              )}
            </div>
            {subject.faculty && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <Users size={12} /> {subject.faculty}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!subject.semesterCompleted && (
              <>
                <button onClick={() => onEdit(subject.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-purple-500 transition-colors" title="Edit">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => onComplete(subject.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-green-500 transition-colors" title="Complete Semester">
                  <CheckCircle2 size={15} />
                </button>
              </>
            )}
            <button onClick={() => onDelete(subject.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-200 dark:text-gray-700" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="2" strokeDasharray={`${pct} 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">{pct}%</span>
          </div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs flex-1">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle2 size={12} /> <span>P: {stats?.presentCount || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <XCircle size={12} /> <span>A: {stats?.absentCount || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-500">
              <CalendarDays size={12} /> <span>C: {stats?.conductedCount || 0}</span>
            </div>
          </div>
        </div>

        <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-1">
          <span>Schedule & Details</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {expanded && (
          <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Semester:</span> {subject.semester || 'Unknown'}</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Required:</span> {subject.requiredPct || 75}%</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Batch:</span> {subject.batch || '-'}</p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Dates:</span> {subject.startDate} → {subject.endDate}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Weekly Schedule:</p>
              <div className="space-y-1">
                {scheduleGroups.map(g => (
                  <div key={g.day} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{g.day}</p>
                    <div className="space-y-0.5">
                      {g.slots.map(slot => (
                        <p key={slot.slotId} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 pl-2">
                          <Clock size={10} /> {slot.startTime} - {slot.endTime}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!subject.semesterCompleted && (
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => onViewDetail(subject.id)} className="flex-1 text-xs py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors text-center">
                  View All Classes
                </button>
              </div>
            )}

            {recovery?.needed > 0 && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
                <AlertTriangle size={14} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-700 dark:text-orange-300">{recovery.message}</p>
              </div>
            )}
            {skip?.canSkip > 0 && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                <Percent size={14} className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 dark:text-green-300">{skip.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
