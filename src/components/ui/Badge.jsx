export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-glass text-secondary',
    success: 'bg-[var(--success)]/20 text-[var(--success)]',
    warning: 'bg-[var(--warning)]/20 text-[var(--warning)]',
    danger: 'bg-[var(--danger)]/20 text-[var(--danger)]',
    info: 'bg-[var(--info)]/20 text-[var(--info)]',
    accent: 'accent-bg/20 accent',
    premium: 'bg-amber-500/20 text-amber-400'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
