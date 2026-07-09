import { useEffect, useState } from 'react'
import GlassCard from '../ui/GlassCard'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { getTodaySlots } from '../../utils/timetableStorage'

export default function TodaySchedule() {
  const [slots, setSlots] = useState([])

  useEffect(() => {
    function refresh() { setSlots(getTodaySlots()) }
    refresh()
    const interval = setInterval(refresh, 2000)
    return () => clearInterval(interval)
  }, [])

  if (slots.length === 0) return null

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Calendar size={16} className="text-[var(--accent)]" />
          Today's Schedule
        </h3>
      </div>
      <div className="space-y-2">
        {slots.slice(0, 4).map(slot => (
          <div key={slot.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)]">
            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: slot.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{slot.subjectName}</p>
              <div className="flex items-center gap-2 text-xs text-muted">
                <Clock size={10} /><span>{slot.startTime} - {slot.endTime}</span>
                {slot.room && <><MapPin size={10} /><span>{slot.room}</span></>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
