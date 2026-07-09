export default function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 w-full rounded',
    card: 'h-32 rounded-xl',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24 rounded-xl',
    title: 'h-6 w-48 rounded'
  }

  return (
    <div
      className={`animate-pulse bg-[var(--border-color)] ${variants[variant]} ${className}`}
    />
  )
}
