let audioCtx = null

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

function playTone(freq, duration, type = 'sine', volume = 0.15) {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

export function playHabitComplete() {
  playTone(523, 0.12, 'sine', 0.12)
  setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 80)
  setTimeout(() => playTone(784, 0.2, 'sine', 0.12), 160)
}

export function playHabitDelete() {
  playTone(400, 0.1, 'square', 0.08)
  setTimeout(() => playTone(300, 0.15, 'square', 0.08), 100)
}

export function playHabitUncomplete() {
  playTone(400, 0.08, 'triangle', 0.08)
}

export function playStreakMilestone() {
  playTone(523, 0.1, 'sine', 0.12)
  setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 100)
  setTimeout(() => playTone(784, 0.1, 'sine', 0.12), 200)
  setTimeout(() => playTone(1047, 0.3, 'sine', 0.15), 300)
}

export function playHabitSound(type) {
  switch (type) {
    case 'complete': playHabitComplete(); break
    case 'delete': playHabitDelete(); break
    case 'uncomplete': playHabitUncomplete(); break
    case 'streak': playStreakMilestone(); break
  }
}
