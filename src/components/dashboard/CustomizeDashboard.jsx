import { useState, useEffect } from 'react'
import { GripVertical, Eye, EyeOff, RotateCcw, X } from 'lucide-react'
import { getWidgets, toggleWidget, reorderWidgets, resetWidgets } from '../../utils/widgetConfig'
import Modal from '../ui/Modal'

export default function CustomizeDashboard({ isOpen, onClose, onSave }) {
  const [widgets, setWidgets] = useState([])

  useEffect(() => {
    if (isOpen) setWidgets(getWidgets())
  }, [isOpen])

  const handleToggle = (id) => {
    const updated = toggleWidget(id)
    setWidgets([...updated])
  }

  const moveUp = (index) => {
    if (index === 0) return
    const updated = reorderWidgets(index, index - 1)
    setWidgets([...updated])
  }

  const moveDown = (index) => {
    if (index === widgets.length - 1) return
    const updated = reorderWidgets(index, index + 1)
    setWidgets([...updated])
  }

  const handleReset = () => {
    const updated = resetWidgets()
    setWidgets([...updated])
    onSave()
  }

  const handleDone = () => {
    onSave()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Dashboard" size="md">
      <div className="space-y-3">
        <p className="text-xs text-muted">Show, hide, and reorder dashboard widgets</p>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {widgets.map((w, i) => (
            <div key={w.id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-secondary)]">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(i)} className="p-1 rounded hover:bg-hover text-muted hover:text-primary cursor-pointer border-0 bg-transparent leading-none text-[10px]">▲</button>
                <button onClick={() => moveDown(i)} className="p-1 rounded hover:bg-hover text-muted hover:text-primary cursor-pointer border-0 bg-transparent leading-none text-[10px]">▼</button>
              </div>
              <span className="text-xs text-muted flex-1">{w.label}</span>
              <button onClick={() => handleToggle(w.id)}
                className={`p-1.5 rounded transition-colors cursor-pointer border-0 ${w.visible ? 'text-green-500 hover:bg-green-500/20' : 'text-muted hover:bg-hover'}`}>
                {w.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted hover:bg-hover transition-colors cursor-pointer border-0 bg-transparent">
            <RotateCcw size={12} /> Reset
          </button>
          <button onClick={handleDone} className="px-4 py-2 rounded-lg text-sm font-medium gradient-bg text-white hover:opacity-90 transition-all cursor-pointer border-0">
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}
