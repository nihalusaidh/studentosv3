const common = {
  premium: false,
  '--success': '#22c55e',
  '--warning': '#eab308',
  '--danger': '#ef4444',
  '--info': '#3b82f6',
  '--hover-bg': 'rgba(255,255,255,0.1)',
  '--navbar-bg': 'rgba(15,15,30,0.9)'
}

const designVars = (overrides) => ({
  '--card-radius': '12px',
  '--card-radius-sm': '8px',
  '--card-padding': '16px',
  '--card-border-width': '1px',
  '--card-shadow': '0 8px 32px rgba(0,0,0,0.15)',
  '--card-shadow-hover': '0 12px 40px rgba(0,0,0,0.2)',
  '--animation-speed': '0.3s',
  '--animation-enabled': '1',
  '--font-family': "'Inter',-apple-system,sans-serif",
  '--heading-font': "'Inter',-apple-system,sans-serif",
  '--badge-radius': '9999px',
  '--spacing-unit': '16px',
  '--chart-style': 'line',
  '--chart-grid': 'rgba(255,255,255,0.08)',
  '--chart-accent': 'var(--accent)',
  '--analysis-layout': 'chart-cat-gauge',
  '--gauge-style': 'semicircle',
  '--stat-layout': 'grid',
  '--category-style': 'hbar',
  '--hero-layout': 'split',
  '--dashboard-layout': 'standard',
  ...overrides
})

function makeTheme(id, name, desc, customVars) {
  return { id, name, premium: false, description: desc, vars: { ...common, ...designVars(customVars), ...customVars } }
}

