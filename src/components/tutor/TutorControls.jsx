import { Play, Pause, SkipForward, SkipBack, MessageCircle } from 'lucide-react'

export default function TutorControls({
  playing, onTogglePlay, onNext, onPrev,
  hasNext, hasPrev, totalSections, currentSection,
  onAskDoubt, sectionTitles
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-2">
      <div className="flex items-center gap-1">
        <button onClick={onPrev} disabled={!hasPrev}
          className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-0 bg-transparent">
          <SkipBack size={16} />
        </button>
        <button onClick={onTogglePlay}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-0"
          title={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={onNext} disabled={!hasNext}
          className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-0 bg-transparent">
          <SkipForward size={16} />
        </button>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-xs text-white/60 font-mono max-w-[200px] overflow-hidden">
        <span className="truncate">{sectionTitles?.[currentSection] || `Section ${currentSection + 1}`}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono">
          <span className="text-white/80 font-semibold">{currentSection + 1}</span>
          <span>/</span>
          <span>{totalSections}</span>
        </div>
        <button onClick={onAskDoubt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-all border border-amber-500/20 cursor-pointer"
          title="Ask a doubt">
          <MessageCircle size={14} />
          Doubt
        </button>
      </div>
    </div>
  )
}
