import { useTheme } from '../../contexts/ThemeContext'

export default function GlassCard({ children, className = '', onClick, hover = true }) {
  const { currentTheme } = useTheme()
  const isLight = currentTheme?.id === 'academic' || currentTheme?.id === 'minimal'

  return (
    <div
      onClick={onClick}
      className={`
        ${isLight ? 'card' : 'glass-card'}
        ${hover ? 'transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
