let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

export function playFlipSound(muted) {
  if (muted) return
  try {
    const c = getCtx(), o = c.createOscillator(), g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = 'sine'; o.frequency.setValueAtTime(800, c.currentTime); o.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.1)
    g.gain.setValueAtTime(0.08, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
    o.start(c.currentTime); o.stop(c.currentTime + 0.15)
  } catch {}
}

export function playSwipeSound(muted) {
  if (muted) return
  try {
    const c = getCtx(), o = c.createOscillator(), g = c.createGain()
    o.connect(g); g.connect(c.destination)
    o.type = 'sine'; o.frequency.setValueAtTime(300, c.currentTime); o.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.12)
    g.gain.setValueAtTime(0.06, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15)
    o.start(c.currentTime); o.stop(c.currentTime + 0.15)
  } catch {}
}

export function playSuccessSound(muted) {
  if (muted) return
  try {
    const c = getCtx()
    ;[523.25, 659.25, 783.99].forEach((freq, i) => {
      const o = c.createOscillator(), g = c.createGain()
      o.connect(g); g.connect(c.destination)
      o.type = 'sine'; o.frequency.value = freq
      g.gain.setValueAtTime(0, c.currentTime + i * 0.1); g.gain.linearRampToValueAtTime(0.08, c.currentTime + i * 0.1 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.1 + 0.3)
      o.start(c.currentTime + i * 0.1); o.stop(c.currentTime + i * 0.1 + 0.3)
    })
  } catch {}
}

export function playAchievementSound(muted) {
  if (muted) return
  try {
    const c = getCtx()
    ;[523.25, 587.33, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const o = c.createOscillator(), g = c.createGain()
      o.connect(g); g.connect(c.destination)
      o.type = 'triangle'; o.frequency.value = freq
      g.gain.setValueAtTime(0, c.currentTime + i * 0.08); g.gain.linearRampToValueAtTime(0.07, c.currentTime + i * 0.08 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.08 + 0.4)
      o.start(c.currentTime + i * 0.08); o.stop(c.currentTime + i * 0.08 + 0.4)
    })
  } catch {}
}

export function playCompletionSound(muted) {
  if (muted) return
  try {
    const c = getCtx()
    ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const o = c.createOscillator(), g = c.createGain()
      o.connect(g); g.connect(c.destination)
      o.type = 'sine'; o.frequency.value = freq
      g.gain.setValueAtTime(0, c.currentTime + i * 0.12); g.gain.linearRampToValueAtTime(0.1, c.currentTime + i * 0.12 + 0.03); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.12 + 0.5)
      o.start(c.currentTime + i * 0.12); o.stop(c.currentTime + i * 0.12 + 0.5)
    })
  } catch {}
}
