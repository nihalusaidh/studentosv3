import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { callGemini } from '../../config/gemini'
import { useAuth } from '../../contexts/AuthContext'
import { checkAiAccess, deductToken } from '../../utils/aiAccess'
import { Shuffle, RefreshCw, Sparkles, ChevronLeft, ChevronRight, Volume2, VolumeX, Zap, Trophy, RotateCcw, Star, Check, X, Crown, Upload } from 'lucide-react'
import { useXp } from '../../contexts/XpContext'
import ToolGuide from './ToolGuide'
import { playFlipSound, playSwipeSound, playSuccessSound, playAchievementSound, playCompletionSound } from '../../utils/flashcardSounds'
import toast from 'react-hot-toast'

const SOUND_KEY = 'student-os-flashcard-muted'
const STREAK_KEY = 'student-os-flashcard-streak'

function getMuted() { try { return localStorage.getItem(SOUND_KEY) === 'true' } catch { return false } }
function setMuted(v) { try { localStorage.setItem(SOUND_KEY, String(v)) } catch {} }

function getStreak() { try { return Number(localStorage.getItem(STREAK_KEY)) || 0 } catch { return 0 } }
function setStreak(v) { try { localStorage.setItem(STREAK_KEY, String(v)) } catch {} }

function generateParticles(count, color) {
  const particles = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
    const dist = 60 + Math.random() * 80
    particles.push({
      id: `${Date.now()}-${i}`,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      color,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 0.1
    })
  }
  return particles
}

const cardVariants = {
  enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.85 })
}

const textVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
}

