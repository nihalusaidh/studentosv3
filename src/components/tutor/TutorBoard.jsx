import { useRef, useEffect, useCallback } from 'react'
import { DrawEngine } from '../../utils/drawEngine'

export default function TutorBoard({ actions, onMarkerMove, sectionIndex, isAnimating }) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const engine = new DrawEngine(canvas, {
      onMarkerMove: (pos) => onMarkerMove?.(pos)
    })
    engineRef.current = engine
    engine.clear()

    const resize = () => engine.resize()
    window.addEventListener('resize', resize)
    return () => {
      engine.stop()
      window.removeEventListener('resize', resize)
    }
  }, [])

  const draw = useCallback((boardActions) => {
    const engine = engineRef.current
    if (!engine) return
    engine.stop()
    engine.clearSection()
    if (boardActions?.length) {
      engine.animateDraw(boardActions)
    }
  }, [])

  useEffect(() => {
    if (actions?.length && !isAnimating) {
      const engine = engineRef.current
      if (engine) {
        engine.clearSection()
        engine.drawBoardActions(actions)
      }
    }
  }, [actions, sectionIndex])

  useEffect(() => {
    if (isAnimating && actions?.length) {
      draw(actions)
    }
  }, [isAnimating, actions, sectionIndex])

  return (
    <div className="relative w-full aspect-[16/10] bg-[#1a1a2e] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
        <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
        <span className="text-white/30 text-xs ml-2 font-mono">AI Board Tutor</span>
      </div>
      <div className="absolute bottom-3 right-4 pointer-events-none">
        <span className="text-white/15 text-[10px] font-mono">Section {sectionIndex + 1}</span>
      </div>
    </div>
  )
}
