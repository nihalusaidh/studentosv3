const KEY = 'student-os-voice-recordings'

function get() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}

function set(data) { localStorage.setItem(KEY, JSON.stringify(data)) }

export function getRecordings() { return get() }

export function saveRecording(data) {
  const list = get()
  const entry = {
    id: `voice_${Date.now()}`,
    date: new Date().toISOString(),
    duration: data.duration || 0,
    transcription: data.transcription || '',
    notes: data.notes || '',
    title: data.title || `Recording ${list.length + 1}`,
    createdAt: new Date().toISOString()
  }
  list.unshift(entry)
  set(list)
  return entry
}

export function deleteRecording(id) {
  set(get().filter(r => r.id !== id))
}

export function updateRecording(id, data) {
  const list = get()
  const idx = list.findIndex(r => r.id === id)
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() }
    set(list)
  }
}
