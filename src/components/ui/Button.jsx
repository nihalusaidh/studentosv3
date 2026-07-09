import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  icon: Icon
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-95 cursor-pointer border-0'

  const variants = {
    primary: 'gradient-bg text-white hover:opacity-90 shadow-theme',
    secondary: 'bg-glass border border-glass-border text-primary hover:bg-hover',
    ghost: 'bg-transparent text-secondary hover:bg-hover',
    danger: 'bg-[var(--danger)] text-white hover:opacity-90',
    outline: 'bg-transparent border-2 border-accent text-accent hover:accent-bg hover:text-white'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : Icon ? <Icon size={18} /> : null}
      {children}
    </button>
  )
}
