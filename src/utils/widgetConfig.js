const KEY = 'student-os-widget-config'

const DEFAULT_WIDGETS = [
  { id: 'dailyBrief', label: 'Daily Brief', visible: true },
  { id: 'xpLevel', label: 'XP & Level', visible: true },
  { id: 'streak', label: 'Streak', visible: true },
  { id: 'dailyCheckin', label: 'Daily Check-in', visible: true },
  { id: 'todayFocus', label: 'Today Focus', visible: true },
  { id: 'attendance', label: 'Attendance', visible: true },
  { id: 'internals', label: 'Internals Summary', visible: true },
  { id: 'upcomingEvents', label: 'Upcoming Events', visible: true },
  { id: 'habit', label: 'Habits', visible: true },
  { id: 'quickActions', label: 'Quick Actions', visible: true },
  { id: 'todaySchedule', label: "Today's Schedule", visible: true },
  { id: 'upcomingTasks', label: 'Upcoming Tasks', visible: true },
  { id: 'examCountdown', label: 'Exam Countdown', visible: true },
  { id: 'studyBuddy', label: 'Study Buddy', visible: true },
  { id: 'gpa', label: 'GPA Overview', visible: true }
]

function get() {
  try {
    const r = localStorage.getItem(KEY)
    if (r) {
      const saved = JSON.parse(r)
      const merged = DEFAULT_WIDGETS.map(dw => {
        const found = saved.find(s => s.id === dw.id)
        return found || dw
      })
      saved.forEach(s => { if (!merged.find(m => m.id === s.id)) merged.push(s) })
      return merged
    }
    return JSON.parse(JSON.stringify(DEFAULT_WIDGETS))
  } catch { return JSON.parse(JSON.stringify(DEFAULT_WIDGETS)) }
}

function set(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

export function getWidgets() { return get() }

export function toggleWidget(id) {
  const widgets = get()
  const idx = widgets.findIndex(w => w.id === id)
  if (idx >= 0) { widgets[idx].visible = !widgets[idx].visible; set(widgets) }
  return widgets
}

export function reorderWidgets(fromIndex, toIndex) {
  const widgets = get()
  const [moved] = widgets.splice(fromIndex, 1)
  widgets.splice(toIndex, 0, moved)
  set(widgets)
  return widgets
}

export function resetWidgets() {
  localStorage.removeItem(KEY)
  return JSON.parse(JSON.stringify(DEFAULT_WIDGETS))
}

export function getVisibleWidgets() {
  return get().filter(w => w.visible)
}
