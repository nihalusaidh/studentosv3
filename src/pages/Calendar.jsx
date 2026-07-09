import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, CalendarDays, Clock, Download } from 'lucide-react'
import { getTodaySummary, getUpcomingDeadlines, getColorForType, getCustomEvents, getHolidays, getReminders } from '../utils/calendarStorage'
import { downloadCalendarCsv } from '../utils/exportUtils'
import SmartCalendar from '../components/calendar/SmartCalendar'
import DateDetailSheet from '../components/calendar/DateDetailSheet'
import EventForm from '../components/calendar/EventForm'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [todaySummary, setTodaySummary] = useState(null)
  const [upcoming, setUpcoming] = useState([])

  const refresh = () => {
    setRefreshKey(k => k + 1)
    setTodaySummary(getTodaySummary())
    setUpcoming(getUpcomingDeadlines(7))
  }

  useEffect(() => {
    setTodaySummary(getTodaySummary())
    setUpcoming(getUpcomingDeadlines(7))
  }, [refreshKey])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Calendar</h1>
          <p className="text-sm text-secondary">Manage your schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => downloadCalendarCsv({ events: getCustomEvents(), holidays: getHolidays(), reminders: getReminders() })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-secondary hover:text-primary text-xs font-medium hover:bg-white/[0.1] transition-all cursor-pointer border-0">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 cursor-pointer border-0">
            <Plus size={16} />
            Add Event
          </button>
        </div>
      </div>

      {todaySummary && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-primary">Today</h2>
              <span className="text-xs text-muted">{format(new Date(), 'EEEE, MMMM d')}</span>
            </div>
            {todaySummary.pending > 0 && (
              <Badge variant="warning">{todaySummary.pending} pending</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-xs text-secondary bg-[var(--bg-secondary)] px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
              {todaySummary.classes.length} classes
            </span>
            <span className="flex items-center gap-1 text-xs text-secondary bg-[var(--bg-secondary)] px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              {todaySummary.exams.length} exams
            </span>
            <span className="flex items-center gap-1 text-xs text-secondary bg-[var(--bg-secondary)] px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
              {todaySummary.reminders.length} reminders
            </span>
            <span className="flex items-center gap-1 text-xs text-secondary bg-[var(--bg-secondary)] px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#a855f7' }} />
              {todaySummary.holidays.length} holidays
            </span>
          </div>
        </GlassCard>
      )}

      <SmartCalendar
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        onSelectDate={setSelectedDate}
        filter={filter}
        setFilter={setFilter}
      />

      {upcoming.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Clock size={16} className="text-[var(--accent)]" />
            Upcoming (7 days)
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {upcoming.slice(0, 7).map(event => (
              <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)]">
                <span className="w-1.5 h-8 rounded-full shrink-0" style={{ background: event.color || getColorForType(event.type) }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{event.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>{format(new Date(event.date + 'T' + (event.startTime || '00:00')), 'MMM d')}</span>
                    {event.startTime && <><Clock size={10} /><span>{event.startTime}</span></>}
                  </div>
                </div>
                <span className="text-[10px] font-medium capitalize px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-secondary">
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {selectedDate && !showForm && (
        <DateDetailSheet
          selectedDate={selectedDate}
          onClose={() => setSelectedDate(null)}
          onRefresh={refresh}
        />
      )}

      {showForm && (
        <EventForm
          selectedDate={selectedDate || new Date()}
          onClose={() => setShowForm(false)}
          onRefresh={refresh}
        />
      )}
    </div>
  )
}
