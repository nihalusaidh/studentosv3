import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore'
import { db, auth } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Users, Crown, RefreshCw, Search, Shield, BarChart3, Activity, X, Download, CheckSquare, Square, Clock, Megaphone, User, Bot } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import toast from 'react-hot-toast'
import { updateAdminPlan } from '../utils/analytics'
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard'

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1px solid var(--border-color)',
  background: 'var(--input-bg)', color: 'var(--text-primary)',
  fontSize: 14, outline: 'none', marginBottom: 12
}
const btnStyle = (color = 'var(--accent)') => ({
  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
  background: `${color}20`, color
})
const tabStyle = (active) => ({
  padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
  background: active ? 'var(--accent)' : 'var(--bg-secondary)', color: active ? '#fff' : 'var(--text-secondary)'
})

const MONTHLY_PRICE = 199
const MONTHLY_PRICE_PLUS = 499


export default function Admin() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(new Set())
  const [stats, setStats] = useState({ total: 0, premium: 0, free: 0, logins: 0 })
  const [recentSignups, setRecentSignups] = useState([])

  const [emailTarget, setEmailTarget] = useState(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sending, setSending] = useState(false)
  const [emailDone, setEmailDone] = useState(false)
  const [drawerUser, setDrawerUser] = useState(null)

  const [announceText, setAnnounceText] = useState('')
  const [announceSending, setAnnounceSending] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [payments, setPayments] = useState([])
  const [revenue, setRevenue] = useState({ lastMonth: 0, prevMonth: 0, lastYear: 0, prevYear: 0 })

  const [upgradingSelf, setUpgradingSelf] = useState(false)

  const handleSelfUpgrade = async () => {
    if (!user) return
    setUpgradingSelf(true)
    const current = typeof profile?.plan === 'string' ? profile.plan : 'free'
    const next = current === 'premium_plus' ? 'premium' : current === 'premium' ? 'premium_plus' : 'premium'
    const ok = await updateAdminPlan(user.uid, next)
    if (ok) {
      toast.success(`Plan updated to ${next === 'premium_plus' ? 'Premium+' : 'Premium'} — refresh to see changes`)
      loadUsers()
    } else toast.error('Failed to update plan')
    setUpgradingSelf(false)
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      const list = [];
      let total = 0, premium = 0, premiumPlus = 0, logins = 0;
      const recent = []
      snap.forEach(d => {
        total++
        const data = d.data()
        if (data.plan === 'premium_plus') premiumPlus++
        else if (data.plan === 'premium') premium++
        logins += data.loginCount || 0
        list.push({ uid: d.id, ...data })
        const c = data.createdAt
        if (c) {
          const t = c?.toMillis ? c.toMillis() : typeof c === 'string' ? new Date(c).getTime() : 0
          if (Date.now() - t < 7 * 24 * 60 * 60 * 1000) recent.push({ uid: d.id, email: data.email, displayName: data.displayName, createdAt: c })
        }
      })
      setUsers(list); setStats({ total, premium, premiumPlus, free: total - premium - premiumPlus, logins })
      setRecentSignups(recent.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)))
    } catch (e) { toast.error('Failed to load users') }
    setLoading(false)
  }

  const loadPayments = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')))
      const list = []
      snap.forEach(d => list.push({ id: d.id, ...d.data() }))
      setPayments(list)

      const now = Date.now()
      const msMonth = 30 * 24 * 60 * 60 * 1000
      const msYear = 365 * 24 * 60 * 60 * 1000
      let lastMonth = 0, prevMonth = 0, lastYear = 0, prevYear = 0
      list.forEach(p => {
        const t = p.createdAt?.toMillis?.() || 0
        const amount = p.amount || 0
        if (now - t < msMonth) lastMonth += amount
        else if (now - t < 2 * msMonth) prevMonth += amount
        if (now - t < msYear) lastYear += amount
        else if (now - t < 2 * msYear) prevYear += amount
      })
      setRevenue({ lastMonth, prevMonth, lastYear, prevYear })
    } catch {}
  }

  const loadAnnouncements = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')))
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {}
  }

  useEffect(() => { loadUsers(); loadAnnouncements() }, [])

  useEffect(() => {
    let result = users
    if (filter === 'premium') result = result.filter(u => u.plan === 'premium')
    else if (filter === 'premium_plus') result = result.filter(u => u.plan === 'premium_plus')
    else if (filter === 'free') result = result.filter(u => u.plan !== 'premium' && u.plan !== 'premium_plus')
    if (search.trim()) { const s = search.toLowerCase(); result = result.filter(u => (u.email || '').toLowerCase().includes(s) || (u.displayName || '').toLowerCase().includes(s)) }
    setFiltered(result)
  }, [search, filter, users])

  const logPayment = async (uid, plan) => {
    if (plan !== 'premium' && plan !== 'premium_plus') return
    const amount = plan === 'premium_plus' ? MONTHLY_PRICE_PLUS : MONTHLY_PRICE
    await addDoc(collection(db, 'payments'), {
      uid, amount, currency: 'INR', plan: plan === 'premium_plus' ? 'premium_plus' : 'monthly',
      grantedBy: auth.currentUser?.email || 'admin',
      createdAt: serverTimestamp(), note: plan === 'premium_plus' ? 'Premium+ admin grant' : 'Admin grant'
    })
  }

  const togglePremium = async (uid, currentPlan) => {
    const next = currentPlan === 'premium_plus' ? 'free' : currentPlan === 'premium' ? 'premium_plus' : 'premium'
    await updateDoc(doc(db, 'users', uid), { plan: next })
    if (next === 'premium' || next === 'premium_plus') await logPayment(uid, next)
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, plan: next } : u))
    const label = next === 'premium_plus' ? 'Premium+' : next === 'premium' ? 'Premium' : 'Free'
    toast.success(`Changed to ${label}`)
  }

  const addTokens = async (uid) => {
    await updateDoc(doc(db, 'users', uid), { tokens: increment(10) })
    await addDoc(collection(db, 'tokenLogs'), { uid, amount: 10, type: 'grant', grantedBy: auth.currentUser?.email || 'admin', createdAt: serverTimestamp() })
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, tokens: (u.tokens || 0) + 10 } : u))
    toast.success('10 tokens added')
  }

  const bulkAction = async (action) => {
    if (selected.size === 0) return toast.error('No users selected')
    setLoading(true)
    const promises = []
    selected.forEach(uid => {
      if (action === 'premium_plus') {
        promises.push(updateDoc(doc(db, 'users', uid), { plan: 'premium_plus' }))
        promises.push(logPayment(uid, 'premium_plus'))
      } else if (action === 'premium') {
        promises.push(updateDoc(doc(db, 'users', uid), { plan: 'premium' }))
        promises.push(logPayment(uid, 'premium'))
      } else if (action === 'free') promises.push(updateDoc(doc(db, 'users', uid), { plan: 'free' }))
      else if (action === 'tokens') {
        promises.push(updateDoc(doc(db, 'users', uid), { tokens: increment(10) }))
        promises.push(addDoc(collection(db, 'tokenLogs'), { uid, amount: 10, type: 'grant', grantedBy: auth.currentUser?.email || 'admin', createdAt: serverTimestamp() }))
      }
    })
    await Promise.all(promises)
    await loadUsers(); await loadPayments()
    setSelected(new Set())
    toast.success(`Bulk ${action} completed for ${selected.size} users`)
    setLoading(false)
  }

  const exportCsv = () => {
    const headers = ['Email', 'Name', 'Plan', 'Tokens', 'Logins', 'Created At', 'Last Active']
    const rows = filtered.map(u => [u.email || '', u.displayName || '', u.plan || 'free', u.plan === 'premium' || u.plan === 'premium_plus' ? 'Unlimited' : (u.tokens ?? 0), u.loginCount || 0, u.createdAt?.toDate?.().toISOString() || u.createdAt || '', u.lastActiveAt?.toDate?.().toISOString() || ''])
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `student-os-users-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) return
    setSending(true)
    try {
      await addDoc(collection(db, 'emailOutbox'), { from: auth.currentUser?.email || 'admin', to: emailTarget.email, toUid: emailTarget.uid, subject: emailSubject.trim(), body: emailBody.trim(), status: 'draft', createdAt: serverTimestamp() })
      setEmailDone(true); toast.success('Email saved')
    } catch { toast.error('Failed to save email') }
    setSending(false)
  }

  const copyEmail = () => { const text = `To: ${emailTarget.email}\nSubject: ${emailSubject}\n\n${emailBody}`; navigator.clipboard.writeText(text).then(() => toast.success('Copied')) }

  const handleAnnounce = async () => {
    if (!announceText.trim()) return
    setAnnounceSending(true)
    try {
      await addDoc(collection(db, 'announcements'), { message: announceText.trim(), createdBy: auth.currentUser?.email || 'admin', createdAt: serverTimestamp(), active: true })
      setAnnounceText(''); toast.success('Announcement posted'); await loadAnnouncements()
    } catch { toast.error('Failed to post announcement') }
    setAnnounceSending(false)
  }

  const toggleAnnounce = async (id, current) => {
    await updateDoc(doc(db, 'announcements', id), { active: !current })
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !current } : a))
  }

  const getTokenDisplay = (u) => u.plan === 'premium' || u.plan === 'premium_plus' ? 'Unlimited' : (u.tokens ?? 0)
  const toggleAll = () => { if (selected.size === filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map(u => u.uid))) }
  const toggleOne = (uid) => { const next = new Set(selected); next.has(uid) ? next.delete(uid) : next.add(uid); setSelected(next) }

  if (profile?.role !== 'admin') {
    return <GlassCard className="p-6 text-center"><Shield size={32} className="mx-auto mb-3 text-muted" /><h2 className="text-lg font-semibold text-primary mb-1">Access Denied</h2><p className="text-sm text-muted">Admin privileges required</p></GlassCard>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-xl font-bold gradient-text">Admin Panel</h1><p className="text-sm text-secondary">Manage users, revenue, announcements</p></div>
        <div className="flex gap-2">
          {tab === 'users' && (
            <>
              <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs font-medium text-secondary hover:text-primary transition-all cursor-pointer border-0 bg-transparent"><Download size={14} /> Export CSV</button>
              <button onClick={loadUsers} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs font-medium text-secondary hover:text-primary transition-all cursor-pointer border-0 bg-transparent" disabled={loading}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh</button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('users')} style={tabStyle(tab === 'users')}><Users size={14} /> Users</button>
        <button onClick={() => setTab('analytics')} style={tabStyle(tab === 'analytics')}><BarChart3 size={14} /> Analytics</button>
        <button onClick={() => setTab('announcements')} style={tabStyle(tab === 'announcements')}><Megaphone size={14} /> Announcements</button>
      </div>

      {/* Admin Self-Management */}
      <GlassCard className="p-4 border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-cyan-500/5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Your Account: <span className="text-purple-400">{profile?.email || 'Admin'}</span></p>
              <p className="text-xs text-muted">Current plan: <span className="font-medium" style={{ color: profile?.plan === 'premium_plus' ? '#a78bfa' : profile?.plan === 'premium' ? '#fdcb6e' : 'var(--text-muted)' }}>{profile?.plan === 'premium_plus' ? '👑 Premium+' : profile?.plan === 'premium' ? '⭐ Premium' : 'Free'}</span></p>
            </div>
          </div>
          <button onClick={handleSelfUpgrade} disabled={upgradingSelf}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25 cursor-pointer border-0">
            {upgradingSelf ? 'Updating...' : profile?.plan === 'premium_plus' ? 'Downgrade to Premium' : profile?.plan === 'premium' ? 'Upgrade to Premium+' : 'Upgrade to Premium'}
          </button>
        </div>
      </GlassCard>

      {/* ===== USERS TAB ===== */}
      {tab === 'users' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <GlassCard className="p-3 text-center"><Users size={18} className="mx-auto mb-1 text-blue-400" /><p className="text-xl font-bold text-primary">{stats.total}</p><p className="text-xs text-muted">Total</p></GlassCard>
            <GlassCard className="p-3 text-center"><Crown size={18} className="mx-auto mb-1 text-amber-400" /><p className="text-xl font-bold text-primary">{stats.premium}</p><p className="text-xs text-muted">Premium</p></GlassCard>
            <GlassCard className="p-3 text-center"><Crown size={18} className="mx-auto mb-1 text-purple-400" /><p className="text-xl font-bold text-primary">{stats.premiumPlus || 0}</p><p className="text-xs text-muted">Premium+</p></GlassCard>
            <GlassCard className="p-3 text-center"><BarChart3 size={18} className="mx-auto mb-1 text-green-400" /><p className="text-xl font-bold text-primary">{stats.free}</p><p className="text-xs text-muted">Free</p></GlassCard>
            <GlassCard className="p-3 text-center"><Activity size={18} className="mx-auto mb-1 text-green-400" /><p className="text-xl font-bold text-primary">{stats.logins.toLocaleString()}</p><p className="text-xs text-muted">Logins</p></GlassCard>
            <GlassCard className="p-3 text-center"><Clock size={18} className="mx-auto mb-1 text-cyan-400" /><p className="text-xl font-bold text-primary">{recentSignups.length}</p><p className="text-xs text-muted">New (7d)</p></GlassCard>
          </div>

          {recentSignups.length > 0 && (
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-cyan-400" /><h3 className="text-sm font-semibold text-primary">Recent Signups (7 days)</h3></div>
              <div className="flex flex-wrap gap-2">{recentSignups.map(u => <div key={u.uid} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-xs text-secondary"><User size={12} /> {u.email || u.displayName || u.uid}</div>)}</div>
            </GlassCard>
          )}

          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: 0, paddingLeft: 32 }} />
            </div>
            {['all', 'free', 'premium'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: filter === f ? 'var(--accent)' : 'var(--bg-secondary)', color: filter === f ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: filter === f ? 600 : 400 }}>{f === 'all' ? 'All' : f === 'free' ? 'Free' : 'Premium'}</button>
            ))}
            {selected.size > 0 && (
              <div className="flex gap-1 ml-2">
                <button onClick={() => bulkAction('premium')} style={btnStyle('#fdcb6e')}>Premium ({selected.size})</button>
                <button onClick={() => bulkAction('premium_plus')} style={btnStyle('#a78bfa')}>Premium+ ({selected.size})</button>
                <button onClick={() => bulkAction('free')} style={btnStyle()}>Free ({selected.size})</button>
                <button onClick={() => bulkAction('tokens')} style={btnStyle('#00b894')}>+10 Tokens ({selected.size})</button>
              </div>
            )}
          </div>

          {loading ? <div className="p-10 text-center text-muted text-sm">Loading...</div> : filtered.length === 0 ? <div className="p-10 text-center text-muted text-sm">No users found</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 6px', textAlign: 'center', width: 30 }}><button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>{selected.size === filtered.length ? <CheckSquare size={14} /> : <Square size={14} />}</button></th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>Email</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>Name</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 500 }}>Plan</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 500 }}>Tokens</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 500 }}>Logins</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 500 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => setDrawerUser(u)}>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }} onClick={e => e.stopPropagation()}><button onClick={() => toggleOne(u.uid)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>{selected.has(u.uid) ? <CheckSquare size={14} className="text-[var(--accent)]" /> : <Square size={14} />}</button></td>
                      <td style={{ padding: '10px 12px', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{u.displayName || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: u.plan === 'premium_plus' ? 'rgba(167,139,250,0.15)' : u.plan === 'premium' ? 'rgba(253,203,110,0.15)' : 'rgba(255,255,255,0.06)', color: u.plan === 'premium_plus' ? '#a78bfa' : u.plan === 'premium' ? '#fdcb6e' : 'var(--text-muted)' }}>{u.plan === 'premium_plus' ? '👑 Premium+' : u.plan === 'premium' ? '⭐ Premium' : 'Free'}</span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}><span style={{ color: getTokenDisplay(u) === 'Unlimited' ? '#00b894' : 'var(--text-secondary)' }}>{getTokenDisplay(u)}</span></td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>{u.loginCount || 0}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button onClick={() => togglePremium(u.uid, u.plan)} style={btnStyle(u.plan === 'premium_plus' ? '#a78bfa' : u.plan === 'premium' ? '#6c5ce7' : '#fdcb6e')}>{u.plan === 'premium_plus' ? 'Demote' : u.plan === 'premium' ? '→ Premium+' : 'Make Premium'}</button>
                          {u.plan !== 'premium' && u.plan !== 'premium_plus' && <button onClick={() => addTokens(u.uid)} style={btnStyle('var(--text-secondary)')}>+10 Tokens</button>}
                          <button onClick={() => { setEmailTarget(u); setEmailDone(false); setEmailSubject(''); setEmailBody('') }} style={btnStyle('#6c5ce7')}>Email</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ===== ANALYTICS TAB ===== */}
      {tab === 'analytics' && (
        <AnalyticsDashboard stats={stats} />
      )}

      {/* ===== ANNOUNCEMENTS TAB ===== */}
      {tab === 'announcements' && (
        <>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3"><Megaphone size={16} className="text-amber-400" /><h3 className="text-sm font-semibold text-primary">New Announcement</h3></div>
            <div className="flex gap-2">
              <input value={announceText} onChange={e => setAnnounceText(e.target.value)} placeholder="Write an announcement..." style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
              <button onClick={handleAnnounce} disabled={announceSending || !announceText.trim()} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', whiteSpace: 'nowrap', background: announceSending ? 'var(--bg-secondary)' : 'var(--accent)', color: '#fff', cursor: 'pointer', opacity: announceSending || !announceText.trim() ? 0.6 : 1 }}>{announceSending ? 'Posting...' : 'Post'}</button>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-cyan-400" /><h3 className="text-sm font-semibold text-primary">Announcement History ({announcements.length})</h3></div>
            {announcements.length === 0 ? <p className="text-sm text-muted">No announcements yet.</p> : (
              <div className="space-y-2">
                {announcements.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm text-primary truncate">{a.message}</p>
                      <p className="text-[10px] text-muted mt-0.5">{a.createdBy} · {a.createdAt?.toDate?.()?.toLocaleString() || '—'}</p>
                    </div>
                    <button onClick={() => toggleAnnounce(a.id, a.active)} style={{
                      padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap',
                      background: a.active ? 'rgba(0,184,148,0.15)' : 'rgba(255,255,255,0.06)',
                      color: a.active ? '#00b894' : 'var(--text-muted)'
                    }}>{a.active ? 'Active' : 'Inactive'}</button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </>
      )}

      {/* User detail drawer */}
      {drawerUser && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setDrawerUser(null)}>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--bg-card)] border-l border-[var(--border-color)] shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-6"><h3 className="text-base font-semibold text-primary">User Details</h3><button onClick={() => setDrawerUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}><X size={18} /></button></div>
              <div className="space-y-4 text-sm">
                <div><p className="text-xs text-muted mb-0.5">UID</p><p className="text-primary font-mono text-[11px] break-all">{drawerUser.uid}</p></div>
                <div><p className="text-xs text-muted mb-0.5">Email</p><p className="text-primary">{drawerUser.email || '—'}</p></div>
                <div><p className="text-xs text-muted mb-0.5">Name</p><p className="text-primary">{drawerUser.displayName || '—'}</p></div>
                <div><p className="text-xs text-muted mb-0.5">Plan</p><p className="text-primary">{drawerUser.plan === 'premium_plus' ? '👑 Premium+' : drawerUser.plan === 'premium' ? '⭐ Premium' : 'Free'}</p></div>
                <div><p className="text-xs text-muted mb-0.5">Tokens</p><p className="text-primary">{getTokenDisplay(drawerUser)}</p></div>
                <div><p className="text-xs text-muted mb-0.5">Logins</p><p className="text-primary">{drawerUser.loginCount || 0}</p></div>
                <div><p className="text-xs text-muted mb-0.5">Role</p><p className="text-primary">{drawerUser.role || 'user'}</p></div>
                <div><p className="text-xs text-muted mb-0.5">Created</p><p className="text-primary">{drawerUser.createdAt?.toDate?.()?.toLocaleString() || drawerUser.createdAt || '—'}</p></div>
                <div><p className="text-xs text-muted mb-0.5">Last Active</p><p className="text-primary">{drawerUser.lastActiveAt?.toDate?.()?.toLocaleString() || '—'}</p></div>
                <div><p className="text-xs text-muted mb-0.5">Photo URL</p><p className="text-primary font-mono text-[11px] break-all">{drawerUser.photoURL || '—'}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email modal */}
      {emailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setEmailTarget(null)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 28, maxWidth: 520, width: '100%', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Email to {emailTarget.email}</h2>
              <button onClick={() => setEmailTarget(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, padding: 0 }}>✕</button>
            </div>
            {emailDone ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>Email saved. Copy it manually.</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button onClick={copyEmail} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Copy</button>
                  <button onClick={() => setEmailTarget(null)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }}>Done</button>
                </div>
              </div>
            ) : (
              <>
                <input style={inputStyle} placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
                <textarea style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }} placeholder="Email body..." value={emailBody} onChange={e => setEmailBody(e.target.value)} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button onClick={() => setEmailTarget(null)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleSendEmail} disabled={sending} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: sending ? 'var(--bg-secondary)' : 'var(--accent)', color: '#fff', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1 }}>{sending ? 'Saving...' : 'Save & Copy'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
