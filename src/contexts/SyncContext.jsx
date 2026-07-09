import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { syncToCloud, syncFromCloud, getSyncStatus, getPendingChanges } from '../utils/syncService'

const SyncContext = createContext(null)

const SYNC_INTERVAL = 30000

export function SyncProvider({ children }) {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState('idle')
  const [pendingChanges, setPendingChanges] = useState(0)
  const [lastSync, setLastSync] = useState(null)
  const intervalRef = useRef(null)
  const restoringRef = useRef(false)

  const refreshPending = useCallback(() => {
    setPendingChanges(getPendingChanges())
  }, [])

  const doSync = useCallback(async () => {
    if (!user || restoringRef.current) return
    setSyncStatus('syncing')
    const result = await syncToCloud(user.uid)
    if (result.status === 'synced' || result.status === 'noop') {
      setSyncStatus('synced')
      const status = await getSyncStatus(user.uid)
      if (status.lastSync) setLastSync(status.lastSync)
    } else if (result.status === 'error') {
      setSyncStatus('error')
    }
    refreshPending()
  }, [user, refreshPending])

  useEffect(() => {
    if (!user) {
      setSyncStatus('offline')
      setPendingChanges(0)
      return
    }

    restoringRef.current = true
    setSyncStatus('restoring')

    syncFromCloud(user.uid).then(async (result) => {
      restoringRef.current = false
      if (result.status === 'restored') {
        setSyncStatus('synced')
        const status = await getSyncStatus(user.uid)
        if (status.lastSync) setLastSync(status.lastSync)
      } else {
        setSyncStatus('error')
      }
      refreshPending()
    })

    return () => { restoringRef.current = false }
  }, [user, refreshPending])

  useEffect(() => {
    if (!user) return
    intervalRef.current = setInterval(doSync, SYNC_INTERVAL)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [user, doSync])

  return (
    <SyncContext.Provider value={{ syncStatus, pendingChanges, lastSync, doSync, refreshPending }}>
      {children}
    </SyncContext.Provider>
  )
}

export const useSync = () => useContext(SyncContext)
