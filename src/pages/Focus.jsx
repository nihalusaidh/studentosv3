import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useXp } from '../contexts/XpContext'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Play, Pause, RotateCcw, Clock, Timer as TimerIcon, Flame } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const POMODORO = 25 * 60
const SHORT_BREAK = 5 * 60
const LONG_BREAK = 15 * 60

export default function Focus() {
  const { user, profile } = useAuth()
  const { awardXp } = useXp()
  const [mode, setMode] = useState('pomodoro')
  const [timeLeft, setTimeLeft] = useState(POMODORO)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [dailyMinutes, setDailyMinutes] = useState(0)
  const [weekMinutes, setWeekMinutes] = useState(0)
  const intervalRef = useRef(null)

  const modes = {
    pomodoro: { label: 'Pomodoro', seconds: POMODORO },
    short: { label: 'Short Break', seconds: SHORT_BREAK },
    long: { label: 'Long Break', seconds: LONG_BREAK },
    custom: { label: 'Custom', seconds: 10 * 60 }
  }

  useEffect(() => {
    if (!user) return
    const today = format(new Date(), 'yyyy-MM-dd')
    const q = query(collection(db, 'focusSessions'), where('uid', '==', user.uid), where('date', '==', today))
    getDocs(q).then(snap => {
      let total = 0
      snap.forEach(d => { total += d.data().minutes || 0 })
      setDailyMinutes(total)
      setSessions(snap.size)
    }).catch(() => {})

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekQ = query(collection(db, 'focusSessions'), where('uid', '==', user.uid))
    getDocs(weekQ).then(snap => {
      let total = 0
      snap.forEach(d => { total += d.data().minutes || 0 })
      setWeekMinutes(total)
    }).catch(() => {})
  }, [user])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const handleComplete = useCallback(async () => {
    if (!user) return
    const minutes = Math.round((modes[mode].seconds - timeLeft) / 60)

    try {
      await addDoc(collection(db, 'focusSessions'), {
        uid: user.uid,
        date: format(new Date(), 'yyyy-MM-dd'),
        minutes: Math.max(1, minutes),
        completedAt: new Date().toISOString()
      })
      await awardXp(50, 'focus_session')
      toast.success(`Focus session complete! +50 XP`)
    } catch {
      toast.error('Failed to save session')
    }
  }, [user, mode, timeLeft, awardXp])

  const switchMode = (newMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(modes[newMode].seconds)
  }

  const toggleTimer = () => setIsRunning(!isRunning)
  const resetTimer = () => { setIsRunning(false); setTimeLeft(modes[mode].seconds) }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalSeconds = modes[mode].seconds
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold gradient-text">Focus Timer</h1>
        <p className="text-sm text-secondary">Stay focused, stay productive</p>
      </div>

      <GlassCard className="p-6 text-center">
        <div className="flex justify-center gap-2 mb-6">
          {Object.entries(modes).map(([key, m]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 ${
                mode === key ? 'gradient-bg text-white' : 'bg-[var(--bg-secondary)] text-secondary hover:bg-hover'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <svg className="w-48 h-48 mx-auto -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-color)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.827} ${282.7}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <p className="text-5xl font-bold text-primary tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </p>
              <p className="text-sm text-muted mt-1">{modes[mode].label}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={toggleTimer} size="lg" icon={isRunning ? Pause : Play}>
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button variant="secondary" onClick={resetTimer} icon={RotateCcw}>Reset</Button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center">
            <TimerIcon size={20} className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-xs text-muted">Today</p>
            <p className="text-lg font-bold text-primary">{dailyMinutes}m</p>
            <p className="text-xs text-secondary">{sessions} sessions</p>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-2)]/20 flex items-center justify-center">
            <Flame size={20} className="text-[var(--accent-2)]" />
          </div>
          <div>
            <p className="text-xs text-muted">This Week</p>
            <p className="text-lg font-bold text-primary">{weekMinutes}m</p>
            <p className="text-xs text-secondary">Total focus time</p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
