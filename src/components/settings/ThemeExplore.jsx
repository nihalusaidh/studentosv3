import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import { themes, themeList } from '../../themes/themeConfig'
import { Check, X, Sparkles, Eye, Palette, LayoutGrid, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'

function ThemePreviewMockup({ theme }) {
  const style = theme.vars
  const layout = theme.vars['--analysis-layout'] || 'chart-cat-gauge'
  return (
    <div className="rounded-lg overflow-hidden border" style={{ borderColor: style['--border-color'], background: style['--bg-primary'] }}>
      <div className="p-2 flex items-center gap-1.5 border-b" style={{ borderColor: style['--border-color'], background: style['--bg-secondary'] }}>
        <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#eab308' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
        <span className="text-[8px] ml-1" style={{ color: style['--text-muted'] }}>Habits Dashboard</span>
      </div>
      <div className="p-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ color: '#fff', background: style['--gradient'] || style['--accent'] }}>
            {Math.floor(Math.random() * 80 + 20)}%
          </div>
          <div className="flex-1">
            <div className="h-1.5 rounded-full" style={{ background: style['--bg-secondary'], width: '60%' }} />
            <div className="h-1 rounded-full mt-1" style={{ background: style['--bg-secondary'], width: '40%' }} />
          </div>
          <div className="w-4 h-4 rounded" style={{ background: style['--accent'] + '30' }} />
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-3 rounded" style={{ background: style['--bg-secondary'] }}>
              <div className="h-full rounded" style={{ background: style['--accent'] + '40', width: `${20 + i * 15}%` }} />
            </div>
          ))}
        </div>
        <div className="h-6 rounded" style={{ background: style['--bg-secondary'] }}>
          <div style={{ background: `linear-gradient(90deg, ${style['--accent']}40, ${style['--accent']}10)`, width: '70%', height: '100%', borderRadius: 'inherit' }} />
        </div>
        <div className="flex gap-1">
          <div className="flex-1 h-4 rounded" style={{ background: style['--bg-secondary'] }} />
          <div className="flex-1 h-4 rounded" style={{ background: style['--bg-secondary'] }} />
        </div>
      </div>
    </div>
  )
}

function getStyleTags(theme) {
  const tags = []
  const s = theme.vars['--chart-style']; const g = theme.vars['--gauge-style']
  const l = theme.vars['--analysis-layout'] || 'chart-cat-gauge'
  if (s === 'line') tags.push('Line Chart')
  else if (s === 'neon') tags.push('Neon Chart')
  else if (s === 'wave') tags.push('Wave Chart')
  else if (s === 'dots') tags.push('Dot Chart')
  else if (s === 'ascii') tags.push('ASCII Chart')
  else if (s === 'curved') tags.push('Curve Chart')
  if (g === 'semicircle') tags.push('Semi Gauge')
  else if (g === 'fullcircle') tags.push('Ring Gauge')
  else if (g === 'needle') tags.push('Needle Gauge')
  else if (g === 'text') tags.push('Text Stats')
  else if (g === 'donut') tags.push('Donut Gauge')
  if (l === 'chart-cat-gauge') tags.push('Grid Layout')
  else if (l === 'gauge-chart-cat') tags.push('Stack Layout')
  else if (l === 'chart-gauge-cat') tags.push('Hero Layout')
  else if (l === 'inline') tags.push('Inline Layout')
  else if (l === 'cat-gauge-chart') tags.push('Table Layout')
  else if (l === 'cat-chart-gauge') tags.push('Split Layout')
  return tags
}

export default function ThemeExplore({ currentThemeId, onThemeChange }) {
  const [showGallery, setShowGallery] = useState(false)
  const [previewTheme, setPreviewTheme] = useState(null)
  const currentTheme = themes[currentThemeId]

  return (
    <>
      <GlassCard className="p-4 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <Palette size={20} className="text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-primary">Theme</h2>
        </div>

        {/* Current theme hero card */}
        <div className="relative overflow-hidden rounded-xl border-2 mb-3 p-4 transition-all" style={{ borderColor: currentTheme?.vars?.['--accent'], background: currentTheme?.vars?.['--bg-primary'] }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: currentTheme?.vars?.['--accent'] }} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg" style={{ background: currentTheme?.vars?.['--gradient'] || currentTheme?.vars?.['--accent'] }}>
              <Palette size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: currentTheme?.vars?.['--text-primary'] }}>{currentTheme?.name}</span>
                <Check size={14} className="text-[var(--success)]" />
              </div>
              <p className="text-xs" style={{ color: currentTheme?.vars?.['--text-secondary'] }}>{currentTheme?.description}</p>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {getStyleTags(currentTheme).slice(0, 3).map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: currentTheme?.vars?.['--accent'] + '20', color: currentTheme?.vars?.['--accent'] }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Button onClick={() => setShowGallery(true)} icon={Sparkles} fullWidth className="group relative overflow-hidden">
          <span className="relative z-10">Explore Themes</span>
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </Button>
      </GlassCard>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowGallery(false)} />
            <motion.div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-primary">Theme Gallery</h2>
                  <p className="text-xs text-muted">Choose a design that fits your style</p>
                </div>
                <button onClick={() => setShowGallery(false)} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-muted transition-all cursor-pointer border-0 bg-transparent">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themeList.map((theme, i) => {
                  const isActive = currentThemeId === theme.id
                  const tags = getStyleTags(theme)
                  return (
                    <motion.div key={theme.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${isActive ? 'border-[var(--accent)]' : 'border-transparent hover:border-[var(--border-color)]'}`}
                    >
                      <div style={{ background: theme.vars['--bg-primary'] }} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold" style={{ color: theme.vars['--text-primary'] }}>{theme.name}</span>
                          {isActive && <Check size={14} className="text-[var(--success)]" />}
                        </div>
                        <ThemePreviewMockup theme={theme} />
                        <p className="text-[10px] mt-1.5" style={{ color: theme.vars['--text-secondary'] }}>{theme.description}</p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[8px] px-1 py-0.5 rounded" style={{ background: theme.vars['--accent'] + '20', color: theme.vars['--accent'] }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => { onThemeChange(theme.id); setShowGallery(false) }}
                          className="w-full mt-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-0"
                          style={{ background: theme.vars['--gradient'] || theme.vars['--accent'], color: '#fff' }}
                        >{isActive ? 'Current Theme' : 'Try Theme'}</button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
