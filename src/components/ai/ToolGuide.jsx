import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

export default function ToolGuide({ steps = [], tips = [] }) {
  const [open, setOpen] = useState(false)

  if (steps.length === 0 && tips.length === 0) return null

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left cursor-pointer"
      >
        <BookOpen size={14} className="text-purple-400 shrink-0" />
        <span className="text-xs font-medium text-purple-300">How to use</span>
        <span className="text-[10px] text-muted ml-1">({steps.length} steps)</span>
        <div className="ml-auto">
          {open ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
        </div>
      </button>

      {open && (
        <div className="mt-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2.5">
          {steps.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted font-medium uppercase tracking-wider">Steps</p>
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-secondary leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
          )}
          {tips.length > 0 && (
            <div className="space-y-1.5 pt-1.5 border-t border-white/[0.06]">
              <p className="text-[10px] text-muted font-medium uppercase tracking-wider">Tips</p>
              {tips.map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 text-xs shrink-0">✦</span>
                  <span className="text-xs text-secondary">{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
