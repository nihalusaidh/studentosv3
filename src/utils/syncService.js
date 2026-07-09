import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const SYNC_KEYS = ['student-os-attendance', 'student-os-semester-history', 'student-os-marks', 'student-os-calendar-events', 'student-os-calendar-holidays', 'student-os-calendar-reminders', 'student-os-tasks', 'student-os-exams']
const HASH_KEY = 'student-os-sync-hashes'
const META_KEY = 'student-os-sync-meta'

function getLocalData(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null } catch { return null }
}

function setLocalData(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function getHashes() {
  try { const r = localStorage.getItem(HASH_KEY); return r ? JSON.parse(r) : {} } catch { return {} }
}

function setHashes(hashes) {
  localStorage.setItem(HASH_KEY, JSON.stringify(hashes))
}

function computeHash(obj) {
  let s = JSON.stringify(obj)
  let hash = 0
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); hash = ((hash << 5) - hash) + c; hash |= 0 }
  return hash.toString(36)
}

function hasLocalChanges(key) {
  const data = getLocalData(key)
  if (data === null) return false
  const hashes = getHashes()
  const currentHash = computeHash(data)
  return hashes[key] !== currentHash
}

export function markSynced(key) {
  const data = getLocalData(key)
  if (data === null) return
  const hashes = getHashes()
  hashes[key] = computeHash(data)
  setHashes(hashes)
}

export function markAllSynced() {
  SYNC_KEYS.forEach(markSynced)
}

export async function syncToCloud(uid) {
  if (!uid) return { status: 'error', message: 'No user' }
  try {
    const changed = SYNC_KEYS.filter(key => hasLocalChanges(key))
    if (changed.length === 0) return { status: 'noop' }

    const promises = changed.map(key => {
      const data = getLocalData(key)
      if (data === null) return Promise.resolve()
      return setDoc(doc(db, 'users', uid, 'sync', key), { data, updatedAt: new Date().toISOString() })
    })

    promises.push(setDoc(doc(db, 'users', uid, 'sync', '_meta'), { lastSync: new Date().toISOString(), version: '1.0' }))
    await Promise.all(promises)
    changed.forEach(markSynced)
    return { status: 'synced', keys: changed }
  } catch (e) {
    return { status: 'error', message: e.message }
  }
}

export async function syncFromCloud(uid) {
  if (!uid) return { status: 'error', message: 'No user' }
  try {
    const promises = SYNC_KEYS.map(key =>
      getDoc(doc(db, 'users', uid, 'sync', key)).then(snap => {
        if (snap.exists()) {
          const cloudData = snap.data().data
          if (cloudData !== undefined) setLocalData(key, cloudData)
        }
      })
    )
    await Promise.all(promises)
    markAllSynced()
    return { status: 'restored' }
  } catch (e) {
    return { status: 'error', message: e.message }
  }
}

export async function getSyncStatus(uid) {
  if (!uid) return { status: 'offline' }
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'sync', '_meta'))
    if (!snap.exists()) return { status: 'never' }
    return { status: 'synced', lastSync: snap.data().lastSync }
  } catch {
    return { status: 'offline' }
  }
}

export function getPendingChanges() {
  return SYNC_KEYS.filter(key => hasLocalChanges(key)).length
}
