import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={size} />
    </div>
  )
}
