import { useState, useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'

export default function AnimatedCounter({ value = 0, suffix = '', prefix = '', duration = 1.5, decimals = 0, className = '' }) {
  const [display, setDisplay] = useState(prefix + '0' + suffix)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = value * eased
      const formatted = current.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      setDisplay(prefix + formatted + suffix)
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [isInView, value, duration, prefix, suffix, decimals])

  return <span ref={ref} className={className}>{display}</span>
}