export const themes = {
  // ── Glass ──
  glass: makeTheme('glass', 'Glass Morphism', 'Frosted glass with purple and pink gradients', {
    '--bg-primary': '#0f0f1e', '--bg-secondary': '#1a1a2e',
    '--bg-card': 'rgba(255,255,255,0.06)', '--bg-glass': 'rgba(255,255,255,0.10)',
    '--glass-border': 'rgba(255,255,255,0.12)', '--glass-blur': '16px',
    '--accent': '#a855f7', '--accent-hover': '#9333ea', '--accent-2': '#ec4899', '--accent-3': '#6366f1',
    '--text-primary': '#fff', '--text-secondary': 'rgba(255,255,255,0.7)', '--text-muted': 'rgba(255,255,255,0.4)',
    '--gradient': 'linear-gradient(135deg,#a855f7,#ec4899)',
    '--gradient-2': 'linear-gradient(135deg,#6366f1,#a855f7)',
    '--shadow': '0 8px 32px rgba(168,85,247,0.15)',
    '--shadow-lg': '0 16px 48px rgba(168,85,247,0.25)',
    '--border-color': 'rgba(255,255,255,0.08)',
    '--sidebar-bg': 'rgba(15,15,30,0.95)',
    '--input-bg': 'rgba(255,255,255,0.06)',
    '--card-radius': '12px', '--card-shadow': '0 8px 32px rgba(168,85,247,0.12)',
    '--card-shadow-hover': '0 12px 40px rgba(168,85,247,0.2)',
    '--chart-style': 'line', '--gauge-style': 'semicircle', '--stat-layout': 'grid', '--category-style': 'hbar',
    '--hero-layout': 'split', '--animation-speed': '0.3s',
    '--dashboard-layout': 'standard',
    '--chart-grid': 'rgba(255,255,255,0.06)', '--chart-accent': '#a855f7'
  }),

  // ── Academic Light ──
  academic: makeTheme('academic', 'Academic Light', 'Clean white with blue accents', {
    '--bg-primary': '#f8fafc', '--bg-secondary': '#f1f5f9',
    '--bg-card': '#fff', '--bg-glass': 'rgba(255,255,255,0.8)',
    '--glass-border': '#e2e8f0', '--glass-blur': '0px',
    '--accent': '#3b82f6', '--accent-hover': '#2563eb', '--accent-2': '#6366f1', '--accent-3': '#0ea5e9',
    '--text-primary': '#0f172a', '--text-secondary': '#475569', '--text-muted': '#94a3b8',
    '--gradient': 'linear-gradient(135deg,#3b82f6,#6366f1)',
    '--gradient-2': 'linear-gradient(135deg,#0ea5e9,#3b82f6)',
    '--shadow': '0 1px 3px rgba(0,0,0,0.1)', '--shadow-lg': '0 4px 12px rgba(0,0,0,0.1)',
    '--border-color': '#e2e8f0',
    '--sidebar-bg': '#fff', '--input-bg': '#fff', '--hover-bg': '#f1f5f9',
    '--navbar-bg': 'rgba(255,255,255,0.95)',
    '--card-radius': '8px', '--card-shadow': '0 1px 3px rgba(0,0,0,0.06)',
    '--card-shadow-hover': '0 4px 12px rgba(0,0,0,0.08)',
    '--chart-style': 'line', '--gauge-style': 'semicircle', '--stat-layout': 'grid', '--category-style': 'hbar',
    '--hero-layout': 'split', '--animation-speed': '0.25s',
    '--dashboard-layout': 'standard',
    '--chart-grid': 'rgba(0,0,0,0.06)', '--chart-accent': '#3b82f6'
  }),

  // ── Midnight ──
  midnight: makeTheme('midnight', 'Midnight Dark', 'Dark gray with blue highlights', {
    '--bg-primary': '#1e1e2e', '--bg-secondary': '#181825',
    '--bg-card': 'rgba(30,30,46,0.8)', '--bg-glass': 'rgba(40,40,60,0.6)',
    '--glass-border': 'rgba(255,255,255,0.06)', '--glass-blur': '12px',
    '--accent': '#60a5fa', '--accent-hover': '#3b82f6', '--accent-2': '#818cf8', '--accent-3': '#38bdf8',
    '--text-primary': '#e2e8f0', '--text-secondary': '#94a3b8', '--text-muted': '#64748b',
    '--gradient': 'linear-gradient(135deg,#60a5fa,#818cf8)',
    '--gradient-2': 'linear-gradient(135deg,#38bdf8,#60a5fa)',
    '--shadow': '0 4px 24px rgba(0,0,0,0.3)', '--shadow-lg': '0 8px 40px rgba(0,0,0,0.4)',
    '--border-color': 'rgba(255,255,255,0.06)',
    '--sidebar-bg': 'rgba(24,24,37,0.95)', '--input-bg': 'rgba(255,255,255,0.06)',
    '--card-radius': '10px', '--card-shadow': '0 4px 24px rgba(0,0,0,0.2)',
    '--card-shadow-hover': '0 8px 32px rgba(0,0,0,0.3)',
    '--chart-style': 'line', '--gauge-style': 'semicircle', '--stat-layout': 'grid', '--category-style': 'hbar',
    '--hero-layout': 'split', '--animation-speed': '0.3s',
    '--dashboard-layout': 'standard',
    '--chart-grid': 'rgba(255,255,255,0.05)', '--chart-accent': '#60a5fa'
  }),

  // ── AMOLED ──
  amoled: makeTheme('amoled', 'AMOLED Black', 'Pure black for battery efficiency', {
    '--bg-primary': '#000', '--bg-secondary': '#0a0a0a',
    '--bg-card': '#111', '--bg-glass': 'rgba(255,255,255,0.03)',
    '--glass-border': 'rgba(255,255,255,0.06)', '--glass-blur': '0px',
    '--accent': '#8b5cf6', '--accent-hover': '#7c3aed', '--accent-2': '#a78bfa', '--accent-3': '#6d28d9',
    '--text-primary': '#f3f4f6', '--text-secondary': '#9ca3af', '--text-muted': '#6b7280',
    '--gradient': 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
    '--gradient-2': 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
    '--shadow': '0 4px 24px rgba(139,92,246,0.1)', '--shadow-lg': '0 8px 40px rgba(139,92,246,0.15)',
    '--border-color': 'rgba(255,255,255,0.04)',
    '--sidebar-bg': '#000', '--input-bg': '#111',
    '--card-radius': '6px', '--card-shadow': '0 4px 24px rgba(0,0,0,0.3)',
    '--card-shadow-hover': '0 8px 40px rgba(0,0,0,0.4)',
    '--analysis-layout': 'inline',
    '--chart-style': 'dots', '--gauge-style': 'text', '--stat-layout': 'inline', '--category-style': 'compact',
    '--hero-layout': 'compact', '--animation-speed': '0.2s',
    '--dashboard-layout': 'compact',
    '--chart-grid': 'rgba(255,255,255,0.03)', '--chart-accent': '#8b5cf6'
  }),

  // ── Aurora ──
  aurora: makeTheme('aurora', 'Aurora', 'Animated purple and teal gradients', {
    '--bg-primary': '#0a0a1a', '--bg-secondary': '#0f0f2e',
    '--bg-card': 'rgba(15,15,46,0.7)', '--bg-glass': 'rgba(20,20,50,0.5)',
    '--glass-border': 'rgba(139,92,246,0.15)', '--glass-blur': '20px',
    '--accent': '#a855f7', '--accent-hover': '#9333ea', '--accent-2': '#06b6d4', '--accent-3': '#6366f1',
    '--text-primary': '#f0f0ff', '--text-secondary': 'rgba(240,240,255,0.7)', '--text-muted': 'rgba(240,240,255,0.4)',
    '--gradient': 'linear-gradient(135deg,#a855f7,#06b6d4,#6366f1)',
    '--gradient-2': 'linear-gradient(135deg,#6366f1,#a855f7,#06b6d4)',
    '--shadow': '0 8px 32px rgba(168,85,247,0.2)', '--shadow-lg': '0 16px 48px rgba(6,182,212,0.2)',
    '--border-color': 'rgba(139,92,246,0.1)',
    '--sidebar-bg': 'rgba(10,10,26,0.95)', '--input-bg': 'rgba(255,255,255,0.06)',
    '--card-radius': '14px', '--card-shadow': '0 8px 32px rgba(168,85,247,0.15)',
    '--card-shadow-hover': '0 16px 48px rgba(6,182,212,0.2)',
    '--analysis-layout': 'gauge-chart-cat',
    '--chart-style': 'line', '--gauge-style': 'fullcircle', '--stat-layout': 'grid', '--category-style': 'vbar',
    '--hero-layout': 'split', '--animation-speed': '0.35s',
    '--dashboard-layout': 'sidebar',
    '--chart-grid': 'rgba(139,92,246,0.08)', '--chart-accent': '#06b6d4'
  }),

  // ── N E O N ──
  neon: makeTheme('neon', 'Neon', 'Electric cyberpunk with glowing neons', {
    '--bg-primary': '#050510', '--bg-secondary': '#0a0a1e',
    '--bg-card': 'rgba(10,10,30,0.5)', '--bg-glass': 'rgba(20,20,50,0.3)',
    '--glass-border': 'rgba(255,0,128,0.15)', '--glass-blur': '24px',
    '--accent': '#ff0080', '--accent-hover': '#e00070', '--accent-2': '#00f5ff', '--accent-3': '#7c3aed',
    '--text-primary': '#f0f0ff', '--text-secondary': 'rgba(240,240,255,0.7)', '--text-muted': 'rgba(240,240,255,0.4)',
    '--gradient': 'linear-gradient(135deg,#ff0080,#00f5ff)',
    '--gradient-2': 'linear-gradient(135deg,#7c3aed,#ff0080,#00f5ff)',
    '--shadow': '0 0 30px rgba(255,0,128,0.2)', '--shadow-lg': '0 0 60px rgba(0,245,255,0.15)',
    '--border-color': 'rgba(255,0,128,0.08)',
    '--sidebar-bg': 'rgba(5,5,16,0.95)', '--input-bg': 'rgba(255,255,255,0.04)',
    '--card-radius': '16px', '--card-border-width': '0px',
    '--card-shadow': '0 0 30px rgba(255,0,128,0.15)', '--card-shadow-hover': '0 0 50px rgba(0,245,255,0.2)',
    '--analysis-layout': 'gauge-chart-cat',
    '--chart-style': 'neon', '--gauge-style': 'fullcircle', '--stat-layout': 'grid', '--category-style': 'vbar',
    '--hero-layout': 'overlay', '--animation-speed': '0.5s',
    '--dashboard-layout': 'sidebar',
    '--chart-grid': 'rgba(255,0,128,0.06)', '--chart-accent': '#ff0080',
    '--badge-radius': '8px'
  }),

  // ── O C E A N ──
  ocean: makeTheme('ocean', 'Ocean', 'Calming deep sea with wave gradients', {
    '--bg-primary': '#0b1926', '--bg-secondary': '#0d2137',
    '--bg-card': 'rgba(11,25,38,0.7)', '--bg-glass': 'rgba(13,33,55,0.5)',
    '--glass-border': 'rgba(6,182,212,0.12)', '--glass-blur': '16px',
    '--accent': '#06b6d4', '--accent-hover': '#0891b2', '--accent-2': '#3b82f6', '--accent-3': '#14b8a6',
    '--text-primary': '#e0f2fe', '--text-secondary': 'rgba(224,242,254,0.7)', '--text-muted': 'rgba(224,242,254,0.4)',
    '--gradient': 'linear-gradient(135deg,#06b6d4,#3b82f6)',
    '--gradient-2': 'linear-gradient(135deg,#14b8a6,#06b6d4)',
    '--shadow': '0 6px 24px rgba(6,182,212,0.15)', '--shadow-lg': '0 12px 48px rgba(59,130,246,0.2)',
    '--border-color': 'rgba(6,182,212,0.08)',
    '--sidebar-bg': 'rgba(11,25,38,0.95)', '--input-bg': 'rgba(255,255,255,0.05)',
    '--card-radius': '8px', '--card-shadow': '0 6px 24px rgba(6,182,212,0.1)',
    '--card-shadow-hover': '0 12px 40px rgba(59,130,246,0.15)',
    '--analysis-layout': 'chart-gauge-cat',
    '--chart-style': 'wave', '--gauge-style': 'needle', '--stat-layout': 'row', '--category-style': 'hbar',
    '--hero-layout': 'centered', '--animation-speed': '0.3s',
    '--dashboard-layout': 'grid',
    '--chart-grid': 'rgba(6,182,212,0.06)', '--chart-accent': '#06b6d4'
  }),

  // ── M I N I M A L ──
  minimal: makeTheme('minimal', 'Minimal', 'Ultra-clean with maximum whitespace', {
    '--bg-primary': '#fafafa', '--bg-secondary': '#f5f5f5',
    '--bg-card': '#fff', '--bg-glass': 'rgba(255,255,255,0.9)',
    '--glass-border': '#e5e5e5', '--glass-blur': '0px',
    '--accent': '#18181b', '--accent-hover': '#27272a', '--accent-2': '#52525b', '--accent-3': '#a1a1aa',
    '--text-primary': '#18181b', '--text-secondary': '#52525b', '--text-muted': '#a1a1aa',
    '--gradient': 'none', '--gradient-2': 'none',
    '--shadow': '0 1px 2px rgba(0,0,0,0.04)', '--shadow-lg': '0 2px 4px rgba(0,0,0,0.06)',
    '--border-color': '#e5e5e5',
    '--sidebar-bg': '#fafafa', '--input-bg': '#fff', '--hover-bg': '#f0f0f0',
    '--navbar-bg': 'rgba(250,250,250,0.95)',
    '--card-radius': '4px', '--card-border-width': '0.5px',
    '--card-shadow': '0 1px 2px rgba(0,0,0,0.03)', '--card-shadow-hover': '0 2px 4px rgba(0,0,0,0.05)',
    '--analysis-layout': 'inline',
    '--chart-style': 'dots', '--gauge-style': 'text', '--stat-layout': 'inline', '--category-style': 'compact',
    '--hero-layout': 'compact', '--animation-speed': '0.15s',
    '--chart-grid': 'rgba(0,0,0,0.04)', '--chart-accent': '#18181b',
    '--dashboard-layout': 'compact',
    '--badge-radius': '2px'
  }),

  // ── S U N R I S E (Light) ──
  sunrise: makeTheme('sunrise', 'Sunrise', 'Warm golden glow with orange accents', {
    '--bg-primary': '#fef7f0', '--bg-secondary': '#fdf0e0',
    '--bg-card': '#fff', '--bg-glass': 'rgba(255,255,255,0.9)',
    '--glass-border': '#fde3c4', '--glass-blur': '0px',
    '--accent': '#f97316', '--accent-hover': '#ea580c', '--accent-2': '#fb923c', '--accent-3': '#fdba74',
    '--text-primary': '#431407', '--text-secondary': '#7c2d12', '--text-muted': '#9a7a6a',
    '--gradient': 'linear-gradient(135deg,#f97316,#fb923c)',
    '--gradient-2': 'linear-gradient(135deg,#fdba74,#f97316)',
    '--shadow': '0 1px 3px rgba(249,115,22,0.1)', '--shadow-lg': '0 4px 12px rgba(249,115,22,0.12)',
    '--border-color': '#fde3c4',
    '--sidebar-bg': '#fff', '--input-bg': '#fff', '--hover-bg': '#fdf0e0',
    '--navbar-bg': 'rgba(255,255,255,0.95)',
    '--card-radius': '10px', '--card-shadow': '0 1px 3px rgba(249,115,22,0.06)',
    '--card-shadow-hover': '0 4px 12px rgba(249,115,22,0.08)',
    '--analysis-layout': 'cat-gauge-chart',
    '--chart-style': 'wave', '--gauge-style': 'donut', '--stat-layout': 'row', '--category-style': 'vbar',
    '--hero-layout': 'split', '--animation-speed': '0.25s',
    '--dashboard-layout': 'standard',
    '--chart-grid': 'rgba(249,115,22,0.06)', '--chart-accent': '#f97316'
  }),

  // ── L A V E N D E R (Light) ──
  lavender: makeTheme('lavender', 'Lavender', 'Soft purple with violet accents', {
    '--bg-primary': '#f8f6ff', '--bg-secondary': '#f0edff',
    '--bg-card': '#fff', '--bg-glass': 'rgba(255,255,255,0.9)',
    '--glass-border': '#ede9fe', '--glass-blur': '0px',
    '--accent': '#8b5cf6', '--accent-hover': '#7c3aed', '--accent-2': '#a78bfa', '--accent-3': '#c4b5fd',
    '--text-primary': '#1e1b4b', '--text-secondary': '#4338ca', '--text-muted': '#94a3b8',
    '--gradient': 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
    '--gradient-2': 'linear-gradient(135deg,#c4b5fd,#8b5cf6)',
    '--shadow': '0 1px 3px rgba(139,92,246,0.1)', '--shadow-lg': '0 4px 12px rgba(139,92,246,0.12)',
    '--border-color': '#ede9fe',
    '--sidebar-bg': '#fff', '--input-bg': '#fff', '--hover-bg': '#f0edff',
    '--navbar-bg': 'rgba(255,255,255,0.95)',
    '--card-radius': '10px', '--card-shadow': '0 1px 3px rgba(139,92,246,0.06)',
    '--card-shadow-hover': '0 4px 12px rgba(139,92,246,0.08)',
    '--analysis-layout': 'chart-gauge-cat',
    '--chart-style': 'curved', '--gauge-style': 'fullcircle', '--stat-layout': 'pills', '--category-style': 'vpill',
    '--hero-layout': 'split', '--animation-speed': '0.25s',
    '--dashboard-layout': 'standard',
    '--chart-grid': 'rgba(139,92,246,0.06)', '--chart-accent': '#8b5cf6'
  }),

  // ── F R E S H (Light) ──
  fresh: makeTheme('fresh', 'Fresh', 'Minty clean with teal accents', {
    '--bg-primary': '#f0fdfa', '--bg-secondary': '#ccfbf1',
    '--bg-card': '#fff', '--bg-glass': 'rgba(255,255,255,0.9)',
    '--glass-border': '#ccfbf1', '--glass-blur': '0px',
    '--accent': '#14b8a6', '--accent-hover': '#0d9488', '--accent-2': '#2dd4bf', '--accent-3': '#5eead4',
    '--text-primary': '#022c22', '--text-secondary': '#065f46', '--text-muted': '#94a3b8',
    '--gradient': 'linear-gradient(135deg,#14b8a6,#2dd4bf)',
    '--gradient-2': 'linear-gradient(135deg,#5eead4,#14b8a6)',
    '--shadow': '0 1px 3px rgba(20,184,166,0.1)', '--shadow-lg': '0 4px 12px rgba(20,184,166,0.12)',
    '--border-color': '#ccfbf1',
    '--sidebar-bg': '#fff', '--input-bg': '#fff', '--hover-bg': '#ccfbf1',
    '--navbar-bg': 'rgba(255,255,255,0.95)',
    '--card-radius': '10px', '--card-shadow': '0 1px 3px rgba(20,184,166,0.06)',
    '--card-shadow-hover': '0 4px 12px rgba(20,184,166,0.08)',
    '--analysis-layout': 'gauge-chart-cat',
    '--chart-style': 'dots', '--gauge-style': 'needle', '--stat-layout': 'pills', '--category-style': 'compact',
    '--hero-layout': 'split', '--animation-speed': '0.25s',
    '--dashboard-layout': 'standard',
    '--chart-grid': 'rgba(20,184,166,0.06)', '--chart-accent': '#14b8a6'
  }),

  // ── R E T R O ──
  retro: makeTheme('retro', 'Retro', 'Vintage warm with monospace charm', {
    '--bg-primary': '#1a1410', '--bg-secondary': '#231e18',
    '--bg-card': 'rgba(35,30,24,0.8)', '--bg-glass': 'rgba(45,38,30,0.5)',
    '--glass-border': 'rgba(217,170,110,0.15)', '--glass-blur': '0px',
    '--accent': '#d9aa6e', '--accent-hover': '#c99a5e', '--accent-2': '#a0764a', '--accent-3': '#f4d08c',
    '--text-primary': '#e8d5b7', '--text-secondary': 'rgba(232,213,183,0.7)', '--text-muted': 'rgba(232,213,183,0.4)',
    '--gradient': 'none', '--gradient-2': 'none',
    '--shadow': '0 2px 8px rgba(0,0,0,0.3)', '--shadow-lg': '0 4px 16px rgba(0,0,0,0.4)',
    '--border-color': 'rgba(217,170,110,0.12)',
    '--sidebar-bg': 'rgba(26,20,16,0.97)', '--input-bg': 'rgba(255,255,255,0.04)',
    '--card-radius': '0px', '--card-border-width': '1px',
    '--card-shadow': '0 2px 8px rgba(0,0,0,0.2)', '--card-shadow-hover': '0 4px 16px rgba(0,0,0,0.3)',
    '--analysis-layout': 'cat-gauge-chart',
    '--chart-style': 'ascii', '--gauge-style': 'text', '--stat-layout': 'table', '--category-style': 'table',
    '--hero-layout': 'framed', '--animation-speed': '0s', '--animation-enabled': '0',
    '--chart-grid': 'rgba(217,170,110,0.1)', '--chart-accent': '#d9aa6e',
    '--font-family': "'Courier New',Courier,monospace", '--heading-font': "'Courier New',Courier,monospace",
    '--dashboard-layout': 'stacked',
    '--badge-radius': '0px'
  }),

  // ── F O R E S T ──
  forest: makeTheme('forest', 'Forest', 'Earthy green with organic feel', {
    '--bg-primary': '#0d1f14', '--bg-secondary': '#122a1a',
    '--bg-card': 'rgba(13,31,20,0.7)', '--bg-glass': 'rgba(18,42,26,0.5)',
    '--glass-border': 'rgba(34,197,94,0.12)', '--glass-blur': '16px',
    '--accent': '#22c55e', '--accent-hover': '#16a34a', '--accent-2': '#14b8a6', '--accent-3': '#eab308',
    '--text-primary': '#dcfce7', '--text-secondary': 'rgba(220,252,231,0.7)', '--text-muted': 'rgba(220,252,231,0.4)',
    '--gradient': 'linear-gradient(135deg,#22c55e,#14b8a6)',
    '--gradient-2': 'linear-gradient(135deg,#eab308,#22c55e)',
    '--shadow': '0 6px 24px rgba(34,197,94,0.12)', '--shadow-lg': '0 12px 48px rgba(34,197,94,0.18)',
    '--border-color': 'rgba(34,197,94,0.08)',
    '--sidebar-bg': 'rgba(13,31,20,0.95)', '--input-bg': 'rgba(255,255,255,0.04)',
    '--card-radius': '10px', '--card-shadow': '0 6px 24px rgba(34,197,94,0.08)',
    '--card-shadow-hover': '0 12px 40px rgba(34,197,94,0.12)',
    '--analysis-layout': 'cat-chart-gauge',
    '--chart-style': 'curved', '--gauge-style': 'donut', '--stat-layout': 'pills', '--category-style': 'vpill',
    '--hero-layout': 'split', '--animation-speed': '0.35s',
    '--dashboard-layout': 'grid',
    '--chart-grid': 'rgba(34,197,94,0.06)', '--chart-accent': '#22c55e'
  })
}

export const themeList = Object.values(themes)
export const defaultTheme = 'glass'