export default function Flashcards() {
  const { awardXp } = useXp()
  const { user, profile } = useAuth()

  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [error, setError] = useState('')
  const [muted, setMutedState] = useState(getMuted)
  const [combo, setCombo] = useState(0)
  const [sessionXp, setSessionXp] = useState(0)
  const [completed, setCompleted] = useState(new Set())
  const [particles, setParticles] = useState([])
  const [showCompletion, setShowCompletion] = useState(false)
  const [swipeDir, setSwipeDir] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  const cardRef = useRef(null)
  const tiltX = useMotionValue(0.5)
  const tiltY = useMotionValue(0.5)
  const rotateX = useTransform(tiltY, [0, 1], [8, -8])
  const rotateY = useTransform(tiltX, [0, 1], [-8, 8])
  const dragX = useMotionValue(0)
  const dragOpacity = useTransform(dragX, [-150, 0, 150], [0.5, 1, 0.5])

  const streak = useMemo(() => getStreak(), [])

  const maxCards = cards.length
  const remaining = maxCards - completed.size
  const isComplete = remaining === 0 && maxCards > 0

  const toggleMute = useCallback(() => {
    setMutedState(p => { const nv = !p; setMuted(nv); return nv })
  }, [])

  const emitParticles = useCallback((color = 'var(--accent)') => {
    setParticles(generateParticles(12, color))
    setTimeout(() => setParticles([]), 800)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return toast.error('Enter a topic')
    setLoading(true)
    setCards([])
    setCurrent(0)
    setFlipped(false)
    setError('')
    setCompleted(new Set())
    setCombo(0)
    setShowCompletion(false)

    const access = checkAiAccess(profile)
    if (!access.allowed) {
      toast.error(access.needsUpgrade ? 'AI features require premium. Upgrade to continue.' : access.message)
      setLoading(false)
      return
    }

    try {
      const res = await callGemini(`Generate 5 flashcards on the topic: "${topic}". Return ONLY a valid JSON array with no markdown formatting or code fences. Each object must have: "front" (string, the question), "back" (string, the answer). Example format: [{"front":"What is photosynthesis?","back":"The process by which plants convert sunlight into energy."}]`)
      if (res.error) {
        setError(res.error)
        setLoading(false)
        return
      }

      setIsDemo(!!res.demo)
      const cleaned = res.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const parsed = JSON.parse(cleaned)
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid response')
      setCards(parsed)

      if (profile?.plan !== 'premium') await deductToken(user?.uid)
      toast.success(res.demo ? 'Demo flashcards created!' : 'Flashcards created!')
      setShuffled(false)
    } catch (e) {
      setError(e.message === 'Invalid response' ? 'Failed to parse flashcards. Try again.' : 'Failed to generate flashcards. Check your API key.')
    } finally {
      setLoading(false)
    }
  }, [topic])

  const goToCard = useCallback((index, dir) => {
    if (index < 0 || index >= cards.length) return
    setSwipeDir(dir)
    setCurrent(index)
    setFlipped(false)
    setParticles([])
  }, [cards.length])

  const handleFlip = useCallback(() => {
    if (isDragging) return
    setFlipped(p => { const nv = !p; if (nv) { playFlipSound(muted); emitParticles() }; return nv })
  }, [isDragging, muted, emitParticles])

  const handleKnowIt = useCallback(() => {
    const cIdx = current
    const newCompleted = new Set(completed)
    newCompleted.add(cIdx)
    setCompleted(newCompleted)

    const newCombo = combo + 1
    setCombo(newCombo)
    setStreak(newCombo)

    const xpBase = 25
    const comboBonus = Math.min(newCombo - 1, 5) * 5
    const xpEarned = xpBase + comboBonus
    setSessionXp(p => p + xpEarned)
    awardXp(xpEarned, 'flashcard_know')

    playSuccessSound(muted)
    emitParticles('var(--success)')

    if (newCompleted.size >= maxCards) {
      const bonusXp = 50 + newCombo * 10
      setSessionXp(p => p + bonusXp)
      awardXp(bonusXp, 'flashcard_complete')
      playCompletionSound(muted)
      setTimeout(() => setShowCompletion(true), 400)
      return
    }

    if (newCombo >= 5) playAchievementSound(muted)

    const nextIdx = findNextUncompleted(newCompleted, cIdx + 1)
    if (nextIdx !== -1) {
      setTimeout(() => goToCard(nextIdx, 1), 300)
    }
  }, [current, completed, combo, maxCards, muted, emitParticles, awardXp, goToCard])

  const handleReview = useCallback(() => {
    setCombo(0)
    setStreak(0)
    const nextIdx = findNextUncompleted(completed, current + 1)
    if (nextIdx !== -1) {
      playSwipeSound(muted)
      goToCard(nextIdx, 1)
    } else {
      const firstUncompleted = findNextUncompleted(completed, 0)
      if (firstUncompleted !== -1) {
        playSwipeSound(muted)
        goToCard(firstUncompleted, 1)
      }
    }
  }, [completed, current, muted, goToCard])

  function findNextUncompleted(completedSet, startFrom) {
    for (let i = startFrom; i < cards.length; i++) {
      if (!completedSet.has(i)) return i
    }
    for (let i = 0; i < startFrom; i++) {
      if (!completedSet.has(i)) return i
    }
    return -1
  }

  const handleShuffle = useCallback(() => {
    setCards(prev => {
      const arr = [...prev]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    })
    setCurrent(0)
    setFlipped(false)
    setCompleted(new Set())
    setCombo(0)
    setShowCompletion(false)
    setShuffled(true)
    toast.success('Cards shuffled!')
  }, [])

  const handleDragEnd = useCallback((_, info) => {
    setIsDragging(false)
    dragX.set(0)
    const isMobile = window.innerWidth < 768
    const threshold = isMobile ? 50 : 80
    if (info.offset.x > threshold) {
      if (current > 0) { playSwipeSound(muted); goToCard(current - 1, -1) }
    } else if (info.offset.x < -threshold) {
      if (current < cards.length - 1) { playSwipeSound(muted); goToCard(current + 1, 1) }
    }
  }, [current, cards.length, muted, goToCard, dragX])

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || flipped) return
    const rect = cardRef.current.getBoundingClientRect()
    tiltX.set((e.clientX - rect.left) / rect.width)
    tiltY.set((e.clientY - rect.top) / rect.height)
  }, [flipped, tiltX, tiltY])

  const handleMouseLeave = useCallback(() => {
    tiltX.set(0.5); tiltY.set(0.5)
  }, [tiltX, tiltY])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft' && current > 0) { goToCard(current - 1, -1); playSwipeSound(muted) }
      if (e.key === 'ArrowRight' && current < cards.length - 1) { goToCard(current + 1, 1); playSwipeSound(muted) }
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter') { handleFlip() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [current, cards.length, muted, goToCard, handleFlip])

  const currentCard = cards[current]

  const fileRef = useRef()
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.txt')) { toast.error('Please upload a .txt file'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setTopic(ev.target.result)
    reader.readAsText(file)
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter a topic or upload .txt..." className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--border-color)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent)] outline-none" />
            <button onClick={() => fileRef.current?.click()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-all duration-200 cursor-pointer border-0">
              <Upload size={14} />
            </button>
          </div>
          <button onClick={handleGenerate} disabled={loading} className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-0 flex items-center gap-2">
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate
          </button>
        </div>
        <div className="p-6 text-center rounded-2xl bg-[var(--bg-glass)] border border-[var(--glass-border)] backdrop-blur-xl">
          <p className="text-sm text-[var(--danger)] mb-3">{error}</p>
          <button onClick={handleGenerate} className="px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all cursor-pointer border-0">Retry</button>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter a topic or upload .txt..." className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--border-color)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent)] outline-none" />
          <button onClick={() => fileRef.current?.click()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-all duration-200 cursor-pointer border-0">
            <Upload size={14} />
          </button>
          <input ref={fileRef} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
        </div>
        <button onClick={handleGenerate} disabled={loading} className="px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-0 flex items-center gap-2">
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Generate
        </button>
      </div>
    )
  }

  if (showCompletion) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="text-center space-y-6 py-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }} className="w-20 h-20 mx-auto rounded-full gradient-bg flex items-center justify-center">
          <Trophy size={36} className="text-white" />
        </motion.div>
        <div>
          <motion.h2 variants={textVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="text-2xl font-bold gradient-text">All Done!</motion.h2>
          <motion.p variants={textVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="text-sm text-secondary mt-1">You reviewed all {maxCards} flashcards</motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex items-center justify-center gap-6">
          <div className="text-center"><p className="text-2xl font-bold text-primary">{sessionXp}</p><p className="text-xs text-muted">XP Earned</p></div>
          <div className="w-px h-10 bg-[var(--border-color)]" />
          <div className="text-center"><p className="text-2xl font-bold text-primary">{combo}</p><p className="text-xs text-muted">Best Streak</p></div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3 justify-center">
          <button onClick={() => { setShowCompletion(false); setCompleted(new Set()); setCurrent(0); setCombo(0); setSessionXp(0) }} className="px-6 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-all cursor-pointer border-0 flex items-center gap-2">
            <RotateCcw size={16} /> Study Again
          </button>
          <button onClick={handleGenerate} className="px-6 py-2.5 rounded-xl bg-[var(--bg-glass)] border border-[var(--glass-border)] text-primary text-sm font-medium hover:bg-hover transition-all cursor-pointer flex items-center gap-2">
            <Sparkles size={16} /> New Topic
          </button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <ToolGuide
        steps={['Enter a topic', 'Click "Generate"', 'Swipe or flip through flashcards', 'Mark as Known ✓ or Need Review ✗']}
        tips={['Keyboard shortcuts: ← → to navigate, Space/Enter to flip', 'XP and streaks for consistent study sessions', 'Shuffle button randomises card order']}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-semibold text-primary">Flashcards</span>
          {isDemo && <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/30">Demo</span>}
          <span className="text-xs text-muted bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">{current + 1}/{maxCards}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleShuffle} className="p-2 rounded-lg hover:bg-hover text-secondary hover:text-primary transition-all cursor-pointer border-0 bg-transparent" title="Shuffle cards">
            <Shuffle size={16} />
          </button>
          <button onClick={toggleMute} className="p-2 rounded-lg hover:bg-hover text-secondary hover:text-primary transition-all cursor-pointer border-0 bg-transparent" title={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      <div className="relative h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
        <motion.div className="absolute inset-y-0 left-0 rounded-full gradient-bg" initial={{ width: 0 }} animate={{ width: `${((maxCards - remaining) / maxCards) * 100}%` }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted px-1">
        <span className="flex items-center gap-1"><Zap size={12} className="text-amber-400" /> x{combo}</span>
        <span className="flex items-center gap-1"><Star size={12} className="text-purple-400" /> {sessionXp} XP</span>
        <span className="flex items-center gap-1">{remaining} left</span>
      </div>

      <div className="relative" style={{ perspective: 1200 }}>
        {[1, 2].map(i => {
          const stackIdx = current + i
          if (stackIdx >= cards.length) return null
          return (
            <motion.div key={`stack-${stackIdx}`} initial={{ opacity: 1 }} animate={{ opacity: 0.15 + (1 - i * 0.4), scale: 1 - i * 0.04, y: i * 6 }} transition={{ duration: 0.3 }} className="absolute inset-0 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-glass)]" style={{ zIndex: -i, pointerEvents: 'none' }} />
          )
        })}

        <AnimatePresence mode="wait" custom={swipeDir}>
          <motion.div
            key={current}
            ref={cardRef}
            custom={swipeDir}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{
              rotateX, rotateY,
              x: dragX,
              opacity: dragOpacity,
              transformStyle: 'preserve-3d'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleFlip}
            onTouchStart={() => setIsDragging(false)}
            className="relative cursor-pointer select-none touch-none"
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.9 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full"
            >
              <div className="rounded-2xl bg-[var(--bg-glass)] border border-[var(--glass-border)] backdrop-blur-xl overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent)]/5 to-transparent pointer-events-none" />
                <div className="relative p-8 min-h-[220px] flex flex-col items-center justify-center text-center">
                  <motion.span key={`label-${flipped}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-medium text-muted uppercase tracking-wider mb-3">
                    {flipped ? 'Answer' : 'Question'}
                  </motion.span>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`${current}-${flipped}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="text-base md:text-lg font-medium text-primary leading-relaxed"
                    >
                      {flipped ? currentCard.back : currentCard.front}
                    </motion.p>
                  </AnimatePresence>

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-[10px] text-muted mt-4">
                    {flipped ? 'Tap to go back' : 'Tap to reveal answer'}
                  </motion.p>
                </div>

                <div className="absolute top-3 right-3">
                  <motion.div animate={{ rotate: flipped ? 180 : 0 }} transition={{ duration: 0.4 }}>
                    <RotateCcw size={14} className="text-muted/50" />
                  </motion.div>
                </div>
              </div>

              <div className="absolute inset-0 rounded-2xl bg-[var(--bg-glass)] border border-[var(--glass-border)] backdrop-blur-xl overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent)]/5 to-transparent pointer-events-none" />
                <div className="relative p-8 min-h-[220px] flex flex-col items-center justify-center text-center">
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-medium text-muted uppercase tracking-wider mb-3">
                    Answer
                  </motion.span>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`${current}-back`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="text-base md:text-lg font-medium text-primary leading-relaxed"
                    >
                      {currentCard.back}
                    </motion.p>
                  </AnimatePresence>

                  <div className="flex items-center gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => { e.stopPropagation(); handleReview() }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/25 transition-all cursor-pointer"
                    >
                      <X size={14} /> Need Review
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => { e.stopPropagation(); handleKnowIt() }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/25 transition-all cursor-pointer"
                    >
                      <Check size={14} /> Know It
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: p.tx, y: p.ty, scale: 0, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: p.delay, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
              style={{ width: p.size, height: p.size, background: 'var(--accent)', zIndex: 20 }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-3 pt-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { if (current > 0) { playSwipeSound(muted); goToCard(current - 1, -1) } }}
          disabled={current === 0}
          className="p-2.5 rounded-xl bg-[var(--bg-glass)] border border-[var(--glass-border)] text-secondary hover:text-primary disabled:opacity-30 transition-all cursor-pointer border-0 bg-transparent"
        >
          <ChevronLeft size={18} />
        </motion.button>

        <div className="flex items-center gap-1.5">
          {cards.map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.8 }}
              onClick={() => goToCard(i, i > current ? 1 : -1)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer border-0 ${completed.has(i) ? 'bg-emerald-400' : i === current ? 'w-5 bg-[var(--accent)]' : 'bg-[var(--border-color)]'}`}
            />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { if (current < cards.length - 1) { playSwipeSound(muted); goToCard(current + 1, 1) } }}
          disabled={current === cards.length - 1}
          className="p-2.5 rounded-xl bg-[var(--bg-glass)] border border-[var(--glass-border)] text-secondary hover:text-primary disabled:opacity-30 transition-all cursor-pointer border-0 bg-transparent"
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {sessionXp > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-4 text-xs text-muted pt-1">
          <span className="flex items-center gap-1"><Zap size={12} className="text-amber-400" /> Combo x{combo}</span>
          <span className="flex items-center gap-1"><Star size={12} className="text-purple-400" /> {sessionXp} XP this session</span>
        </motion.div>
      )}
    </div>
  )
}
