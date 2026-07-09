import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { usePremium } from '../contexts/PremiumContext'
import { useSync } from '../contexts/SyncContext'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import ThemeExplore from '../components/settings/ThemeExplore'
import { getGradeScale, updateGradeScale } from '../utils/marksStorage'
import { LogOut, GraduationCap, Cloud, RefreshCw, CloudOff, CloudSync, Download, CalendarCheck, BarChart3, ListTodo } from 'lucide-react'
import { downloadAttendanceCsv, downloadMarksCsv, downloadTasksCsv, downloadAllData } from '../utils/exportUtils'

const DEFAULT_GRADES = [
  { grade: 'S', minPct: 90, description: 'Outstanding' },
  { grade: 'A', minPct: 80, description: 'Excellent' },
  { grade: 'B', minPct: 70, description: 'Good' },
  { grade: 'C', minPct: 60, description: 'Average' },
  { grade: 'D', minPct: 50, description: 'Pass' },
  { grade: 'F', minPct: 0, description: 'Fail' }
]

export default function Settings() {
  const { currentThemeId, changeTheme } = useTheme()
  const { isPremium } = usePremium()
  const { logout } = useAuth()
  const { syncStatus, pendingChanges, lastSync, doSync } = useSync()
  const [gradeScale, setGradeScale] = useState(DEFAULT_GRADES)

  useEffect(() => {
    setGradeScale(getGradeScale())
  }, [])

  const handleGradeChange = (grade, value) => {
    const val = Math.max(0, Math.min(100, Number(value) || 0))
    const updated = gradeScale.map(g => g.grade === grade ? { ...g, minPct: val } : g)
    const sorted = [...updated].sort((a, b) => b.minPct - a.minPct)
    setGradeScale(sorted)
    updateGradeScale(sorted)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold gradient-text">Settings</h1>
        <p className="text-sm text-secondary">Customize your experience</p>
      </div>

      <ThemeExplore currentThemeId={currentThemeId} onThemeChange={changeTheme} />

      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap size={20} className="text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-primary">Grade Scale</h2>
        </div>
        <p className="text-xs text-secondary mb-4">Set minimum percentage thresholds for each grade</p>
        <div className="space-y-3">
          {gradeScale.filter(g => g.grade !== 'F').map(({ grade, minPct, description }) => (
            <div key={grade} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white gradient-bg">
                {grade}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-secondary">{description}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minPct}
                    onChange={e => handleGradeChange(grade, e.target.value)}
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-sm font-semibold text-primary w-8 text-right">{minPct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Cloud size={20} className="text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-primary">Cloud Sync</h2>
        </div>
        <p className="text-xs text-secondary mb-4">Automatically sync your data every 30 seconds</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-2">
              {syncStatus === 'synced' ? <CloudSync size={18} className="text-green-400" /> :
               syncStatus === 'syncing' || syncStatus === 'restoring' ? <RefreshCw size={18} className="text-amber-400 animate-spin" /> :
               <CloudOff size={18} className="text-red-400" />}
              <span className="text-sm text-primary capitalize">{syncStatus}</span>
            </div>
            <Badge variant={syncStatus === 'synced' ? 'success' : syncStatus === 'error' ? 'danger' : 'warning'}>
              {syncStatus === 'synced' ? 'Connected' :
               syncStatus === 'syncing' ? 'Syncing...' :
               syncStatus === 'restoring' ? 'Restoring...' :
               syncStatus === 'error' ? 'Error' :
               'Offline'}
            </Badge>
          </div>
          {pendingChanges > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)]">
              <span className="text-sm text-primary">Pending changes</span>
              <Badge variant="warning">{pendingChanges}</Badge>
            </div>
          )}
          {lastSync && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)]">
              <span className="text-sm text-primary">Last sync</span>
              <span className="text-xs text-muted">{new Date(lastSync).toLocaleString()}</span>
            </div>
          )}
          <button
            onClick={doSync}
            disabled={syncStatus === 'syncing' || syncStatus === 'restoring'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer border-0 disabled:opacity-50"
          >
            <RefreshCw size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            Force Sync Now
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <h2 className="text-lg font-semibold text-primary mb-3">Data Export</h2>
        <div className="space-y-2">
          <button onClick={() => { try {
            const data = JSON.parse(localStorage.getItem('student-os-attendance') || '{"subjects":[],"sessions":[]}')
            downloadAttendanceCsv(data); toast.success('Attendance exported')
          } catch { toast.error('No attendance data') } }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-sm text-primary hover:bg-hover transition-colors cursor-pointer border-0">
            <CalendarCheck size={16} className="text-blue-500" /> Export Attendance CSV
          </button>
          <button onClick={() => { try {
            const data = JSON.parse(localStorage.getItem('student-os-marks') || '[]')
            downloadMarksCsv(data); toast.success('Marks exported')
          } catch { toast.error('No marks data') } }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-sm text-primary hover:bg-hover transition-colors cursor-pointer border-0">
            <BarChart3 size={16} className="text-purple-500" /> Export Marks CSV
          </button>
          <button onClick={() => { try {
            const data = JSON.parse(localStorage.getItem('student-os-tasks') || '[]')
            downloadTasksCsv(data); toast.success('Tasks exported')
          } catch { toast.error('No tasks data') } }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-sm text-primary hover:bg-hover transition-colors cursor-pointer border-0">
            <ListTodo size={16} className="text-amber-500" /> Export Tasks CSV
          </button>
          <button onClick={() => { try {
            downloadAllData(); toast.success('Backup downloaded')
          } catch { toast.error('Export failed') } }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-sm text-primary hover:bg-hover transition-colors cursor-pointer border-0">
            <Download size={16} className="text-green-500" /> Export All Data (JSON Backup)
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <h2 className="text-lg font-semibold text-primary mb-3">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)]">
            <div>
              <p className="text-sm font-medium text-primary">Plan</p>
              <p className="text-xs text-muted">{isPremium ? 'Premium' : 'Free'}</p>
            </div>
            {!isPremium && (
              <Badge variant="premium" className="cursor-pointer">Upgrade</Badge>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--danger)]/10 text-[var(--danger)] font-medium text-sm hover:bg-[var(--danger)]/20 transition-colors cursor-pointer border-0"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
