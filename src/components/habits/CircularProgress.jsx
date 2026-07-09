import { motion } from 'framer-motion'

export default function CircularProgress({ percent = 0, size = 120, strokeWidth = 8, label = '', sublabel = '' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(Math.max(percent, 0), 100) / 100)
  const center = size / 2

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--bg-secondary)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="url(#ringGradient)"
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', type: 'spring', stiffness: 60, damping: 20 }}
          filter={percent >= 100 ? 'url(#glow)' : undefined}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <span className="text-2xl font-bold text-primary" style={{ fontSize: size * 0.22 }}>
          {Math.round(percent)}%
        </span>
        {label && <span className="text-[10px] text-muted mt-0.5">{label}</span>}
      </motion.div>
    </div>
  )
}
