import { useMemo } from 'react'
import { getInsights } from '../../utils/attendanceStorage'
import GlassCard from '../ui/GlassCard'
import { Lightbulb } from 'lucide-react'

export default function InsightsPanel() {
  const insights = useMemo(() => getInsights(), [])

  if (insights.length === 0) return null

  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-[var(--warning)]" />
        Smart Insights
      </h3>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--bg-secondary)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
            <p className="text-xs text-secondary">{insight}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
