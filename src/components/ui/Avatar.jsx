export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl'
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover border-2 border-[var(--glass-border)] ${sizes[size]} ${className}`}
      />
    )
  }

  return (
    <div className={`rounded-full flex items-center justify-center font-semibold gradient-bg text-white ${sizes[size]} ${className}`}>
      {initials}
    </div>
  )
}
