import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-secondary">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-xl px-4 py-2.5 text-sm
            bg-[var(--input-bg)]
            border border-[var(--border-color)]
            text-[var(--text-primary)]
            placeholder:text-[var(--text-muted)]
            focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-[var(--danger)]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
