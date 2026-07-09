import { useState, useEffect } from 'react'
import { Eye, Crown, Users, Clock, TrendingUp, TrendingDown, BarChart3, Activity, RefreshCw, Download, Calendar, MousePointerClick, Smartphone, Monitor, Tablet, ArrowRight, Zap } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import { fetchAnalytics, fetchRealtime, trackEvent } from '../../utils/analytics'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts'

const COLORS = { free: '#22c55e', premium: '#fbbf24', premium_plus: '#a78bfa' }
const PIE_COLORS = ['#22c55e', '#fbbf24', '#a78bfa', '#60a5fa', '#f472b6', '#34d399', '#f97316', '#a78bfa']

function fmtNum(n) { return (n || 0).toLocaleString() }

function fmtTime(s) {
  if (!s || s < 0) return '0s'
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}

export default function AnalyticsDashboard({ stats }) {
  const [data, setData] = useState(null)
  const [realtime, setRealtime] = useState({ activeToday: 0, viewsToday: 0, sessionsToday: 0 })
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  const load = async (d) => {
    setLoading(true)
    try {
      const [analyticsData, rt] = await Promise.all([fetchAnalytics(d), fetchRealtime()])
      setData(analyticsData)
      setRealtime(rt)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load(days) }, [days])

  const refresh = () => load(days)

  if (loading && !data) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 animate-pulse flex items-center justify-center mx-auto mb-3">
          <BarChart3 size={24} className="text-white" />
        </div>
        <p className="text-sm text-muted">Loading analytics...</p>
      </div>
    )
  }

  if (!data) return <p className="text-sm text-muted text-center py-8">No analytics data yet.</p>

  const { totals, pageStats, events, devices, browsers, sessions, flows, charts, retention, days: d } = data
  const avgDuration = totals.sessions > 0 ? fmtTime(Math.round(totals.time / totals.sessions)) : '0s'
  const bounceRate = totals.sessions > 0 ? Math.round((totals.bounces / totals.sessions) * 100) : 0

  const chartTooltip = { contentStyle: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 } }

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setDays(7)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 ${days === 7 ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-muted hover:text-primary'}`}>7d</button>
          <button onClick={() => setDays(30)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 ${days === 30 ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-muted hover:text-primary'}`}>30d</button>
          <button onClick={() => setDays(90)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 ${days === 90 ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-muted hover:text-primary'}`}>90d</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-muted hover:text-primary transition-all cursor-pointer border-0"><RefreshCw size={12} /> Refresh</button>
        </div>
      </div>

      {/* Real-time */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GlassCard className="p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400 font-medium uppercase tracking-wider">Live</span>
          </div>
          <p className="text-xl font-bold text-primary">{realtime.activeToday}</p>
          <p className="text-xs text-muted">Active Today</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <Eye size={16} className="mx-auto mb-1 text-blue-400" />
          <p className="text-xl font-bold text-primary">{fmtNum(realtime.viewsToday)}</p>
          <p className="text-xs text-muted">Views Today</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <Activity size={16} className="mx-auto mb-1 text-cyan-400" />
          <p className="text-xl font-bold text-primary">{fmtNum(realtime.sessionsToday)}</p>
          <p className="text-xs text-muted">Sessions Today</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <BarChart3 size={16} className="mx-auto mb-1 text-purple-400" />
          <p className="text-xl font-bold text-primary">{realtime.sessionsToday > 0 ? Math.round((realtime.bouncesToday || 0) / Math.max(realtime.sessionsToday, 1) * 100) : 0}%</p>
          <p className="text-xs text-muted">Bounce Rate Today</p>
        </GlassCard>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <GlassCard className="p-3 text-center"><Eye size={16} className="mx-auto mb-1 text-blue-400" /><p className="text-xl font-bold text-primary">{fmtNum(totals.views)}</p><p className="text-xs text-muted">Total Views ({d}d)</p></GlassCard>
        <GlassCard className="p-3 text-center"><Activity size={16} className="mx-auto mb-1 text-cyan-400" /><p className="text-xl font-bold text-primary">{fmtNum(totals.sessions)}</p><p className="text-xs text-muted">Sessions</p></GlassCard>
        <GlassCard className="p-3 text-center"><Clock size={16} className="mx-auto mb-1 text-amber-400" /><p className="text-xl font-bold text-primary">{avgDuration}</p><p className="text-xs text-muted">Avg Session</p></GlassCard>
        <GlassCard className="p-3 text-center"><BarChart3 size={16} className="mx-auto mb-1 text-rose-400" /><p className="text-xl font-bold text-primary">{bounceRate}%</p><p className="text-xs text-muted">Bounce Rate</p></GlassCard>
        <GlassCard className="p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users size={14} className="text-green-400" />
            <span className="text-[10px] text-muted">+{fmtNum(retention.newUsers)}</span>
          </div>
          <p className="text-xl font-bold text-primary">{fmtNum(retention.returningUsers)}</p>
          <p className="text-xs text-muted">Returning Users</p>
        </GlassCard>
      </div>

      {/* Avg Views per plan */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-3 text-center border-l-2 border-green-500"><p className="text-[10px] text-muted uppercase tracking-wider">Free Avg</p><p className="text-xl font-bold text-green-400">{stats?.free > 0 ? Math.round(totals.free / Math.max(stats.free, 1)) : 0}</p><p className="text-xs text-muted">views / user</p></GlassCard>
        <GlassCard className="p-3 text-center border-l-2 border-amber-500"><p className="text-[10px] text-muted uppercase tracking-wider">Premium Avg</p><p className="text-xl font-bold text-amber-400">{stats?.premium > 0 ? Math.round(totals.premium / Math.max(stats.premium, 1)) : 0}</p><p className="text-xs text-muted">views / user</p></GlassCard>
        <GlassCard className="p-3 text-center border-l-2 border-purple-500"><p className="text-[10px] text-muted uppercase tracking-wider">Premium+ Avg</p><p className="text-xl font-bold text-purple-400">{stats?.premiumPlus > 0 ? Math.round(totals.premium_plus / Math.max(stats.premiumPlus, 1)) : 0}</p><p className="text-xs text-muted">views / user</p></GlassCard>
      </div>

      {/* Charts Row 1: Daily Views + Active Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><TrendingUp size={14} className="text-blue-400" /><p className="text-xs font-semibold text-primary">Daily Page Views</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={charts.dailyViews}>
                <defs><linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => v?.slice(5) || ''} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip {...chartTooltip} />
                <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#viewGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><Users size={14} className="text-green-400" /><p className="text-xs font-semibold text-primary">Daily Active Users</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts.dailyUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => v?.slice(5) || ''} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip {...chartTooltip} />
                <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 2: Sessions + Bounce Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><Activity size={14} className="text-cyan-400" /><p className="text-xs font-semibold text-primary">Daily Sessions</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.dailySessions}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => v?.slice(5) || ''} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="sessions" fill="#22d3ee" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><BarChart3 size={14} className="text-rose-400" /><p className="text-xs font-semibold text-primary">Bounce Rate %</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts.dailyBounce}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => v?.slice(5) || ''} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip {...chartTooltip} />
                <Line type="monotone" dataKey="rate" stroke="#fb7185" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 3: Pages by Plan + User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><Eye size={14} className="text-purple-400" /><p className="text-xs font-semibold text-primary">Page Views by Plan</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
            <ResponsiveContainer width="100%" height={Math.max(180, (pageStats.length || 1) * 32)}>
              <BarChart data={pageStats.slice(0, 15)} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Tooltip {...chartTooltip} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="free" name="Free" fill={COLORS.free} radius={[0, 2, 2, 0]} stackId="a" />
                <Bar dataKey="premium" name="Premium" fill={COLORS.premium} radius={[0, 2, 2, 0]} stackId="a" />
                <Bar dataKey="premium_plus" name="Premium+" fill={COLORS.premium_plus} radius={[0, 2, 2, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><PieChart size={14} className="text-indigo-400" /><p className="text-xs font-semibold text-primary">Views Distribution</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3 flex items-center justify-center gap-4 flex-wrap">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={[
                  { name: 'Free', value: totals.free },
                  { name: 'Premium', value: totals.premium },
                  { name: 'Premium+', value: totals.premium_plus }
                ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value">
                  {[totals.free, totals.premium, totals.premium_plus].filter(v => v > 0).map((_, i) => (
                    <Cell key={i} fill={[COLORS.free, COLORS.premium, COLORS.premium_plus].filter((_, j) => [totals.free, totals.premium, totals.premium_plus][j] > 0)[i]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-400" /><span className="text-secondary">Free</span><span className="text-primary font-medium ml-auto">{Math.round((totals.free / Math.max(totals.views, 1)) * 100)}%</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-secondary">Premium</span><span className="text-primary font-medium ml-auto">{Math.round((totals.premium / Math.max(totals.views, 1)) * 100)}%</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" /><span className="text-secondary">Premium+</span><span className="text-primary font-medium ml-auto">{Math.round((totals.premium_plus / Math.max(totals.views, 1)) * 100)}%</span></div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 4: Session Duration + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><Clock size={14} className="text-amber-400" /><p className="text-xs font-semibold text-primary">Session Duration</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={sessions.map(s => ({ name: s.name.replace('_', '-'), value: s.value }))} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {sessions.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip {...chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><Zap size={14} className="text-amber-400" /><p className="text-xs font-semibold text-primary">Events</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
            {events.length === 0 ? <p className="text-xs text-muted text-center py-4">No events recorded yet</p> : (
              <ResponsiveContainer width="100%" height={Math.max(120, events.length * 28)}>
                <BarChart data={events.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickFormatter={v => v.replace(/_/g, ' ')} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 5: Devices + Browsers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><Smartphone size={14} className="text-blue-400" /><p className="text-xs font-semibold text-primary">Devices</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
            {devices.length === 0 ? <p className="text-xs text-muted text-center py-4">No device data</p> : (
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={devices.map(d => ({ ...d, icon: d.name === 'mobile' ? '📱' : d.name === 'desktop' ? '💻' : '📟' }))} cx="50%" cy="50%" outerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {devices.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><Monitor size={14} className="text-cyan-400" /><p className="text-xs font-semibold text-primary">Browsers</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
            {browsers.length === 0 ? <p className="text-xs text-muted text-center py-4">No browser data</p> : (
              <div className="space-y-2">
                {browsers.map(b => {
                  const pct = Math.round((b.value / Math.max(browsers.reduce((s, x) => s + x.value, 0), 1)) * 100)
                  return (
                    <div key={b.name} className="flex items-center gap-2">
                      <span className="text-xs text-secondary w-16">{b.name}</span>
                      <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted w-8 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* User Flow */}
      {flows.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3"><ArrowRight size={14} className="text-cyan-400" /><p className="text-xs font-semibold text-primary">Navigation Flow</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-3">
            <div className="flex flex-wrap gap-2">
              {flows.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 text-xs">
                  <span className="text-secondary">{f.from}</span>
                  <ArrowRight size={10} className="text-muted" />
                  <span className="text-secondary">{f.to}</span>
                  <span className="text-primary font-medium ml-1">{f.count}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Top Pages Table */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3"><Eye size={14} className="text-purple-400" /><p className="text-xs font-semibold text-primary">Top Pages</p></div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 500 }}>Page</th>
              <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 500 }}>Free</th>
              <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 500 }}>Premium</th>
              <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 500 }}>Premium+</th>
              <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 500 }}>Total</th>
              <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 500 }}>Avg Time</th>
            </tr></thead>
            <tbody>
              {pageStats.slice(0, 20).map((p, i) => (
                <tr key={p.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '6px 10px', color: 'var(--text-primary)' }}><span className="text-muted mr-1.5">{i + 1}.</span>{p.name}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: '#22c55e' }}>{fmtNum(p.free)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: '#fbbf24' }}>{fmtNum(p.premium)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: '#a78bfa' }}>{fmtNum(p.premium_plus)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{fmtNum(p.total)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--text-muted)' }}>{fmtTime(p.avgTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Retention */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3"><Users size={14} className="text-green-400" /><p className="text-xs font-semibold text-primary">User Retention</p></div>
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-3 text-center bg-green-500/5 border border-green-500/10">
            <p className="text-2xl font-bold text-green-400">{fmtNum(retention.newUsers)}</p>
            <p className="text-xs text-muted">New Users</p>
          </GlassCard>
          <GlassCard className="p-3 text-center bg-blue-500/5 border border-blue-500/10">
            <p className="text-2xl font-bold text-blue-400">{fmtNum(retention.returningUsers)}</p>
            <p className="text-xs text-muted">Returning Users</p>
            <p className="text-[10px] text-muted mt-0.5">{retention.returningUsers + retention.newUsers > 0 ? Math.round((retention.returningUsers / Math.max(retention.returningUsers + retention.newUsers, 1)) * 100) : 0}% retention</p>
          </GlassCard>
        </div>
      </GlassCard>
    </div>
  )
}
