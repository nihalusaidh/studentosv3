import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/navigation/Sidebar'
import BottomNav from '../components/navigation/BottomNav'
import MobileHeader from '../components/navigation/MobileHeader'
import { useAuth } from '../contexts/AuthContext'
import { trackPageView, getSession, trackSessionEnd, trackEvent } from '../utils/analytics'

export default function MainLayout() {
  const { profile, user } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sessionRef = useRef(null)
  const lastPathRef = useRef('')
  const mountedRef = useRef(false)

  // Track login event
  useEffect(() => {
    if (profile?.uid && !mountedRef.current) {
      mountedRef.current = true
      trackEvent('login', profile).catch(() => {})
    }
  }, [profile?.uid])

  // Session + page tracking
  useEffect(() => {
    sessionRef.current = getSession()
    const path = location.pathname
    lastPathRef.current = path
    trackPageView(path, profile, sessionRef.current).catch(() => {})

    const handleBeforeUnload = () => {
      if (sessionRef.current) trackSessionEnd(sessionRef.current, profile)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    const path = location.pathname
    if (path !== lastPathRef.current) {
      lastPathRef.current = path
      trackPageView(path, profile, sessionRef.current).catch(() => {})
    }
  }, [location.pathname, profile])

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
