export default function ProgressBar({ value = 0, max = 100, size = 'md', showLabel = false, className = '' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full rounded-full bg-[var(--bg-secondary)] ${sizes[size]} overflow-hidden`}>
        <div
          className={`${sizes[size]} rounded-full gradient-bg transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted mt-1">{Math.round(percentage)}%</p>
      )}
    </div>
  )
}
